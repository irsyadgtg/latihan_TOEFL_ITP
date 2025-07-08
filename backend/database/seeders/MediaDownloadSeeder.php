<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Exception;

class MediaDownloadSeeder extends Seeder
{
    private $folderId = '1Bx4kzJMqevUHbGoy165CYEMjc-cu6m1z';
    
    private $expectedFiles = [
        'audio.mp3' => [
            'type' => 'audio',
            'size_estimate_mb' => 5,
            'description' => 'TOEFL listening audio sample'
        ],
        'video.mp4' => [
            'type' => 'video',
            'size_estimate_mb' => 15,
            'description' => 'TOEFL instructional video'
        ],
        'image.jpg' => [
            'type' => 'image',
            'size_estimate_mb' => 2,
            'description' => 'TOEFL chart/diagram image'
        ]
    ];

    public function run(): void
    {
        $this->command->info('Starting media download from Google Drive...');
        
        // Ensure storage symlink exists
        $this->ensureStorageLink();
        
        // Create attachments directory
        $this->createAttachmentsDirectory();
        
        // Check if files already exist
        if ($this->filesAlreadyExist()) {
            $this->command->info('Media files already exist, skipping download');
            return;
        }
        
        // Download files from Google Drive folder
        $this->downloadFilesFromFolder();
        
        // Verify downloaded files
        $this->verifyDownloadedFiles();
        
        $this->command->info('Media download completed successfully');
    }

    private function ensureStorageLink()
    {
        $publicStoragePath = public_path('storage');
        $storageAppPublicPath = storage_path('app/public');
        
        if (!file_exists($publicStoragePath)) {
            $this->command->info('Creating storage symlink...');
            if (PHP_OS_FAMILY === 'Windows') {
                exec("mklink /D \"$publicStoragePath\" \"$storageAppPublicPath\"");
            } else {
                symlink($storageAppPublicPath, $publicStoragePath);
            }
        }
    }

    private function createAttachmentsDirectory()
    {
        Storage::disk('public')->makeDirectory('attachments');
        $this->command->info('Created attachments directory');
    }

    private function filesAlreadyExist()
    {
        foreach ($this->expectedFiles as $filename => $info) {
            if (!Storage::disk('public')->exists("attachments/{$filename}")) {
                return false;
            }
        }
        return true;
    }

    private function downloadFilesFromFolder()
    {
        $this->command->info('Attempting to discover files in Google Drive folder...');
        
        // Get folder contents (simplified approach)
        $folderUrl = "https://drive.google.com/drive/folders/{$this->folderId}";
        
        try {
            // Try to get folder HTML page
            $response = Http::timeout(30)->get($folderUrl);
            
            if ($response->successful()) {
                $html = $response->body();
                $fileIds = $this->extractFileIdsFromHtml($html);
                
                if (!empty($fileIds)) {
                    foreach ($fileIds as $filename => $fileId) {
                        $this->downloadFileFromDrive($filename, $fileId);
                    }
                } else {
                    $this->command->warn('Could not extract file IDs from folder. Using fallback method...');
                    $this->createFallbackFiles();
                }
            } else {
                $this->command->warn('Could not access Google Drive folder. Using fallback files...');
                $this->createFallbackFiles();
            }
        } catch (Exception $e) {
            $this->command->error("Error accessing Google Drive: {$e->getMessage()}");
            $this->command->info('Creating fallback dummy files...');
            $this->createFallbackFiles();
        }
    }

    private function extractFileIdsFromHtml($html)
    {
        $fileIds = [];
        
        // Extract file IDs from HTML (simplified regex approach)
        foreach ($this->expectedFiles as $filename => $info) {
            $pattern = '/data-id="([^"]+)"[^>]*>' . preg_quote($filename, '/') . '/i';
            if (preg_match($pattern, $html, $matches)) {
                $fileIds[$filename] = $matches[1];
            }
        }
        
        // Alternative pattern for different HTML structure
        if (empty($fileIds)) {
            preg_match_all('/\["([^"]+)","([^"]+\.(?:mp3|mp4|jpg))"/', $html, $matches, PREG_SET_ORDER);
            foreach ($matches as $match) {
                $fileId = $match[1];
                $filename = $match[2];
                if (array_key_exists($filename, $this->expectedFiles)) {
                    $fileIds[$filename] = $fileId;
                }
            }
        }
        
        return $fileIds;
    }

    private function downloadFileFromDrive($filename, $fileId)
    {
        try {
            $info = $this->expectedFiles[$filename];
            $this->command->info("Downloading {$filename} ({$info['description']})...");
            
            // Google Drive direct download URL
            $downloadUrl = "https://drive.google.com/uc?export=download&id={$fileId}";
            
            // Calculate timeout based on estimated file size
            $timeoutSeconds = max(60, $info['size_estimate_mb'] * 10);
            
            $response = Http::timeout($timeoutSeconds)
                          ->withOptions(['verify' => false])
                          ->get($downloadUrl);
            
            if ($response->successful()) {
                $content = $response->body();
                
                // Verify content is not an error page
                if ($this->isValidFileContent($content, $info['type'])) {
                    Storage::disk('public')->put("attachments/{$filename}", $content);
                    $this->command->info("Successfully downloaded {$filename}");
                } else {
                    throw new Exception('Downloaded content appears to be invalid');
                }
            } else {
                throw new Exception("HTTP {$response->status()}: {$response->body()}");
            }
        } catch (Exception $e) {
            $this->command->warn("Failed to download {$filename}: {$e->getMessage()}");
            $this->command->info("Creating fallback file for {$filename}...");
            $this->createFallbackFile($filename);
        }
    }

    private function isValidFileContent($content, $type)
    {
        // Basic content validation
        if (strlen($content) < 1000) {
            return false; // Too small to be a real media file
        }
        
        // Check for Google Drive error indicators
        if (strpos($content, 'Google Drive') !== false && strpos($content, 'error') !== false) {
            return false;
        }
        
        // Check file signatures
        switch ($type) {
            case 'audio':
                return strpos($content, 'ID3') === 0 || substr($content, 0, 4) === 'RIFF';
            case 'video':
                return substr($content, 4, 4) === 'ftyp' || substr($content, 0, 4) === 'RIFF';
            case 'image':
                return substr($content, 0, 2) === "\xFF\xD8" || substr($content, 0, 8) === "\x89PNG\x0D\x0A\x1A\x0A";
            default:
                return true;
        }
    }

    private function createFallbackFiles()
    {
        foreach ($this->expectedFiles as $filename => $info) {
            if (!Storage::disk('public')->exists("attachments/{$filename}")) {
                $this->createFallbackFile($filename);
            }
        }
    }

    private function createFallbackFile($filename)
    {
        $info = $this->expectedFiles[$filename];
        
        switch ($info['type']) {
            case 'audio':
                $content = $this->generateDummyAudio();
                break;
            case 'video':
                $content = $this->generateDummyVideo();
                break;
            case 'image':
                $content = $this->generateDummyImage();
                break;
            default:
                $content = 'dummy content';
        }
        
        Storage::disk('public')->put("attachments/{$filename}", $content);
        $this->command->info("Created fallback {$filename}");
    }

    private function verifyDownloadedFiles()
    {
        $this->command->info('Verifying downloaded files...');
        
        foreach ($this->expectedFiles as $filename => $info) {
            if (Storage::disk('public')->exists("attachments/{$filename}")) {
                $size = Storage::disk('public')->size("attachments/{$filename}");
                $sizeKB = round($size / 1024, 2);
                $this->command->info("- {$filename}: {$sizeKB} KB");
            } else {
                $this->command->error("- {$filename}: NOT FOUND");
            }
        }
        
        // Test file accessibility via URL
        $this->testFileAccessibility();
    }

    private function testFileAccessibility()
    {
        $baseUrl = config('app.url');
        
        foreach ($this->expectedFiles as $filename => $info) {
            $url = "{$baseUrl}/storage/attachments/{$filename}";
            
            try {
                $response = Http::timeout(10)->get($url);
                if ($response->successful()) {
                    $this->command->info("- {$filename} accessible at: {$url}");
                } else {
                    $this->command->warn("- {$filename} not accessible via URL (check storage:link)");
                }
            } catch (Exception $e) {
                $this->command->warn("- Could not test {$filename} accessibility");
            }
        }
    }

    // Generate dummy media files
    private function generateDummyAudio()
    {
        // Simple WAV file header for 2 seconds of silence
        $header = base64_decode('UklGRiQBAABXQVZFZm10IBAAAAABAAEA');
        $data = str_repeat("\x00", 1000); // Silent audio data
        return $header . $data;
    }

    private function generateDummyVideo()
    {
        // Minimal MP4 file header (base64 encoded)
        return base64_decode('AAAAGGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDE=');
    }

    private function generateDummyImage()
    {
        // 1x1 pixel transparent PNG (base64 encoded)
        return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }
}