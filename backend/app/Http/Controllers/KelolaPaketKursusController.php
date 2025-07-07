<?php

namespace App\Http\Controllers;

use App\Models\PaketKursus;
use App\Models\Peserta;
use App\Models\Pegawai;
use App\Models\PesertaPaketKursus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class KelolaPaketKursusController extends Controller
{
    // GET: Semua paket kursus
   public function index()
   {
        $pakets = PaketKursus::with('pegawai:idPegawai,namaLengkap') //ambil id sama nama aja
            ->select('idPaketKursus', 'namaPaket', 'harga', 'fasilitas', 'masaBerlaku', 'aktif', 'idPegawai')
            ->get();

        return response()->json($pakets, 200);
    }

    // GET: Semua paket aktif dan yg dibeli peserta itu
    public function indexPeserta()
    {
        $peserta = Auth::user();

        // Ambil semua paket yang aktif (global)
        $paketAktifGlobal = PaketKursus::with('pegawai:idPegawai,namaLengkap')
            ->select('idPaketKursus', 'namaPaket', 'harga', 'fasilitas', 'masaBerlaku', 'aktif', 'idPegawai')
            ->where('aktif', true)
            ->get();

        // Ambil semua paket yang dia sudah beli dan masih aktif statusnya (khusus peserta)
        $paketDibeli = PaketKursus::with('pegawai:idPegawai,namaLengkap')
            ->select('idPaketKursus', 'namaPaket', 'harga', 'fasilitas', 'masaBerlaku', 'aktif', 'idPegawai')
            ->whereIn('idPaketKursus', function($query) use ($peserta) {
                $query->select('idPaketKursus')
                    ->from('peserta_paket_kursus')
                    ->where('idPeserta', $peserta->idPeserta)
                    ->where('statusAktif', true)
                    ->where('paketSaatIni', true);
            })
            ->get();

        // Gabungkan (biar ga duplikat kalo ada paket aktif yang kebetulan juga udah dia beli)
        $pakets = $paketAktifGlobal->merge($paketDibeli)->unique('idPaketKursus')->values();

        return response()->json($pakets, 200);
    }


    // POST: Tambah paket kursus (S-1)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'namaPaket' => 'required|string|max:255',
            'harga' => 'required|numeric|min:0',
            'masaBerlaku' => 'required|integer|min:0',
            'fasilitas' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $fasilitasValid = [
            'listening',
            'structure',
            'reading',
            'konsultasi',
            'simulasi'
        ];

        // Validasi isi fasilitas
        $fasilitasArray = array_map('trim', explode(',', $request->fasilitas));
        $invalidItems = array_diff($fasilitasArray, $fasilitasValid);

        if (!empty($invalidItems)) {
            return response()->json([
                'message' => 'Beberapa item fasilitas tidak valid. Cek kembali ketentuan fasilitas yang perlu diinput',
                'invalid_items' => array_values($invalidItems)
            ], 422);
        }

        $user = Auth::user(); // ambil user login

        // Ambil id pegawai dari user login
        $idPegawai = $user->idPegawai; 

        $paket = PaketKursus::create([
            'namaPaket' => $request->namaPaket,
            'harga' => $request->harga,
            'masaBerlaku' => $request->masaBerlaku,
            'fasilitas' => implode(',', $fasilitasArray),
            'aktif' => true,
            'idPegawai' => $idPegawai,
        ]);

        return response()->json([
            'message' => 'Paket kursus berhasil ditambahkan.',
            'data' => $paket
        ], 201);
    }


    //Detail paket untuk diubah
    public function show($id)
    {
        // $paket = PaketKursus::withCount('pesertaPaket')->find($id);
        $paket = PaketKursus::find($id);

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

        $fasilitasValid = [
            'listening',
            'structure',
            'reading',
            'konsultasi',
            'simulasi'
        ];

        $fasilitasArray = array_map('trim', explode(',', $request->fasilitas));
        $invalidItems = array_diff($fasilitasArray, $fasilitasValid);

        if (!empty($invalidItems)) {
            return response()->json([
                'message' => 'Beberapa item fasilitas tidak valid.',
                'invalid_items' => array_values($invalidItems)
            ], 422);
        }

        // Update hanya 3 field yang diizinkan
        $paket->update([
            'namaPaket' => $request->namaPaket,
            'harga' => $request->harga,
            'fasilitas' => implode(',', $fasilitasArray),
        ]);

        return response()->json([
            'message' => 'Detail paket kursus berhasil diperbarui.',
            'data' => $paket
        ], 200);
    }

    //Detail untuk aktivasi paket
    public function getDetailAktivasi($id)
    {
        // $paket = PaketKursus::withCount('pesertaPaket') // ambil total pengguna paket
        //     ->find($id);
        $paket = PaketKursus::find($id);

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
