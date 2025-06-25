<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserProgress;
use App\Models\UserAnswer;
use App\Models\Page;
use App\Models\Question;
use App\Models\PesertaPaketKursus;
use App\Models\PengajuanRencanaBelajar;
use App\Models\Simulation;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function pesertaDashboard(Request $request)
    {
        try {
            $idPengguna = auth()->user()->idPengguna;

            // 1. Progres Materi (% halaman completed per modul)
            $progresMateri = $this->getProgresMateri($idPengguna);

            // 2. Latihan Selesai (quiz completed per modul)
            $latihanSelesai = $this->getLatihanSelesai($idPengguna);

            // 3. Nilai Rata-rata Seluruh Latihan
            $nilaiRataRata = $this->getNilaiRataRata($idPengguna);

            // 4. Perbandingan Nilai per Modul (untuk chart)
            $nilaiPerModul = $this->getNilaiPerModul($idPengguna);

            // 5. Informasi Paket yang Diambil
            $infoPaket = $this->getInfoPaket($idPengguna);

            // 6. Informasi Rencana Belajar - FIXED
            $infoRencanaBelajar = $this->getInfoRencanaBelajar($idPengguna);

            return response()->json([
                'progres_materi' => $progresMateri,
                'latihan_selesai' => $latihanSelesai,
                'nilai_rata_rata' => $nilaiRataRata,
                'nilai_per_modul' => $nilaiPerModul,
                'info_paket' => $infoPaket,
                'info_rencana_belajar' => $infoRencanaBelajar
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Dashboard error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function getProgresMateri($idPengguna)
    {
        try {
            $moduls = ['listening', 'structure', 'reading'];
            $progres = [];
            $totalCompleted = 0;
            $totalPages = 0;

            foreach ($moduls as $modul) {
                $totalPagesModul = Page::where('modul', $modul)->count();
                $completedPagesModul = 0;
                if ($totalPagesModul > 0) {
                    $completedPagesModul = UserProgress::where('idPengguna', $idPengguna)
                        ->whereHas('page', function ($q) use ($modul) {
                            $q->where('modul', $modul);
                        })
                        ->count();
                }

                $percentage = $totalPagesModul > 0 ? round(($completedPagesModul / $totalPagesModul) * 100, 1) : 0;

                $progres[$modul] = [
                    'completed' => $completedPagesModul,
                    'total' => $totalPagesModul,
                    'percentage' => $percentage
                ];

                $totalCompleted += $completedPagesModul;
                $totalPages += $totalPagesModul;
            }

            $totalPercentage = $totalPages > 0 ? round(($totalCompleted / $totalPages) * 100, 1) : 0;

            return [
                'total' => [
                    'completed' => $totalCompleted,
                    'total' => $totalPages,
                    'percentage' => $totalPercentage
                ],
                'per_modul' => $progres
            ];
        } catch (\Exception $e) {
            return [
                'total' => ['completed' => 0, 'total' => 0, 'percentage' => 0],
                'per_modul' => [
                    'listening' => ['completed' => 0, 'total' => 0, 'percentage' => 0],
                    'structure' => ['completed' => 0, 'total' => 0, 'percentage' => 0],
                    'reading' => ['completed' => 0, 'total' => 0, 'percentage' => 0]
                ]
            ];
        }
    }

    private function getLatihanSelesai($idPengguna)
    {
        try {
            $moduls = ['listening', 'structure', 'reading'];
            $latihan = [];
            $totalCompleted = 0;
            $totalUnits = 0;

            foreach ($moduls as $modul) {
                $totalUnitsModul = Question::where('modul', $modul)
                    ->whereNull('simulation_set_id')
                    ->distinct('unit_number')
                    ->count('unit_number');

                $completedUnitsModul = 0;
                if ($totalUnitsModul > 0) {
                    $units = Question::where('modul', $modul)
                        ->whereNull('simulation_set_id')
                        ->distinct('unit_number')
                        ->pluck('unit_number');

                    foreach ($units as $unitNumber) {
                        if (UserAnswer::hasCompletedQuiz($idPengguna, $modul, $unitNumber)) {
                            $completedUnitsModul++;
                        }
                    }
                }

                $percentage = $totalUnitsModul > 0 ? round(($completedUnitsModul / $totalUnitsModul) * 100, 1) : 0;

                $latihan[$modul] = [
                    'completed' => $completedUnitsModul,
                    'total' => $totalUnitsModul,
                    'percentage' => $percentage
                ];

                $totalCompleted += $completedUnitsModul;
                $totalUnits += $totalUnitsModul;
            }

            $totalPercentage = $totalUnits > 0 ? round(($totalCompleted / $totalUnits) * 100, 1) : 0;

            return [
                'total' => [
                    'completed' => $totalCompleted,
                    'total' => $totalUnits,
                    'percentage' => $totalPercentage
                ],
                'per_modul' => $latihan
            ];
        } catch (\Exception $e) {
            return [
                'total' => ['completed' => 0, 'total' => 0, 'percentage' => 0],
                'per_modul' => [
                    'listening' => ['completed' => 0, 'total' => 0, 'percentage' => 0],
                    'structure' => ['completed' => 0, 'total' => 0, 'percentage' => 0],
                    'reading' => ['completed' => 0, 'total' => 0, 'percentage' => 0]
                ]
            ];
        }
    }

    private function getNilaiRataRata($idPengguna)
    {
        try {
            $allQuizAnswers = UserAnswer::where('idPengguna', $idPengguna)
                ->whereNull('simulation_id')
                ->get();

            if ($allQuizAnswers->isEmpty()) {
                return [
                    'rata_rata' => 0,
                    'total_soal' => 0,
                    'total_benar' => 0
                ];
            }

            $totalBenar = $allQuizAnswers->where('is_correct', true)->count();
            $totalSoal = $allQuizAnswers->count();
            $rataRata = round(($totalBenar / $totalSoal) * 100, 1);

            return [
                'rata_rata' => $rataRata,
                'total_soal' => $totalSoal,
                'total_benar' => $totalBenar
            ];
        } catch (\Exception $e) {
            return [
                'rata_rata' => 0,
                'total_soal' => 0,
                'total_benar' => 0
            ];
        }
    }

    private function getNilaiPerModul($idPengguna)
    {
        try {
            $moduls = ['listening', 'structure', 'reading'];
            $nilai = [];

            foreach ($moduls as $modul) {
                $answers = UserAnswer::where('idPengguna', $idPengguna)
                    ->whereNull('simulation_id')
                    ->whereHas('question', function ($q) use ($modul) {
                        $q->where('modul', $modul)
                            ->whereNull('simulation_set_id');
                    })
                    ->get();

                if ($answers->isEmpty()) {
                    $nilai[$modul] = [
                        'rata_rata' => 0,
                        'total_soal' => 0,
                        'total_benar' => 0
                    ];
                } else {
                    $totalBenar = $answers->where('is_correct', true)->count();
                    $totalSoal = $answers->count();
                    $rataRata = round(($totalBenar / $totalSoal) * 100, 1);

                    $nilai[$modul] = [
                        'rata_rata' => $rataRata,
                        'total_soal' => $totalSoal,
                        'total_benar' => $totalBenar
                    ];
                }
            }

            return $nilai;
        } catch (\Exception $e) {
            return [
                'listening' => ['rata_rata' => 0, 'total_soal' => 0, 'total_benar' => 0],
                'structure' => ['rata_rata' => 0, 'total_soal' => 0, 'total_benar' => 0],
                'reading' => ['rata_rata' => 0, 'total_soal' => 0, 'total_benar' => 0]
            ];
        }
    }

    private function getInfoPaket($idPengguna)
    {
        try {
            $user = auth()->user();

            if (!$user || !$user->peserta) {
                return null;
            }

            $peserta = $user->peserta;

            $pesertaPaket = PesertaPaketKursus::where('idPeserta', $peserta->idPeserta)
                ->where('statusAktif', 1)
                ->with('paket')
                ->first();

            if (!$pesertaPaket || !$pesertaPaket->paket) {
                return null;
            }

            $paket = $pesertaPaket->paket;

            $tanggalMulai = Carbon::parse($pesertaPaket->tglMulai);
            $tanggalBerakhir = Carbon::parse($pesertaPaket->tglBerakhir);
            $hariTersisa = now()->diffInDays($tanggalBerakhir, false);

            return [
                'nama_paket' => $paket->namaPaket,
                'harga' => $paket->harga,
                'masa_berlaku' => $paket->masaBerlaku,
                'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                'tanggal_berakhir' => $tanggalBerakhir->format('Y-m-d'),
                'hari_tersisa' => $hariTersisa > 0 ? $hariTersisa : 0,
                'status' => $hariTersisa > 0 ? 'aktif' : 'expired'
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    private function getInfoRencanaBelajar($idPengguna)
    {
        try {
            $user = auth()->user();

            // Cek relasi peserta dengan aman
            if (!$user || !$user->peserta) {
                return null;
            }

            $peserta = $user->peserta;

            // Query rencana belajar - coba berbagai kondisi
            $rencanaBelajar = PengajuanRencanaBelajar::where('idPeserta', $peserta->idPeserta)
                ->where('status', 'disetujui')
                ->where('isAktif', 1)
                ->whereNotNull('tanggalMulai')
                ->whereNotNull('selesaiPada')
                ->latest('tanggalMulai')
                ->first();

            // Jika tidak ada yang disetujui, coba tanpa kondisi status
            if (!$rencanaBelajar) {
                $rencanaBelajar = PengajuanRencanaBelajar::where('idPeserta', $peserta->idPeserta)
                    ->whereNotNull('tanggalMulai')
                    ->whereNotNull('selesaiPada')
                    ->latest('created_at')
                    ->first();
            }

            // Jika masih tidak ada, coba yang terbaru tanpa kondisi tanggal
            if (!$rencanaBelajar) {
                $rencanaBelajar = PengajuanRencanaBelajar::where('idPeserta', $peserta->idPeserta)
                    ->latest('created_at')
                    ->first();
            }

            if (!$rencanaBelajar) {
                return null;
            }

            // Handle tanggal dengan aman
            $tanggalMulai = now();
            $tanggalSelesai = now()->addDays(30);
            $hariTersisa = 30;

            try {
                if ($rencanaBelajar->tanggalMulai) {
                    $tanggalMulai = Carbon::parse($rencanaBelajar->tanggalMulai);
                }
                if ($rencanaBelajar->selesaiPada) {
                    $tanggalSelesai = Carbon::parse($rencanaBelajar->selesaiPada);
                }
                $hariTersisa = now()->diffInDays($tanggalSelesai, false);
            } catch (\Exception $e) {
                // Gunakan default jika parsing gagal
            }

            // PERBAIKAN: Handle jam per hari yang lebih robust
            $jamPerHari = 2; // default
            if ($rencanaBelajar->jamPerHari) {
                $jamString = $rencanaBelajar->jamPerHari;

                // Extract angka dari string
                if (preg_match('/(\d+(?:\.\d+)?)/', $jamString, $matches)) {
                    $jamPerHari = (float) $matches[1];
                } else if (is_numeric($jamString)) {
                    $jamPerHari = (float) $jamString;
                }
                // Jika masih 0, gunakan default 2
                if ($jamPerHari <= 0) {
                    $jamPerHari = 2;
                }
            }

            // Hitung total jam target
            $totalHari = $tanggalMulai->diffInDays($tanggalSelesai);
            $hariPerMinggu = $rencanaBelajar->hariPerMinggu ?? 5;
            $targetJamTotal = $totalHari > 0 ? ($totalHari / 7) * $hariPerMinggu * $jamPerHari : 0;

            // Progress target jam
            $hariTerlalui = now()->diffInDays($tanggalMulai, false);
            $progressTarget = $totalHari > 0 ? round(($hariTerlalui / $totalHari) * 100, 1) : 0;

            return [
                'nama_rencana' => $rencanaBelajar->namaRencana ?? 'Rencana Belajar',
                'tanggal_mulai' => $tanggalMulai->format('Y-m-d'),
                'tanggal_selesai' => $tanggalSelesai->format('Y-m-d'),
                'hari_tersisa' => $hariTersisa > 0 ? $hariTersisa : 0,
                'target_jam_total' => round($targetJamTotal, 1),
                'target_jam_harian' => $jamPerHari,
                'hari_per_minggu' => $hariPerMinggu,
                'target_skor' => $rencanaBelajar->targetSkor ?? 450,
                'target_waktu' => $rencanaBelajar->targetWaktu ?? '',
                'progress_target' => $progressTarget,
                'status' => $hariTersisa > 0 ? 'aktif' : 'selesai',
                'pesan_harian' => "Target belajar hari ini: {$jamPerHari} jam",
                // DEBUG INFO
                'debug_jam_string' => $rencanaBelajar->jamPerHari,
                'debug_jam_parsed' => $jamPerHari
            ];
        } catch (\Exception $e) {
            return null;
        }
    }
}
