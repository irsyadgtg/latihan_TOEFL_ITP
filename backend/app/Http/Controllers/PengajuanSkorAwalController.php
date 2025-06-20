<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\PengajuanSkorAwal;
use Illuminate\Support\Facades\Auth;

class PengajuanSkorAwalController extends Controller
{
    // 1. Menampilkan riwayat pengajuan oleh peserta
    public function index()
    {
        $user = Auth::user();
        $pengajuan = PengajuanSkorAwal::where('idPeserta', $user->idPeserta)->orderBy('tglPengajuan', 'desc')->get();

        if ($pengajuan->isEmpty()) {
            return response()->json([
                'message' => 'Belum ada skor awal yang kamu ajukan.',
                'riwayat' => []
            ]);
        }

        return response()->json([
            'message' => 'Riwayat pengajuan ditemukan.',
            'riwayat' => $pengajuan
        ]);
    }

    // 2. Mengajukan skor awal oleh peserta
    public function store(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'namaTes' => 'required|string|max:255',
            'skor' => 'required|integer|min:0',
            'dokumenPendukung' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $request->file('dokumenPendukung')->store('dokumen-pendukung', 'public');

        $pengajuan = PengajuanSkorAwal::create([
            'idPeserta' => $user->idPeserta,
            'namaTes' => $request->namaTes,
            'skor' => $request->skor,
            'urlDokumenPendukung' => $path,
            'tglPengajuan' => now(),
            'status' => 'Pending',
        ]);

        return response()->json([
            'message' => 'Pengajuan skor awal berhasil diajukan.',
            'data' => $pengajuan
        ], 201);
    }

    // 3. Riwayat dan detail pengajuan skor
    public function listForSeleksi()
    {
        $pengajuan = PengajuanSkorAwal::with('peserta.pengguna') // include nested relasi
            ->orderBy('tglPengajuan', 'desc')
            ->get();

        $data = $pengajuan->map(function ($item) {
            return [
                'id' => $item->idPengajuanSkorAwal,
                'timestamp' => $item->tglPengajuan,
                'namaLengkap' => $item->peserta->namaLengkap ?? '-',
                'email' => $item->peserta->pengguna->email ?? '-',
                'status' => $item->status,
                'masaBerlakuDokumen' => $item->masaBerlakuDokumen,
                'keterangan' => $item->keterangan,
            ];
        });

        return response()->json([
            'message' => 'Daftar pengajuan skor awal.',
            'data' => $data
        ]);
    }

    // 4. Detail Pengajuan untuk seleksi
    public function showDetailPengajuanSkor($id)
    {
        $pengajuan = PengajuanSkorAwal::with('peserta.pengguna')->find($id);

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Data pengajuan tidak ditemukan.'
            ], 404);
        }

        $data = [
            'id' => $pengajuan->idPengajuanSkorAwal,
            'namaLengkap' => $pengajuan->peserta->namaLengkap ?? '-',
            'email' => $pengajuan->peserta->pengguna->email ?? '-',
            'timestamp' => $pengajuan->tglPengajuan,
            'namaTes' => $pengajuan->namaTes,
            'skor' => $pengajuan->skor,
            'dokumen_pendukung' => $pengajuan->urlDokumenPendukung
                ? asset('storage/' . $pengajuan->urlDokumenPendukung)
                : null,
            'status' => $pengajuan->status,
        ];

        return response()->json([
            'message' => 'Detail pengajuan skor awal.',
            'data' => $data,
        ]);
    }

    // 4. Menyeleksi pengajuan skor awal oleh admin
    public function seleksi(Request $request, $id)
    {
        $pengajuan = PengajuanSkorAwal::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Disetujui,Ditolak',
            'masaBerlakuDokumen' => 'required_if:status,Disetujui|date',
            'keterangan' => 'required_if:status,Ditolak|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $pengajuan->status = $request->status;
        $pengajuan->tglSeleksi = now();
        $pengajuan->idPegawai = Auth::user()->idPegawai; // diasumsikan admin login sebagai pegawai
        if ($request->status === 'Disetujui') {
            $pengajuan->masaBerlakuDokumen = $request->masaBerlakuDokumen;
            $pengajuan->keterangan = null; // bersihkan jika ada sisa sebelumnya
        } else {
            $pengajuan->keterangan = $request->keterangan;
            $pengajuan->masaBerlakuDokumen = null; // bersihkan jika sebelumnya pernah disetujui
        }
        $pengajuan->save();

        return response()->json([
            'message' => 'Pengajuan berhasil diperbarui.',
            'data' => $pengajuan
        ]);
    }
}
