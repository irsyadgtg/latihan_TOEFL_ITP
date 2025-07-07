<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UnitAccessController extends Controller
{
    /**
     * Get package bonus units for specific user
     */
    private function getPackageBonusUnits($user)
    {
        if ($user->role !== 'peserta') {
            // Admin/instruktur dapat full access semua unit
            return [
                'listening' => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                'structure' => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                'reading' => [0, 1, 2, 3, 4, 5, 6]
            ];
        }

        // 1. Cek paket aktif
        $pesertaPaket = $user->peserta->pesertaPaket()
            ->where('paketSaatIni', true)
            ->where('statusAktif', true)
            ->first();

        if (!$pesertaPaket || !$pesertaPaket->paket) {
            return [
                'listening' => [],
                'structure' => [],
                'reading' => []
            ];
        }

        // 2. Parse fasilitas paket
        $fasilitas = $pesertaPaket->paket->fasilitas;
        $packageUnits = [
            'listening' => [],
            'structure' => [],
            'reading' => []
        ];

        // 3. Cek setiap modul apakah ada di fasilitas
        if (strpos($fasilitas, 'listening') !== false) {
            $packageUnits['listening'] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        }

        if (strpos($fasilitas, 'structure') !== false) {
            $packageUnits['structure'] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        }

        if (strpos($fasilitas, 'reading') !== false) {
            $packageUnits['reading'] = [0, 1, 2, 3, 4, 5, 6];
        }

        return $packageUnits;
    }

    /**
     * Get package info for response
     */
    private function getPackageInfo($user)
    {
        if ($user->role !== 'peserta') {
            return [
                'has_active_package' => true,
                'package_name' => 'Full Access (Admin/Instruktur)',
                'package_facilities' => 'listening,structure,reading,konsultasi,simulasi',
                'expires_at' => null
            ];
        }

        $pesertaPaket = $user->peserta->pesertaPaket()
            ->where('paketSaatIni', true)
            ->where('statusAktif', true)
            ->first();

        if (!$pesertaPaket || !$pesertaPaket->paket) {
            return [
                'has_active_package' => false,
                'package_name' => null,
                'package_facilities' => null,
                'expires_at' => null
            ];
        }

        return [
            'has_active_package' => true,
            'package_name' => $pesertaPaket->paket->namaPaket,
            'package_facilities' => $pesertaPaket->paket->fasilitas,
            'expires_at' => $pesertaPaket->tglBerakhir
        ];
    }

    /**
     * Get base unlocked units from feedback
     */
    private function getBaseUnlockedFromFeedback($user)
    {
        // Instructor/admin have full access from feedback
        if ($user->role === 'instruktur' || $user->role === 'admin') {
            return [
                'listening' => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                'structure' => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                'reading' => [0, 1, 2, 3, 4, 5, 6]
            ];
        }

        // Default minimal access (unit 0 - overview)
        $baseUnlocked = [
            'listening' => [0],
            'structure' => [0],
            'reading' => [0]
        ];

        if ($user->role !== 'peserta') {
            return $baseUnlocked;
        }

        // Cari feedback rencana belajar aktif terbaru
        $activeFeedback = DB::table('feedback_rencana_belajar as fb')
            ->join('pengajuan_rencana_belajar as prb', 'fb.idPengajuanRencanaBelajar', '=', 'prb.idPengajuanRencanaBelajar')
            ->where('prb.idPeserta', $user->idPeserta)
            ->where('prb.status', 'sudah ada feedback')
            ->where('prb.isAktif', true)
            ->whereDate('prb.selesaiPada', '>=', Carbon::now())
            ->orderBy('fb.tglPemberianFeedback', 'desc')
            ->select('fb.idFeedbackRencanaBelajar', 'prb.namaRencana', 'prb.selesaiPada')
            ->first();

        if (!$activeFeedback) {
            return $baseUnlocked;
        }

        // Ambil skill yang diterima dari feedback
        $feedbackSkills = DB::table('detail_feedback_rencana_belajar as dfb')
            ->join('skill as s', 'dfb.idSkill', '=', 's.idSkill')
            ->where('dfb.idFeedbackRencanaBelajar', $activeFeedback->idFeedbackRencanaBelajar)
            ->select('s.idSkill', 's.kategori', 's.skill')
            ->get();

        if ($feedbackSkills->isEmpty()) {
            return $baseUnlocked;
        }

        // Mapping skill ID ke unit yang ter-unlock
        return $this->mapSkillsToUnits($feedbackSkills->pluck('idSkill')->toArray());
    }

    /**
     * Get feedback info for response
     */
    private function getFeedbackInfo($user)
    {
        if ($user->role !== 'peserta') {
            return [
                'has_active_feedback' => true,
                'plan_name' => 'Full Access (Admin/Instruktur)',
                'expires_at' => null,
                'skills_count' => 26
            ];
        }

        $activeFeedback = DB::table('feedback_rencana_belajar as fb')
            ->join('pengajuan_rencana_belajar as prb', 'fb.idPengajuanRencanaBelajar', '=', 'prb.idPengajuanRencanaBelajar')
            ->where('prb.idPeserta', $user->idPeserta)
            ->where('prb.status', 'sudah ada feedback')
            ->where('prb.isAktif', true)
            ->whereDate('prb.selesaiPada', '>=', Carbon::now())
            ->orderBy('fb.tglPemberianFeedback', 'desc')
            ->select('fb.idFeedbackRencanaBelajar', 'prb.namaRencana', 'prb.selesaiPada')
            ->first();

        if (!$activeFeedback) {
            return [
                'has_active_feedback' => false,
                'plan_name' => null,
                'expires_at' => null,
                'skills_count' => 0
            ];
        }

        $skillsCount = DB::table('detail_feedback_rencana_belajar')
            ->where('idFeedbackRencanaBelajar', $activeFeedback->idFeedbackRencanaBelajar)
            ->count();

        return [
            'has_active_feedback' => true,
            'plan_name' => $activeFeedback->namaRencana,
            'expires_at' => $activeFeedback->selesaiPada,
            'skills_count' => $skillsCount
        ];
    }

    /**
     * MAIN METHOD: Get unlocked units dengan breakdown rencana belajar + paket
     */
    public function getUnlockedUnits(Request $request)
    {
        $user = Auth::user();

        // STEP 1: Get base access dari rencana belajar
        $baseUnlocked = $this->getBaseUnlockedFromFeedback($user);

        // STEP 2: Get bonus access dari paket
        $packageBonus = $this->getPackageBonusUnits($user);

        // STEP 3: Merge base + bonus (PRIORITY: rencana belajar + paket)
        $finalUnlocked = [
            'listening' => array_unique(array_merge(
                $baseUnlocked['listening'],
                $packageBonus['listening']
            )),
            'structure' => array_unique(array_merge(
                $baseUnlocked['structure'],
                $packageBonus['structure']
            )),
            'reading' => array_unique(array_merge(
                $baseUnlocked['reading'],
                $packageBonus['reading']
            ))
        ];

        // Sort all units
        sort($finalUnlocked['listening']);
        sort($finalUnlocked['structure']);
        sort($finalUnlocked['reading']);

        // Get additional info
        $feedbackInfo = $this->getFeedbackInfo($user);
        $packageInfo = $this->getPackageInfo($user);

        // RETURN FORMAT: Compatible dengan PageController existing + breakdown baru
        return response()->json([
            // Format lama untuk backward compatibility
            'unlocked_units' => $finalUnlocked,
            'has_active_feedback' => $feedbackInfo['has_active_feedback'],
            'feedback_skills' => [], // Simplified
            'message' => 'Units unlocked from both learning plan and active package',

            // Format baru dengan breakdown detail - PERBAIKAN DI SINI
            'final_unlocked_units' => $finalUnlocked,
            'breakdown' => [
                'from_rencana_belajar' => [
                    'units' => $baseUnlocked, // DATA ASLI dari rencana belajar
                    'has_active_feedback' => $feedbackInfo['has_active_feedback'],
                    'feedback_info' => $feedbackInfo
                ],
                'from_paket' => [
                    'units' => $packageBonus, // DATA ASLI dari paket
                    'package_info' => $packageInfo
                ]
            ],
            'access_summary' => [
                'total_listening_units' => count($finalUnlocked['listening']),
                'total_structure_units' => count($finalUnlocked['structure']),
                'total_reading_units' => count($finalUnlocked['reading']),
                'access_sources' => [
                    'rencana_belajar' => $feedbackInfo['has_active_feedback'],
                    'paket_aktif' => $packageInfo['has_active_package']
                ]
            ]
        ]);
    }

    /**
     * Map skill IDs to unlocked units
     */
    private function mapSkillsToUnits($skillIds)
    {
        $unlocked = [
            'listening' => [0], // Overview selalu bisa diakses
            'structure' => [0],
            'reading' => [0]
        ];

        foreach ($skillIds as $skillId) {
            // Listening: skill 1-10 → unit 1-10
            if ($skillId >= 1 && $skillId <= 10) {
                $unitNumber = $skillId; // skill 1 → unit 1, skill 2 → unit 2, dst
                if (!in_array($unitNumber, $unlocked['listening'])) {
                    $unlocked['listening'][] = $unitNumber;
                }
            }
            // Structure: skill 11-20 → unit 1-10
            elseif ($skillId >= 11 && $skillId <= 20) {
                $unitNumber = $skillId - 10; // skill 11 → unit 1, skill 12 → unit 2, dst
                if (!in_array($unitNumber, $unlocked['structure'])) {
                    $unlocked['structure'][] = $unitNumber;
                }
            }
            // Reading: skill 21-26 → unit 1-6
            elseif ($skillId >= 21 && $skillId <= 26) {
                $unitNumber = $skillId - 20; // skill 21 → unit 1, skill 22 → unit 2, ..., skill 26 → unit 6
                if (!in_array($unitNumber, $unlocked['reading'])) {
                    $unlocked['reading'][] = $unitNumber;
                }
            }
        }

        // Sort units
        sort($unlocked['listening']);
        sort($unlocked['structure']);
        sort($unlocked['reading']);

        return $unlocked;
    }

    /**
     * Check if peserta can access specific unit
     */
    public function checkUnitAccess(Request $request)
    {
        $modul = $request->input('modul');
        $unitNumber = (int) $request->input('unit_number');

        $unlockedResponse = $this->getUnlockedUnits($request);
        $unlockedData = $unlockedResponse->getData(true);

        $canAccess = in_array($unitNumber, $unlockedData['final_unlocked_units'][$modul] ?? []);

        return response()->json([
            'can_access' => $canAccess,
            'modul' => $modul,
            'unit_number' => $unitNumber,
            'unlocked_units' => $unlockedData['final_unlocked_units'][$modul] ?? [],
            'access_breakdown' => $unlockedData['breakdown'],
            'message' => $canAccess ?
                "Access granted to {$modul} unit {$unitNumber}" :
                "Access denied to {$modul} unit {$unitNumber}. Check your learning plan and package."
        ]);
    }
}
