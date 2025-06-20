<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PengajuanSkorAwal;
use App\Models\PengajuanRencanaBelajar;
use App\Models\DetailPengajuanRencanaBelajar;
use App\Models\FeedbackRencanaBelajar;
use App\Models\DetailFeedbackRencanaBelajar;
use App\Models\Skill;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TinjauRencanaBelajarController extends Controller
{
    // Tampilkan daftar pengajuan yang harus ditinjau
    public function index()
    {
        $pengajuan = PengajuanRencanaBelajar::with('peserta.pengguna')
            ->orderBy('created_at', 'desc')
            ->get();

        $data = $pengajuan->map(function ($item) {
            return [
                'id' => $item->idPengajuanRencanaBelajar,
                'tglPengajuan' => $item->tglPengajuan,
                'nama_peserta' => $item->peserta->pengguna->namaLengkap,
                'email_peserta' => $item->peserta->pengguna->email,
                'status' => $item->status
            ];
        });

        return response()->json([
            'pengajuan' => $data
        ]);
    }


    // Tampilkan detail pengajuan + daftar skill
    public function show($id)
    {
        $pengajuan = PengajuanRencanaBelajar::with(['detailPengajuanRencanaBelajar.skill', 'peserta.pengguna'])
            ->findOrFail($id);

        // Ambil semua skill yang bisa dipilih instruktur
        $allSkill = Skill::all();

        $data = [
            'id' => $pengajuan->idPengajuanRencanaBelajar,
            'nama_rencana' => $pengajuan->namaRencana,
            'target_skor' => $pengajuan->targetSkor,
            'target_waktu' => $pengajuan->targetWaktu,
            'frekuensi_mingguan' => $pengajuan->hariPerMinggu,
            'durasi_harian' => $pengajuan->jamPerHari,
            'status' => $pengajuan->status,
            'peserta' => [
                'nama' => $pengajuan->peserta->namaLengkap,
                'email' => $pengajuan->peserta->pengguna->email,
            ],
            'detail_pengajuan' => $pengajuan->detailPengajuanRencanaBelajar->map(function ($detail) {
                return [
                    'id_detail_pengajuan' => $detail->idDetailPengajuan,
                    'kategori' => $detail->skill->kategori,
                    'skill' => [
                        'id' => $detail->skill->idSkill,
                        'deskripsi' => $detail->skill->deskripsi
                    ]
                ];
            }),
            'daftar_skill' => $allSkill->map(function ($skill) {
                return [
                    'id' => $skill->idSkill,
                    'kategori' => $skill->kategori,
                    'skill' => $skill->skill,
                    'deskripsi' => $skill->deskripsi
                ];
            })
        ];

        return response()->json($data);
    }

    // Simpan feedback dari instruktur
    public function beriFeedback(Request $request, $id)
    {
        $pengajuan = PengajuanRencanaBelajar::findOrFail($id);
        if ($pengajuan->status == 'sudah ada feedback') {
            return response()->json([
                'message' => 'Pengajuan ini sudah memiliki feedback. Tidak bisa memberikan feedback ulang.'
            ], 400);
        }

        $request->validate([
            'detail' => 'required|array',
            'detail.*.skill_id' => 'required|integer|exists:skill,idSkill',
        ]);

        DB::transaction(function () use ($request, $id) {
            // Ambil instruktur dari user login
            $pengguna = Auth::user();
            $pegawai = $pengguna->pegawai;
            $instruktur = $pegawai->instruktur;

            if (!$instruktur) {
                abort(403, 'Anda bukan instruktur');
            }

            // Buat feedback utama
            $feedback = new FeedbackRencanaBelajar();
            $feedback->idPengajuanRencanaBelajar = $id;
            $feedback->idInstruktur = $instruktur->idInstruktur;
            $feedback->tglPemberianFeedback = now();
            $feedback->save();

            // Masukkan detail feedback
            foreach ($request->detail as $item) {
                $detailFeedback = new DetailFeedbackRencanaBelajar();
                $detailFeedback->idFeedbackRencanaBelajar = $feedback->idFeedbackRencanaBelajar;
                $detailFeedback->idSkill = $item['skill_id'];
                $detailFeedback->save();
            }

            // Update status pengajuan
            $pengajuan = PengajuanRencanaBelajar::findOrFail($id);
            $pengajuan->status = 'sudah ada feedback';
            $pengajuan->save();
        });

        return response()->json([
            'message' => 'Feedback berhasil disimpan dan status diperbarui.'
        ]);
    }
}
