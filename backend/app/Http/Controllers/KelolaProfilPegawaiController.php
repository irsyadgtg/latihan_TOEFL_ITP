<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pengguna;
use App\Models\Pegawai;
use App\Models\Instruktur;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class KelolaProfilPegawaiController extends Controller
{
    // Tampilkan profil admin
    public function getProfilAdmin()
    {
        $user = Auth::user();

        $pengguna = Pengguna::with('pegawai')->find($user->idPengguna);

        if (!$pengguna) {
            return response()->json(['message' => 'Profil tidak ditemukan.'], 404);
        }

        return response()->json([
            'username' => $pengguna->username,
            'email' => $pengguna->email,
            'namaLengkap' => $pengguna->pegawai->namaLengkap,
            'nik_nip' => $pengguna->pegawai->nik_nip,
            'nomorTelepon' => $pengguna->pegawai->nomorTelepon ?? null,
            'alamat' => $pengguna->pegawai->alamat ?? null,
            'urlFotoProfil' => $pengguna->pegawai->urlFotoProfil ?? null
        ]);
    }

    // Update profil admin
    public function updateProfilAdmin(Request $request)
    {
        $user = Auth::user();

        $pengguna = Pengguna::with('pegawai')->find($user->idPengguna);

        if (!$pengguna) {
            return response()->json(['message' => 'Profil tidak ditemukan.'], 404);
        }

        $pegawai = $pengguna->pegawai;

        if (!$pegawai) {
            return response()->json(['message' => 'Data pegawai tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
        'namaLengkap' => 'required|string|max:255',
        'nik_nip' => 'required|string|max:20|unique:pegawai,nik_nip,' . $pegawai->idPegawai . ',idPegawai',
        'username' => 'required|string|unique:pengguna,username,' . $pengguna->idPengguna . ',idPengguna',
        'nomorTelepon' => 'nullable|string|max:20|regex:/^[\d\+\-\s]+$/',
        'alamat' => 'nullable|string',
        'foto' => 'nullable|file|image|mimes:jpeg,png,jpg|max:2048',
    ]);


        $pathFoto = $request->hasFile('foto') ? $request->file('foto')->store('foto-profil', 'public') : null;

        
        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        // Update data pengguna
        $pengguna->update([
            'username' => $request->username
        ]);

        // Update data pegawai
        $pegawai = $pengguna->pegawai;
        $pegawai->update([
            'namaLengkap' => $request->namaLengkap,
            'nomorTelepon' => $request->nomorTelepon,
            'nik_nip' => $request->nik_nip,
            'alamat' => $request->alamat,
            'urlFotoProfil' => $pathFoto ?? $pegawai->urlFotoProfil,
        ]);


        return response()->json(['message' => 'Profil berhasil diperbarui.']);
    }

    // Get Profil Instruktur
    public function getProfilInstruktur()
    {
        $user = Auth::user();

        $pengguna = Pengguna::with(['pegawai.instruktur'])->find($user->idPengguna);

        if (!$pengguna) {
            return response()->json(['message' => 'Profil tidak ditemukan.'], 404);
        }

        $pegawai = $pengguna->pegawai;

        if (!$pegawai) {
            return response()->json(['message' => 'Data pegawai tidak ditemukan.'], 404);
        }

        if (!$pegawai || !$pegawai->instruktur) {
            return response()->json(['message' => 'Data instruktur tidak ditemukan.'], 404);
        }
        $instruktur = $pegawai->instruktur;

        return response()->json([
            'namaLengkap' => $pegawai->namaLengkap,
            'username' => $pengguna->username,
            'email' => $pengguna->email,
            'nik_nip' => $pegawai->nik_nip,
            'nomorTelepon' => $pegawai->nomorTelepon ?? null,
            'keahlian' => $instruktur->keahlian,
            'waktuMulai' => $instruktur->waktuMulai,
            'waktuBerakhir' => $instruktur->waktuBerakhir,
            'tglKetersediaan' => $instruktur->tglKetersediaan,
            'alamat' => $pegawai->alamat ?? null,
            'urlFotoProfil' => $pegawai->urlFotoProfil ?? null,
        ]);
    }

    // Update Profil Instruktur
    public function updateProfilInstruktur(Request $request)
    {
        $user = Auth::user();

        $pengguna = Pengguna::with('pegawai')->find($user->idPengguna);
        $pegawai = $pengguna->pegawai;

        if (!$pengguna) {
            return response()->json(['message' => 'Profil tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'namaLengkap' => 'required|string|max:255',
            'nomorTelepon' => 'nullable|string|max:20|regex:/^[\d\+\-\s]+$/',
            'alamat' => 'nullable|string',
            'foto' => 'nullable|file|image|mimes:jpeg,png,jpg|max:2048',
            'nik_nip' => 'required|string|max:20|unique:pegawai,nik_nip,' . $pegawai->idPegawai . ',idPegawai',
            'username' => 'required|string|unique:pengguna,username,' . $pengguna->idPengguna . ',idPengguna',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        // Proses upload foto jika ada
        $pathFoto = $request->hasFile('foto') ? $request->file('foto')->store('foto-profil', 'public') : null; 

        // Update data pengguna
        $pengguna->update([
            'username' => $request->username
        ]);

        // Update data pegawai
        $pegawai = $pengguna->pegawai;
        $pegawai->update([
            'namaLengkap' => $request->namaLengkap,
            'nik_nip' => $request->nik_nip,
            'nomorTelepon' => $request->nomorTelepon,
            'alamat' => $request->alamat,
            'urlFotoProfil' => $pathFoto ?? $pegawai->urlFotoProfil,
        ]);

        return response()->json(['message' => 'Profil instruktur berhasil diperbarui.']);
    }
}

