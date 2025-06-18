<?php

namespace App\Http\Controllers;

use App\Models\PaketKursus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KelolaPaketKursusController extends Controller
{
    // GET: Semua paket kursus
   public function index()
   {
        $pakets = PaketKursus::with('pegawai:id,nama') //ambil id sama nama aja
            ->select('idPaketKursus', 'namaPaket', 'harga', 'fasilitas', 'masaBerlaku', 'aktif', 'idPegawai')
            ->get();

        return response()->json($pakets, 200);
    }

    // POST: Tambah paket kursus (S-1)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'namaPaket' => 'required|string|max:255',
            'harga' => 'required|numeric|min:0',
            'masaBerlaku' => 'required|integer|min:1',
            'fasilitas' => 'required|string',
            'idPegawai' => 'nullable|exists:pegawai,idPegawai'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $paket = PaketKursus::create([
            'namaPaket' => $request->namaPaket,
            'harga' => $request->harga,
            'masaBerlaku' => $request->masaBerlaku,
            'fasilitas' => $request->fasilitas,
            'aktif' => true,
            'idPegawai' => $request->idPegawai,
        ]);

        return response()->json([
            'message' => 'Paket kursus berhasil ditambahkan.',
            'data' => $paket
        ], 201);
    }

    //Detail paket untuk diubah
    public function show($id)
    {
        $paket = PaketKursus::withCount('pesertaPaket')->find($id);

        if (!$paket) {
            return response()->json(['message' => 'Paket kursus tidak ditemukan.'], 404);
        }

        return response()->json($paket, 200);
    }

    // PATCH: Ubah detail paket kursus (S-2)
    public function updateDetailPaket(Request $request, $id)
    {
        $paket = PaketKursus::find($id);
        if (!$paket) {
            return response()->json(['message' => 'Paket kursus tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'namaPaket' => 'required|string|max:255',
            'harga' => 'required|numeric|min:0',
            'fasilitas' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update hanya 3 field yang diizinkan
        $paket->update([
            'namaPaket' => $request->namaPaket,
            'harga' => $request->harga,
            'fasilitas' => $request->fasilitas,
        ]);

        return response()->json([
            'message' => 'Detail paket kursus berhasil diperbarui.',
            'data' => $paket
        ], 200);
    }

    //Detail untuk aktivasi paket
    public function getDetailAktivasi($id)
    {
        $paket = PaketKursus::withCount('pesertaPaket') // ambil total pengguna paket
            ->find($id);

        if (!$paket) {
            return response()->json(['message' => 'Paket kursus tidak ditemukan.'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $paket->idPaketKursus,
                'namaPaket' => $paket->namaPaket,
                'harga' => $paket->harga,
                'fasilitas' => $paket->fasilitas,
                'masaBerlaku' => $paket->masaBerlaku,
                'aktif' => $paket->aktif,
                'totalPengguna' => $paket->peserta_paket_count
            ]
        ], 200);
    }

    // PATCH: Atur aktivasi paket kursus (S-3)
    public function toggleAktif(Request $request, $id)
    {
        $paket = PaketKursus::find($id);
        if (!$paket) {
            return response()->json(['message' => 'Paket kursus tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'aktif' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $paket->aktif = $request->aktif;
        $paket->save();

        $status = $request->aktif ? 'aktif' : 'non-aktif';

        return response()->json([
            'message' => "Paket kursus berhasil diatur menjadi $status.",
            'data' => $paket
        ], 200);
    }
}
