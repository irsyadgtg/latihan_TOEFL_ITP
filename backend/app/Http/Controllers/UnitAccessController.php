<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UnitAccessController extends Controller
{
    /**
     * Get unlocked units based on peserta's received skills from feedback
     */
    public function getUnlockedUnits(Request $request)
    {
        $user = Auth::user();
        
        // Instructor bisa akses semua unit
        if ($user->role === 'instruktur' || $user->role === 'admin') {
            return response()->json([
                'unlocked_units' => [
                    'listening' => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    'structure' => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 
                    'reading' => [0, 1, 2, 3, 4, 5, 6]
                ],
                'has_active_feedback' => true,
                'feedback_skills' => [],
                'message' => 'Instructor has full access to all units'
            ]);
        }

        // Peserta harus punya feedback rencana belajar aktif
        if ($user->role !== 'peserta') {
            return response()->json([
                'unlocked_units' => [
                    'listening' => [0],
                    'structure' => [0],
                    'reading' => [0]
                ],
                'has_active_feedback' => false,
                'feedback_skills' => [],
                'message' => 'Invalid user role'
            ], 403);
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
            return response()->json([
                'unlocked_units' => [
                    'listening' => [0],
                    'structure' => [0],
                    'reading' => [0]
                ],
                'has_active_feedback' => false,
                'feedback_skills' => [],
                'message' => 'No active learning plan feedback found. You can only access unit overview.'
            ]);
        }

        // Ambil skill yang diterima dari feedback
        $feedbackSkills = DB::table('detail_feedback_rencana_belajar as dfb')
            ->join('skill as s', 'dfb.idSkill', '=', 's.idSkill')
            ->where('dfb.idFeedbackRencanaBelajar', $activeFeedback->idFeedbackRencanaBelajar)
            ->select('s.idSkill', 's.kategori', 's.skill')
            ->get();

        if ($feedbackSkills->isEmpty()) {
            return response()->json([
                'unlocked_units' => [
                    'listening' => [0],
                    'structure' => [0],
                    'reading' => [0]
                ],
                'has_active_feedback' => true,
                'feedback_skills' => [],
                'message' => 'No skills found in your current feedback'
            ]);
        }

        // Mapping skill ID ke unit yang ter-unlock
        $unlockedUnits = $this->mapSkillsToUnits($feedbackSkills->pluck('idSkill')->toArray());

        return response()->json([
            'unlocked_units' => $unlockedUnits,
            'has_active_feedback' => true,
            'feedback_skills' => $feedbackSkills->toArray(),
            'feedback_info' => [
                'plan_name' => $activeFeedback->namaRencana,
                'expires_at' => $activeFeedback->selesaiPada
            ],
            'message' => 'Units unlocked based on your learning plan skills'
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

        $canAccess = in_array($unitNumber, $unlockedData['unlocked_units'][$modul] ?? []);

        return response()->json([
            'can_access' => $canAccess,
            'modul' => $modul,
            'unit_number' => $unitNumber,
            'unlocked_units' => $unlockedData['unlocked_units'][$modul] ?? [],
            'message' => $canAccess ? 
                "Access granted to {$modul} unit {$unitNumber}" : 
                "Access denied to {$modul} unit {$unitNumber}. Check your learning plan."
        ]);
    }
}