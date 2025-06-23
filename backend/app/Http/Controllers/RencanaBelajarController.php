<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PengajuanSkorAwal;
use App\Models\PengajuanRencanaBelajar;
use App\Models\DetailPengajuanRencanaBelajar;
use App\Models\FeedbackRencanaBelajar;
use App\Models\Skill;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RencanaBelajarController extends Controller
{
    // GET peserta/rencana-belajar
    public function index()
    {
        $user = Auth::user();

        // Cek skor awal yang aktif
        $skorAwal = PengajuanSkorAwal::where('idPeserta', $user->idPeserta)
            ->where('status', 'Disetujui')
            ->whereDate('masaBerlakuDokumen', '>=', Carbon::now())
            ->orderBy('tglSeleksi', 'desc')
            ->first();

        $bolehMengajukan = false;

        // Cek dan update otomatis jika sudah selesai
        $rencanaBerjalan = PengajuanRencanaBelajar::where('idPeserta', $user->idPeserta)
            ->where('status', 'sudah ada feedback')
            ->whereDate('selesaiPada', '<=', Carbon::now())
            ->get();

        foreach ($rencanaBerjalan as $rencana) {
            $rencana->status = 'selesai';
            $rencana->save();
        }

        if ($skorAwal) {
            $adaPending = PengajuanRencanaBelajar::where('idPeserta', $user->idPeserta)
                ->where('status', 'pending')
                ->exists();

            $targetBerjalan = PengajuanRencanaBelajar::where('idPeserta', $user->idPeserta)
                ->where('status', 'sudah ada feedback')
                ->whereDate('selesaiPada', '>=', Carbon::now())
                ->exists();

            $bolehMengajukan = !$adaPending && !$targetBerjalan;
        }

        $riwayat = PengajuanRencanaBelajar::with('detailPengajuanRencanaBelajar.skill')
            ->where('idPeserta', $user->idPeserta)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => $skorAwal ? 'Kamu memiliki skor awal yang disetujui dan masih berlaku.' : 'Kamu perlu memiliki skor awal yang disetujui dan masih berlaku.',
            'boleh_mengajukan' => $bolehMengajukan,
            'skor_awal' => $skorAwal,
            'riwayat' => $riwayat
        ]);
    }

    // GET peserta/skill
    public function showSkill()
    {
        $skills = Skill::all();

        return response()->json([
            'data' => $skills
        ]);
    }

    // POST peserta/rencana-belajar
    public function store(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'target_skor' => 'required|integer|min:1',
                'target_waktu' => 'required|in:2 minggu,3 minggu,1 bulan',
                'frekuensi_mingguan' => 'required|integer|min:1|max:7',
                'durasi_harian' => 'required|in:<1 jam,<2 jam,2-3 jam',
                'skill' => 'required|array|min:1',
                'skill.*' => 'integer|exists:skill,idSkill'
            ]);

            // Cek skor awal dan pengajuan
            $user = Auth::user();
            $skorAwal = PengajuanSkorAwal::where('idPeserta', $user->idPeserta)
                ->where('status', 'Disetujui')
                ->whereDate('masaBerlakuDokumen', '>=', now())
                ->first();

            if (!$skorAwal) {
                return response()->json(['message' => 'Tidak bisa mengajukan. Skor awal belum disetujui atau kadaluarsa.'], 403);
            }

            if (PengajuanRencanaBelajar::where('idPeserta', $user->idPeserta)
                ->where('status', 'pending')
                ->exists()) {
                return response()->json(['message' => 'Masih ada pengajuan pending atau target rencana belajar sebelumnya belum selesai.'], 403);
            }

            if (PengajuanRencanaBelajar::where('idPeserta', $user->idPeserta)
                ->where('status', 'sudah ada feedback')
                ->whereDate('selesaiPada', '>=', now())
                ->exists()) {
                return response()->json(['message' => 'Masih ada rencana belajar yang sedang berjalan.'], 403);
            }

            // Proses database dalam transaction
            $rencanaData = DB::transaction(function () use ($validated, $user, $skorAwal) {
                $tanggalMulai = now();
                $tanggalSelesai = match ($validated['target_waktu']) {
                    '2 minggu' => $tanggalMulai->copy()->addWeeks(2),
                    '3 minggu' => $tanggalMulai->copy()->addWeeks(3),
                    '1 bulan' => $tanggalMulai->copy()->addMonth(),
                };

                $namaRencana = 'Rencana Belajar TOEFL - ' . $tanggalMulai->format('d F Y') . ' - Target Skor ' . $validated['target_skor'];

                $rencana = PengajuanRencanaBelajar::create([
                    'idPeserta' => $user->idPeserta,
                    'idPengajuanSkorAwal' => $skorAwal->idPengajuanSkorAwal,
                    'namaRencana' => $namaRencana,
                    'targetSkor' => $validated['target_skor'],
                    'targetWaktu' => $validated['target_waktu'],
                    'hariPerMinggu' => $validated['frekuensi_mingguan'],
                    'jamPerHari' => $validated['durasi_harian'],
                    'tglPengajuan' => $tanggalMulai,
                    'status' => 'pending',
                    'tanggalMulai' => $tanggalMulai,
                    'selesaiPada' => $tanggalSelesai,
                ]);

                DetailPengajuanRencanaBelajar::insert(array_map(function($idSkill) use ($rencana) {
                    return [
                        'idPengajuanRencanaBelajar' => $rencana->idPengajuanRencanaBelajar,
                        'idSkill' => $idSkill
                    ];
                }, $validated['skill']));

                return [
                    'idPengajuanRencanaBelajar' => $rencana->idPengajuanRencanaBelajar,
                    'skorAwal' => $rencana->skorAwal,
                    'namaRencana' => $rencana->namaRencana,
                    'targetSkor' => $rencana->targetSkor,
                    'targetWaktu' => $rencana->targetWaktu,
                    'hariPerMinggu' => $rencana->hariPerMinggu,
                    'jamPerHari' => $rencana->jamPerHari,
                    'tglPengajuan' => $rencana->tglPengajuan,
                    'status' => $rencana->status,
                    'isAktif' => $rencana->isAktif,
                    'tanggalMulai' => $rencana->tanggalMulai,
                    'selesaiPada' => $rencana->selesaiPada,
                    'idPengajuanSkorAwal' => $rencana->idPengajuanSkorAwal,
                    'idPeserta' => $rencana->idPeserta,
                ];
            });

            return response()->json([
                'message' => 'Rencana belajar berhasil diajukan',
                'data' => $rencanaData
            ], 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengajukan: ' . $e->getMessage()
            ], 500);
        }
    }


    // GET peserta/rencana-belajar/{id}
    public function show($id)
    {
        $user = Auth::user();

        $rencana = PengajuanRencanaBelajar::with([
            'detailPengajuanRencanaBelajar.skill',
            'feedbackRencanaBelajar.detailFeedbackRencanaBelajar.skill'
        ])->where('idPengajuanRencanaBelajar', $id)
          ->where('idPeserta', $user->idPeserta)
          ->first();

        if (!$rencana) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json(['data' => $rencana]);
    }
}
