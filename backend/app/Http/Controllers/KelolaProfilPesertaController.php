<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use App\Models\PesertaKursus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class KelolaProfilPesertaController extends Controller
{
    // GET profil peserta
    public function getProfilPeserta()
    {
        $user = Auth::user();
        $pengguna = Pengguna::with('peserta.pesertaPaket.paket')->find($user->idPengguna);
        $paketSaatIni = $pengguna->peserta->pesertaPaket->where('paketSaatIni', true)->first();

        if (!$pengguna || !$pengguna->peserta) {
            return response()->json(['message' => 'Profil peserta tidak ditemukan.'], 404);
        }

        $peserta = $pengguna->peserta;

        return response()->json([
            'namaLengkap' => $peserta->namaLengkap,
            'username' => $pengguna->username,
            'email' => $pengguna->email,
            'nik' => $peserta->nik,
            'nomorTelepon' => $peserta->nomorTelepon ?? null,
            'paketKursus' => optional($paketSaatIni->paket)->namaPaket,
            'sisaMasaBerlaku' => $paketSaatIni ? now()->diffInDays(optional($paketSaatIni->tglBerakhir)) : null,
            'alamat' => $peserta->alamat ?? null,
            'urlFotoProfil' => $peserta->urlFotoProfil ?? null,
        ]);
    }

    // PATCH update profil peserta
    public function updateProfilPeserta(Request $request)
    {
        $user = Auth::user();
        $pengguna = Pengguna::with('peserta')->find($user->idPengguna);

        if (!$pengguna || !$pengguna->peserta) {
            return response()->json(['message' => 'Profil peserta tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'namaLengkap' => 'required|string|max:255',
            'nik' => 'required|digits:16|unique:peserta_kursus,nik,' . $pengguna->peserta->idPeserta . ',idPeserta',
            'nomorTelepon' => 'nullable|string|max:20|regex:/^[\d\+\-\s]+$/',
            'alamat' => 'nullable|string',
            'foto' => 'nullable|file|image|mimes:jpeg,png,jpg|max:2048',
            'username' => 'required|string|unique:pengguna,username,' . $pengguna->idPengguna . ',idPengguna',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        // Proses upload foto jika ada
        $pathFoto = $request->hasFile('foto') ? $request->file('foto')->store('foto-profil', 'public') : null; 

        $pengguna->update([
            'username' => $request->username,
        ]);

        $pengguna->peserta->update([
            'namaLengkap' => $request->namaLengkap,
            'nik' => $request->nik,
            'nomorTelepon' => $request->nomorTelepon,
            'alamat' => $request->alamat,
            'urlFotoProfil' => $pathFoto ?? $pengguna->peserta->urlFotoProfil
        ]);

        return response()->json(['message' => 'Profil peserta berhasil diperbarui.']);
    }
}
