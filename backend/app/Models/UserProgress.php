<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProgress extends Model
{
    use HasFactory;

    protected $table = 'user_progress';
    
    protected $fillable = [
        'idPengguna',
        'page_id'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'idPengguna', 'idPengguna');
    }

    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    // Helper: Check if user completed specific page
    public static function isPageCompleted($idPengguna, $pageId)
    {
        return self::where('idPengguna', $idPengguna)
                   ->where('page_id', $pageId)
                   ->exists();
    }

    // Helper: Get completed pages for user in specific unit
    public static function getCompletedPagesInUnit($idPengguna, $modul, $unitNumber)
    {
        return self::whereHas('page', function ($query) use ($modul, $unitNumber) {
                    $query->where('modul', $modul)
                          ->where('unit_number', $unitNumber);
                })
                ->where('idPengguna', $idPengguna)
                ->with('page')
                ->get()
                ->pluck('page.id')
                ->toArray();
    }

    // Helper: Check if user can access quiz (all pages completed)
    public static function canAccessQuiz($idPengguna, $modul, $unitNumber)
    {
        // Get total pages in unit
        $totalPages = \App\Models\Page::where('modul', $modul)
                                     ->where('unit_number', $unitNumber)
                                     ->count();

        if ($totalPages === 0) {
            return true; // No pages means can access quiz
        }

        // Get completed pages count
        $completedPages = self::whereHas('page', function ($query) use ($modul, $unitNumber) {
                                $query->where('modul', $modul)
                                      ->where('unit_number', $unitNumber);
                            })
                            ->where('idPengguna', $idPengguna)
                            ->count();

        return $completedPages >= $totalPages;
    }

    // Helper: Get next required page for sequential access
    public static function getNextRequiredPage($idPengguna, $modul, $unitNumber)
    {
        $allPages = \App\Models\Page::where('modul', $modul)
                                   ->where('unit_number', $unitNumber)
                                   ->orderBy('order_number')
                                   ->get();

        if ($allPages->isEmpty()) {
            return null;
        }

        $completedPageIds = self::getCompletedPagesInUnit($idPengguna, $modul, $unitNumber);

        // Find first non-completed page
        foreach ($allPages as $page) {
            if (!in_array($page->id, $completedPageIds)) {
                return $page;
            }
        }

        return null; // All pages completed
    }
}