<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pegawai;
use App\Models\Instruktur;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InstrukturController extends Controller
{
    //Daftar instruktur (admin)
    public function daftarInstrukturAdmin()
    {
        $daftar = Pegawai::where('jabatan', 'instruktur')
            ->join('instruktur', 'pegawai.idPegawai', '=', 'instruktur.idPegawai')
            ->join('pengguna', 'pegawai.idPegawai', '=', 'pengguna.idPegawai')
            ->select(
                'pegawai.idPegawai',
                'pegawai.namaLengkap',
                'pegawai.status',
                'pegawai.urlFotoProfil',
                'pengguna.email',
                'pengguna.username',
                'instruktur.idInstruktur',
                'instruktur.keahlian',
                'instruktur.tglKetersediaan',
                'instruktur.waktuMulai',
                'instruktur.waktuBerakhir'
            )
            ->get();

        return response()->json(['data' => $daftar]);
    }

    // Tambah Instruktur + akun pengguna
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'namaLengkap' => 'required|string|max:255',
            'nik_nip' => 'required|string|max:20|unique:pegawai,nik_nip',
            'keahlian' => 'required|string',
            'waktuMulai' => 'required|date_format:H:i',
            'waktuBerakhir' => 'required|date_format:H:i|after:waktuMulai',
            'tglKetersediaan' => 'required|date|after_or_equal:today',
            'username' => 'required|string|unique:pengguna,username',
            'email' => 'required|email|unique:pengguna,email',
            'foto' => 'nullable|file|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $pathFoto = $request->hasFile('foto') ? $request->file('foto')->store('foto-profil', 'public') : null;


        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        // Buat pegawai
        $pegawai = Pegawai::create([
            'namaLengkap' => $request->namaLengkap,
            'nik_nip' => $request->nik_nip,
            'jabatan' => 'instruktur',
            'status' => 'aktif',
            'urlFotoProfil' => $pathFoto,
        ]);

        $passwordDefault = Str::random(10);

        $pengguna = Pengguna::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($passwordDefault),
            'role' => 'instruktur',
            'idPegawai' => $pegawai->idPegawai,
        ]);

        Instruktur::create([
            'keahlian' => $request->keahlian,
            'waktuMulai' => $request->waktuMulai,
            'waktuBerakhir' => $request->waktuBerakhir,
            'tglKetersediaan' => $request->tglKetersediaan,
            'idPegawai' => $pegawai->idPegawai,
        ]);

         // Kirim email undangan login
        $loginUrl = config('app.frontend_url') . '/login';
        $body = "Halo {$request->namaLengkap},\n\n".
                "Akun instruktur Anda telah dibuat.\n\n".
                "Email: {$request->email}\n".
                "Username: {$request->username}\n".
                "Password: {$passwordDefault}\n\n".
                "Silakan login di: {$loginUrl}\n\n".
                "Salam,\nAdmin";

        Mail::raw($body, function ($message) use ($request) {
            $message->to($request->email)
                    ->subject('Undangan Login ke Sistem');
        });

        return response()->json(['message' => 'Instruktur berhasil ditambahkan dan email undangan login dikirim'], 201);
    }

    // Nonaktifkan instruktur
    public function delete($id)
    {
        $pegawai = Pegawai::find($id);

        if (!$pegawai || $pegawai->jabatan !== 'instruktur') {
            return response()->json(['message' => 'Instruktur tidak ditemukan'], 404);
        }

        $pegawai->status = 'nonaktif';
        $pegawai->save();

        return response()->json(['message' => 'Instruktur berhasil dihapus dengan dinonaktifkan']);
    }

    // Ubah ketersediaan instruktur
    public function ubahKetersediaan(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'keahlian' => 'required|string',
            'waktuMulai' => 'required|date_format:H:i',
            'waktuBerakhir' => 'required|date_format:H:i|after:waktuMulai',
            'tglKetersediaan' => 'required|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $instruktur = Instruktur::where('idPegawai', $id)->first();

        if (!$instruktur) {
            return response()->json(['message' => 'Instruktur tidak ditemukan'], 404);
        }

        $instruktur->update($request->only('keahlian', 'waktuMulai', 'waktuBerakhir', 'tglKetersediaan'));

        return response()->json(['message' => 'Ketersediaan instruktur berhasil diperbarui']);
    }

    //Detail instruktur untuk ubah ketersediaan
    public function getDetailInstruktur($id)
    {
        $instruktur = Instruktur::with(['pegawai.pengguna'])->where('idPegawai', $id)->first();

        if (!$instruktur) {
            return response()->json(['message' => 'Instruktur tidak ditemukan'], 404);
        }

        $pegawai = $instruktur->pegawai;
        $pengguna = $pegawai?->pengguna;

        return response()->json([
            'namaLengkap' => $pegawai->namaLengkap ?? null,
            'username' => $pengguna->username ?? null,
            'nik_nip' => $pegawai->nik_nip ?? null, // rename jadi nik_nip , migrate ulang
            'email' => $pengguna->email ?? null,
            'idInstruktur' => $instruktur->idInstruktur,
            'keahlian' => $instruktur->keahlian,
            'foto' => $pegawai->urlFotoProfil ?? null,
            'waktuMulai' => $instruktur->waktuMulai,
            'waktuBerakhir' => $instruktur->waktuBerakhir,
            'tglKetersediaan' => $instruktur->tglKetersediaan,
        ]);
    }

    // Daftar instruktur aktif (untuk peserta dan instruktur)
    public function daftarAktif()
    {
        $daftarInstruktur = Pegawai::where('jabatan', 'instruktur')
            ->where('status', 'aktif')
            ->join('instruktur', 'pegawai.idPegawai', '=', 'instruktur.idPegawai')
            ->select('pegawai.namaLengkap', 'pegawai.urlFotoProfil', 'instruktur.keahlian', 'instruktur.tglKetersediaan', 'instruktur.waktuMulai', 'instruktur.waktuBerakhir')
            ->get();

        return response()->json(['data' => $daftarInstruktur]);
    }
}
