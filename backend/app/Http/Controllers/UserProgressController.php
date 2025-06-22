<?php

namespace App\Http\Controllers;

use App\Models\UserProgress;
use App\Models\Page;
use App\Http\Controllers\UnitAccessController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UserProgressController extends Controller
{
    // Route: POST /pages/{pageId}/complete
    public function markComplete(Request $request, $pageId)
    {
        try {
            $user = Auth::user();
            $page = Page::findOrFail($pageId);
            
            // Admin/Instruktur bisa complete semua - TIDAK BERUBAH
            if ($user->role === 'instruktur' || $user->role === 'admin') {
                $progress = UserProgress::updateOrCreate([
                    'idPengguna' => $user->idPengguna,
                    'page_id' => $pageId
                ]);

                Log::info('Page marked complete', [
                    'idPengguna' => $user->idPengguna,
                    'page_id' => $pageId,
                    'page_title' => $page->title
                ]);

                return response()->json([
                    'success' => true,
                    'progress' => $progress,
                    'can_access_quiz' => UserProgress::canAccessQuiz($user->idPengguna, $page->modul, $page->unit_number)
                ]);
            }
            
            // Peserta: Validasi akses unit
            if ($user->role === 'peserta') {
                // Cek apakah student bisa akses unit ini
                $unitAccessController = new UnitAccessController();
                $accessRequest = new Request(['modul' => $page->modul, 'unit_number' => $page->unit_number]);
                $accessResponse = $unitAccessController->checkUnitAccess($accessRequest);
                $accessData = $accessResponse->getData(true);
                
                if (!$accessData['can_access']) {
                    return response()->json([
                        'error' => 'Access denied to this page',
                        'message' => 'You cannot access this unit based on your learning plan'
                    ], 403);
                }
                
                // Cek sequential access (harus complete page sebelumnya dulu) - TIDAK BERUBAH
                if (!$this->canUserAccessPage($user->idPengguna, $page)) {
                    return response()->json([
                        'error' => 'You must complete previous pages first',
                        'next_required' => $this->getNextRequiredPageInfo($user->idPengguna, $page->modul, $page->unit_number)
                    ], 403);
                }
                
                // Bisa complete - TIDAK BERUBAH
                $progress = UserProgress::updateOrCreate([
                    'idPengguna' => $user->idPengguna,
                    'page_id' => $pageId
                ]);

                Log::info('Page marked complete', [
                    'idPengguna' => $user->idPengguna,
                    'page_id' => $pageId,
                    'page_title' => $page->title
                ]);

                return response()->json([
                    'success' => true,
                    'progress' => $progress,
                    'can_access_quiz' => UserProgress::canAccessQuiz($user->idPengguna, $page->modul, $page->unit_number)
                ]);
            }

            // Fallback untuk role lain - TIDAK BERUBAH
            $idPengguna = Auth::id();

            // Check if user can access this page (sequential requirement)
            if (!$this->canUserAccessPage($idPengguna, $page)) {
                return response()->json([
                    'error' => 'You must complete previous pages first',
                    'next_required' => $this->getNextRequiredPageInfo($idPengguna, $page->modul, $page->unit_number)
                ], 403);
            }

            // Create or get existing progress record
            $progress = UserProgress::updateOrCreate([
                'idPengguna' => $idPengguna,
                'page_id' => $pageId
            ]);

            Log::info('Page marked complete', [
                'idPengguna' => $idPengguna,
                'page_id' => $pageId,
                'page_title' => $page->title
            ]);

            return response()->json([
                'success' => true,
                'progress' => $progress,
                'can_access_quiz' => UserProgress::canAccessQuiz($idPengguna, $page->modul, $page->unit_number)
            ]);

        } catch (\Exception $e) {
            Log::error('Mark complete failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to mark page complete'], 500);
        }
    }

    // Route: GET /progress/unit
    public function getUnitProgress(Request $request)
    {
        try {
            $request->validate([
                'modul' => 'required|in:listening,structure,reading',
                'unit_number' => 'required|integer|min:0'
            ]);

            $idPengguna = Auth::id();
            $modul = $request->modul;
            $unitNumber = $request->unit_number;

            $completedPageIds = UserProgress::getCompletedPagesInUnit($idPengguna, $modul, $unitNumber);
            $canAccessQuiz = UserProgress::canAccessQuiz($idPengguna, $modul, $unitNumber);
            $nextRequiredPage = UserProgress::getNextRequiredPage($idPengguna, $modul, $unitNumber);

            return response()->json([
                'completed_pages' => $completedPageIds,
                'can_access_quiz' => $canAccessQuiz,
                'next_required_page' => $nextRequiredPage ? [
                    'id' => $nextRequiredPage->id,
                    'title' => $nextRequiredPage->title,
                    'order_number' => $nextRequiredPage->order_number
                ] : null
            ]);

        } catch (\Exception $e) {
            Log::error('Get unit progress failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get progress'], 500);
        }
    }

    // HELPER: Check if user can access specific page (used internally)
    private function canUserAccessPage($idPengguna, $page)
    {
        // Instructor/Admin can access any page - TIDAK BERUBAH
        $user = Auth::user();
        if ($user->role === 'instruktur' || $user->role === 'admin') {
            return true;
        }

        // Get all pages in same unit, ordered - TIDAK BERUBAH
        $allPages = Page::where('modul', $page->modul)
                       ->where('unit_number', $page->unit_number)
                       ->orderBy('order_number')
                       ->get();

        if ($allPages->isEmpty()) {
            return true;
        }

        // Find current page position - TIDAK BERUBAH
        $currentPageIndex = $allPages->search(function($p) use ($page) {
            return $p->id === $page->id;
        });

        if ($currentPageIndex === false) {
            return false;
        }

        // Check if all previous pages are completed - TIDAK BERUBAH
        for ($i = 0; $i < $currentPageIndex; $i++) {
            $previousPage = $allPages[$i];
            if (!UserProgress::isPageCompleted($idPengguna, $previousPage->id)) {
                return false;
            }
        }

        return true;
    }

    // HELPER: Get next required page info (used internally)
    private function getNextRequiredPageInfo($idPengguna, $modul, $unitNumber)
    {
        $nextPage = UserProgress::getNextRequiredPage($idPengguna, $modul, $unitNumber);
        
        if (!$nextPage) {
            return null;
        }

        return [
            'id' => $nextPage->id,
            'title' => $nextPage->title,
            'order_number' => $nextPage->order_number
        ];
    }
}