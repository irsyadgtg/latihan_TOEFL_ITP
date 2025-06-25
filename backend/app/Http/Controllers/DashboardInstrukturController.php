<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengguna;
use App\Models\PesertaKursus;
use App\Models\PesertaPaketKursus;
use App\Models\UserProgress;
use App\Models\UserAnswer;
use App\Models\SimulationSet;
use App\Models\Simulation;
use App\Models\Page;
use App\Models\Question;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardInstrukturController extends Controller
{
    public function instrukturDashboard(Request $request)
    {
        try {
            // 1. Overview Peserta
            $overviewPeserta = $this->getOverviewPeserta();

            // 2. Performa Pembelajaran (Progress + Nilai per Modul)
            $performaPembelajaran = $this->getPerformaPembelajaran();

            // 3. Status Simulasi
            $statusSimulasi = $this->getStatusSimulasi();

            return response()->json([
                'overview_peserta' => $overviewPeserta,
                'performa_pembelajaran' => $performaPembelajaran,
                'status_simulasi' => $statusSimulasi
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Dashboard error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function getOverviewPeserta()
    {
        try {
            // Total peserta terdaftar
            $totalPeserta = Pengguna::where('role', 'peserta')
                ->whereNotNull('idPeserta')
                ->count();

            // Peserta dengan paket aktif
            $pesertaPaketAktif = PesertaPaketKursus::where('statusAktif', 1)
                ->whereDate('tglBerakhir', '>=', Carbon::now())
                ->count();

            // Peserta yang aktif belajar (ada progress dalam 7 hari terakhir)
            $pesertaAktifBelajar = UserProgress::where('created_at', '>=', Carbon::now()->subDays(7))
                ->distinct('idPengguna')
                ->count();

            return [
                'total_peserta' => $totalPeserta,
                'peserta_paket_aktif' => $pesertaPaketAktif,
                'peserta_aktif_belajar' => $pesertaAktifBelajar,
                'persentase_paket_aktif' => $totalPeserta > 0 ? round(($pesertaPaketAktif / $totalPeserta) * 100, 1) : 0,
                'persentase_aktif_belajar' => $totalPeserta > 0 ? round(($pesertaAktifBelajar / $totalPeserta) * 100, 1) : 0
            ];
        } catch (\Exception $e) {
            return [
                'total_peserta' => 0,
                'peserta_paket_aktif' => 0,
                'peserta_aktif_belajar' => 0,
                'persentase_paket_aktif' => 0,
                'persentase_aktif_belajar' => 0
            ];
        }
    }

    private function getPerformaPembelajaran()
    {
        try {
            $moduls = ['listening', 'structure', 'reading'];
            $performaData = [];

            foreach ($moduls as $modul) {
                // Hitung rata-rata progress materi per modul
                $totalPages = Page::where('modul', $modul)->count();
                $avgProgress = 0;
                
                if ($totalPages > 0) {
                    $allPeserta = Pengguna::where('role', 'peserta')->pluck('idPengguna');
                    $totalProgressSum = 0;
                    $pesertaCount = $allPeserta->count();

                    foreach ($allPeserta as $idPengguna) {
                        $completedPages = UserProgress::whereHas('page', function ($q) use ($modul) {
                            $q->where('modul', $modul);
                        })->where('idPengguna', $idPengguna)->count();
                        
                        $progressPercentage = ($completedPages / $totalPages) * 100;
                        $totalProgressSum += $progressPercentage;
                    }

                    $avgProgress = $pesertaCount > 0 ? round($totalProgressSum / $pesertaCount, 1) : 0;
                }

                // Hitung rata-rata nilai latihan per modul
                $answers = UserAnswer::whereNull('simulation_id')
                    ->whereHas('question', function ($q) use ($modul) {
                        $q->where('modul', $modul)->whereNull('simulation_set_id');
                    })
                    ->get();

                $avgNilai = 0;
                $totalSoal = 0;
                $totalBenar = 0;

                if ($answers->isNotEmpty()) {
                    $totalBenar = $answers->where('is_correct', true)->count();
                    $totalSoal = $answers->count();
                    $avgNilai = round(($totalBenar / $totalSoal) * 100, 1);
                }

                // Hitung jumlah peserta yang mengerjakan modul ini
                $pesertaAktif = UserAnswer::whereNull('simulation_id')
                    ->whereHas('question', function ($q) use ($modul) {
                        $q->where('modul', $modul)->whereNull('simulation_set_id');
                    })
                    ->distinct('idPengguna')
                    ->count();

                $performaData[$modul] = [
                    'rata_rata_progress' => $avgProgress,
                    'rata_rata_nilai' => $avgNilai,
                    'total_soal_dikerjakan' => $totalSoal,
                    'total_benar' => $totalBenar,
                    'peserta_aktif' => $pesertaAktif
                ];
            }

            // Tentukan modul yang paling banyak diambil
            $modulTerpopuler = collect($performaData)
                ->sortByDesc('peserta_aktif')
                ->keys()
                ->first() ?? 'listening';

            return [
                'per_modul' => $performaData,
                'modul_terpopuler' => $modulTerpopuler,
                'total_soal_dikerjakan' => array_sum(array_column($performaData, 'total_soal_dikerjakan')),
                'rata_rata_keseluruhan' => count($performaData) > 0 ? 
                    round(array_sum(array_column($performaData, 'rata_rata_nilai')) / count($performaData), 1) : 0
            ];
        } catch (\Exception $e) {
            return [
                'per_modul' => [
                    'listening' => ['rata_rata_progress' => 0, 'rata_rata_nilai' => 0, 'total_soal_dikerjakan' => 0, 'total_benar' => 0, 'peserta_aktif' => 0],
                    'structure' => ['rata_rata_progress' => 0, 'rata_rata_nilai' => 0, 'total_soal_dikerjakan' => 0, 'total_benar' => 0, 'peserta_aktif' => 0],
                    'reading' => ['rata_rata_progress' => 0, 'rata_rata_nilai' => 0, 'total_soal_dikerjakan' => 0, 'total_benar' => 0, 'peserta_aktif' => 0]
                ],
                'modul_terpopuler' => 'listening',
                'total_soal_dikerjakan' => 0,
                'rata_rata_keseluruhan' => 0
            ];
        }
    }

    private function getStatusSimulasi()
    {
        try {
            // Get simulasi aktif (simulation_set_id = 1)
            $simulasiSet = SimulationSet::find(1);
            $isAktif = $simulasiSet ? $simulasiSet->is_active : false;

            // Peserta yang sedang mengerjakan simulasi
            $pesertaSedangSimulasi = 0;
            if ($isAktif) {
                $pesertaSedangSimulasi = Simulation::where('simulation_set_id', 1)
                    ->whereIn('status', ['in_progress_listening', 'in_progress_structure', 'in_progress_reading'])
                    ->count();
            }

            // Simulasi yang sudah selesai (untuk statistik)
            $simulasiSelesai = Simulation::where('simulation_set_id', 1)
                ->where('status', 'completed')
                ->count();

            // Rata-rata skor simulasi yang sudah selesai
            $rataRataSkor = Simulation::where('simulation_set_id', 1)
                ->where('status', 'completed')
                ->whereNotNull('total_score')
                ->avg('total_score');

            $rataRataSkor = $rataRataSkor ? round($rataRataSkor, 0) : 0;

            return [
                'is_aktif' => $isAktif,
                'peserta_sedang_simulasi' => $pesertaSedangSimulasi,
                'simulasi_selesai' => $simulasiSelesai,
                'rata_rata_skor' => $rataRataSkor,
                'status_text' => $isAktif ? 'Simulasi Aktif' : 'Simulasi Nonaktif',
                'can_toggle' => $pesertaSedangSimulasi === 0
            ];
        } catch (\Exception $e) {
            return [
                'is_aktif' => false,
                'peserta_sedang_simulasi' => 0,
                'simulasi_selesai' => 0,
                'rata_rata_skor' => 0,
                'status_text' => 'Error',
                'can_toggle' => false
            ];
        }
    }
}