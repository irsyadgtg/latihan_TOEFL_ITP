<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\UserProgress;
use App\Http\Controllers\UnitAccessController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Admin/Instruktur bisa lihat semua - TIDAK BERUBAH
        if ($user->role === 'instruktur' || $user->role === 'admin') {
            return Page::orderBy('modul')->orderBy('unit_number')->orderBy('order_number')->get();
        }

        // Peserta: gunakan UnitAccessController yang sudah terintegrasi
        if ($user->role === 'peserta') {
            // Get final unlocked units dari UnitAccessController
            $unitAccessController = new UnitAccessController();
            $unlockedResponse = $unitAccessController->getUnlockedUnits($request);
            $unlockedData = $unlockedResponse->getData(true);

            $finalUnlocked = $unlockedData['final_unlocked_units'];

            // Cek request modul spesifik untuk validasi
            $requestedModul = $request->query('modul');
            if ($requestedModul) {
                if (!in_array($requestedModul, ['listening', 'structure', 'reading'])) {
                    return response()->json(['error' => 'Modul tidak valid'], 400);
                }

                // Jika request unit spesifik juga
                $requestedUnit = $request->query('unit_number');
                if ($requestedUnit !== null) {
                    $requestedUnit = (int) $requestedUnit;
                    if (!in_array($requestedUnit, $finalUnlocked[$requestedModul])) {
                        return response()->json([
                            'error' => "Akses ditolak untuk {$requestedModul} unit {$requestedUnit}",
                            'available_units' => $finalUnlocked[$requestedModul],
                            'access_breakdown' => $unlockedData['breakdown'],
                            'reason' => 'Unit tidak tersedia dalam paket atau rencana belajar Anda'
                        ], 403);
                    }
                }
            }

            // Filter pages berdasarkan final unlocked units
            $accessiblePages = collect();

            foreach ($finalUnlocked as $modul => $units) {
                if (!empty($units)) {
                    $query = Page::where('modul', $modul)
                        ->whereIn('unit_number', $units)
                        ->orderBy('modul')
                        ->orderBy('unit_number')
                        ->orderBy('order_number');

                    // Apply filters if requested
                    if ($request->has('modul') && $request->modul === $modul) {
                        if ($request->has('unit_number')) {
                            $query->where('unit_number', $request->unit_number);
                        }
                    } elseif ($request->has('modul') && $request->modul !== $modul) {
                        continue; // Skip modul yang tidak diminta
                    }

                    $modulPages = $query->get();
                    $accessiblePages = $accessiblePages->merge($modulPages);
                }
            }

            Log::info('Peserta pages access', [
                'user_id' => $user->idPeserta,
                'requested_modul' => $requestedModul,
                'requested_unit' => $request->query('unit_number'),
                'final_unlocked' => $finalUnlocked,
                'accessible_pages_count' => $accessiblePages->count()
            ]);

            // Return collection yang akan di-serialize jadi array
            return $accessiblePages;
        }

        // Fallback untuk role lain
        return Page::orderBy('modul')->orderBy('unit_number')->orderBy('order_number')->get();
    }

    // HELPER: Get next order number for page within unit
    private function getNextPageOrderNumber($modul, $unitNumber)
    {
        $maxOrder = Page::where('modul', $modul)
            ->where('unit_number', $unitNumber)
            ->max('order_number');

        return ($maxOrder ?? 0) + 1;
    }

    // HELPER: Shift pages in unit
    private function shiftPagesInUnit($modul, $unitNumber, $fromOrder, $direction = 'up')
    {
        if ($direction === 'up') {
            // Close gap: shift pages down
            Page::where('modul', $modul)
                ->where('unit_number', $unitNumber)
                ->where('order_number', '>', $fromOrder)
                ->decrement('order_number');
        } else {
            // Make space: shift pages up
            Page::where('modul', $modul)
                ->where('unit_number', $unitNumber)
                ->where('order_number', '>=', $fromOrder)
                ->increment('order_number');
        }
    }

    // AUTO-COMPLETE student progress after content changes
    private function autoCompleteStudentProgress($modul, $unitNumber)
    {
        // Get all students who have progress in this unit
        $affectedUserIds = UserProgress::whereHas('page', function ($query) use ($modul, $unitNumber) {
            $query->where('modul', $modul)
                ->where('unit_number', $unitNumber);
        })
            ->distinct()
            ->pluck('idPengguna');

        $totalProcessed = 0;
        $totalAutoCompleted = 0;

        foreach ($affectedUserIds as $idPengguna) {
            $autoCompletedCount = $this->fillProgressGaps($idPengguna, $modul, $unitNumber);
            $totalAutoCompleted += $autoCompletedCount;
            $totalProcessed++;
        }

        Log::info('Auto-completed student progress after content change', [
            'modul' => $modul,
            'unit_number' => $unitNumber,
            'students_processed' => $totalProcessed,
            'total_pages_auto_completed' => $totalAutoCompleted
        ]);

        return [
            'students_processed' => $totalProcessed,
            'pages_auto_completed' => $totalAutoCompleted
        ];
    }

    // Fill progress gaps for specific user
    private function fillProgressGaps($idPengguna, $modul, $unitNumber)
    {
        // Get current page order in unit
        $currentPages = Page::where('modul', $modul)
            ->where('unit_number', $unitNumber)
            ->orderBy('order_number')
            ->get();

        if ($currentPages->isEmpty()) {
            return 0;
        }

        // Get user's completed page IDs
        $completedPageIds = UserProgress::where('idPengguna', $idPengguna)
            ->whereIn('page_id', $currentPages->pluck('id'))
            ->pluck('page_id')
            ->toArray();

        // Find the highest completed position
        $highestCompletedPosition = -1;
        foreach ($currentPages as $index => $page) {
            if (in_array($page->id, $completedPageIds)) {
                $highestCompletedPosition = $index;
            }
        }

        // Auto-complete all pages up to the highest completed position
        $autoCompletedCount = 0;
        if ($highestCompletedPosition >= 0) {
            for ($i = 0; $i <= $highestCompletedPosition; $i++) {
                $page = $currentPages[$i];

                // Only create if doesn't exist
                $created = UserProgress::updateOrCreate([
                    'idPengguna' => $idPengguna,
                    'page_id' => $page->id
                ]);

                if ($created->wasRecentlyCreated) {
                    $autoCompletedCount++;
                }
            }

            if ($autoCompletedCount > 0) {
                Log::info('Auto-completed progress gaps for user', [
                    'idPengguna' => $idPengguna,
                    'modul' => $modul,
                    'unit_number' => $unitNumber,
                    'pages_auto_completed' => $autoCompletedCount,
                    'total_progress_position' => $highestCompletedPosition + 1
                ]);
            }
        }

        return $autoCompletedCount;
    }

    // Clean up orphaned progress when page is deleted
    private function cleanupOrphanedProgress($pageId, $modul, $unitNumber)
    {
        // Remove progress records for the deleted page
        $deletedCount = UserProgress::where('page_id', $pageId)->count();
        UserProgress::where('page_id', $pageId)->delete();

        Log::info('Cleaned up orphaned progress records', [
            'deleted_page_id' => $pageId,
            'orphaned_records_removed' => $deletedCount,
            'modul' => $modul,
            'unit_number' => $unitNumber
        ]);

        return $deletedCount;
    }

    // Upload helper for compatibility
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,mp3,wav,ogg,mp4,webm|max:20480'
        ]);

        $path = $request->file('file')->store('attachments', 'public');

        return response()->json(['url' => Storage::url($path)]);  // ← SUDAH DIPERBAIKI
    }

    public function store(Request $request)
    {
        Log::info('=== PAGE STORE REQUEST ===', $request->except(['attachment']));

        try {
            $rules = [
                'modul' => 'required|in:listening,structure,reading',
                'unit_number' => 'required|integer|min:0',
                'title' => 'required|string',
                'description' => 'nullable|string',
                'order_number' => 'nullable|integer|min:1',
            ];

            if ($request->hasFile('attachment')) {
                $rules['attachment'] = 'nullable|file|mimes:jpg,jpeg,png,gif,mp3,wav,ogg,mp4,webm|max:20480';
            }

            $data = $request->validate($rules);

            // Auto-assign order_number if not provided
            if (!isset($data['order_number']) || $data['order_number'] === null) {
                $data['order_number'] = $this->getNextPageOrderNumber($data['modul'], $data['unit_number']);
            }

            // Handle file upload
            if ($request->hasFile('attachment')) {
                $path = $request->file('attachment')->store('attachments', 'public');
                $data['attachment'] = Storage::url($path);  // ← SUDAH DIPERBAIKI
            }
            return DB::transaction(function () use ($data) {
                // Make space for new page at target position
                $this->shiftPagesInUnit($data['modul'], $data['unit_number'], $data['order_number'], 'down');

                $page = Page::create($data);

                // Auto-complete student progress after adding new page
                $progressResult = $this->autoCompleteStudentProgress($data['modul'], $data['unit_number']);

                Log::info('Page created successfully with progress auto-complete', [
                    'id' => $page->id,
                    'order' => $page->order_number,
                    'unit' => $page->unit_number,
                    'progress_result' => $progressResult
                ]);

                return response()->json($page, 201);
            });
        } catch (\Exception $e) {
            Log::error('Page store failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create page: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        Log::info('=== PAGE UPDATE REQUEST ===', ['id' => $id, 'data' => $request->except(['attachment'])]);

        try {
            $page = Page::findOrFail($id);

            $rules = [
                'modul' => 'required|in:listening,structure,reading',
                'unit_number' => 'required|integer|min:0',
                'title' => 'required|string',
                'description' => 'nullable|string',
                'order_number' => 'required|integer|min:1',
            ];

            if ($request->hasFile('attachment')) {
                $rules['attachment'] = 'nullable|file|mimes:jpg,jpeg,png,gif,mp3,wav,ogg,mp4,webm|max:20480';
            }

            $data = $request->validate($rules);

            // Handle file upload
            if ($request->hasFile('attachment')) {
                $path = $request->file('attachment')->store('attachments', 'public');
                $data['attachment'] = Storage::url($path);  // ← SUDAH DIPERBAIKI
            }

            return DB::transaction(function () use ($page, $data) {
                $oldOrder = $page->order_number;
                $newOrder = $data['order_number'];
                $modul = $page->modul;
                $unitNumber = $page->unit_number;

                // Handle order change if needed
                if ($oldOrder != $newOrder) {
                    Log::info('Page order change detected', [
                        'page_id' => $page->id,
                        'old_order' => $oldOrder,
                        'new_order' => $newOrder,
                        'unit' => $unitNumber
                    ]);

                    if ($newOrder > $oldOrder) {
                        // Moving down: shift pages up to fill gap, then move to position
                        Page::where('modul', $modul)
                            ->where('unit_number', $unitNumber)
                            ->where('order_number', '>', $oldOrder)
                            ->where('order_number', '<=', $newOrder)
                            ->where('id', '!=', $page->id)
                            ->decrement('order_number');
                    } else {
                        // Moving up: shift pages down to make space, then move to position
                        Page::where('modul', $modul)
                            ->where('unit_number', $unitNumber)
                            ->where('order_number', '>=', $newOrder)
                            ->where('order_number', '<', $oldOrder)
                            ->where('id', '!=', $page->id)
                            ->increment('order_number');
                    }

                    // Set new order for the page being moved
                    $data['order_number'] = $newOrder;
                }

                // Update page with all data
                $page->update($data);

                // Auto-complete student progress if order changed
                $progressResult = null;
                if ($oldOrder != $newOrder) {
                    $progressResult = $this->autoCompleteStudentProgress($modul, $unitNumber);
                }

                Log::info('Page updated successfully', [
                    'id' => $page->id,
                    'order_change' => $oldOrder != $newOrder,
                    'old_order' => $oldOrder,
                    'new_order' => $newOrder,
                    'progress_result' => $progressResult
                ]);

                return response()->json([
                    'page' => $page,
                    'progress_auto_completed' => $progressResult
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Page update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update page: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        Log::info('=== PAGE DELETE REQUEST ===', ['id' => $id]);

        try {
            return DB::transaction(function () use ($id) {
                $page = Page::findOrFail($id);
                $modul = $page->modul;
                $unitNumber = $page->unit_number;
                $orderNumber = $page->order_number;

                // Clean up orphaned progress before deletion
                $cleanupResult = $this->cleanupOrphanedProgress($id, $modul, $unitNumber);

                // Delete the page
                $page->delete();

                // Close gap by shifting remaining pages
                if ($orderNumber) {
                    $this->shiftPagesInUnit($modul, $unitNumber, $orderNumber, 'up');
                }

                // Auto-complete remaining student progress after deletion
                $progressResult = $this->autoCompleteStudentProgress($modul, $unitNumber);

                Log::info('Page deleted successfully with progress cleanup', [
                    'id' => $id,
                    'unit' => $unitNumber,
                    'order' => $orderNumber,
                    'orphaned_records_cleaned' => $cleanupResult,
                    'progress_result' => $progressResult
                ]);

                return response()->json([
                    'message' => 'Page deleted successfully',
                    'cleanup_result' => [
                        'orphaned_records_removed' => $cleanupResult,
                        'students_processed' => $progressResult['students_processed'],
                        'pages_auto_completed' => $progressResult['pages_auto_completed']
                    ]
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Page delete failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete page: ' . $e->getMessage()], 500);
        }
    }
}
