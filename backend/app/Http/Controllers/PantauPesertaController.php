<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengguna;
use App\Models\PesertaKursus;
use Carbon\Carbon;

class PantauPesertaController extends Controller
{
    // Menampilkan daftar peserta dengan paket kursus dan sisa masa berlaku
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Pengguna::with([
            'peserta.pesertaPaket.paket'
        ])->whereNotNull('idPeserta'); // Pastiin hanya peserta, bukan pegawai

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('peserta', function ($q2) use ($search) {
                      $q2->where('namaLengkap', 'like', "%{$search}%")
                         ->orWhere('nik', 'like', "%{$search}%");
                  });
            });
        }

        $penggunas = $query->get();

        $result = $penggunas->map(function ($pengguna) {
            $peserta = $pengguna->peserta;
            $paketSaatIni = $peserta->pesertaPaket->where('paketSaatIni', true)->first();

            return [
                'namaLengkap' => $peserta->namaLengkap,
                'username' => $pengguna->username,
                'email' => $pengguna->email,
                'paketKursus' => $paketSaatIni ? $paketSaatIni->paket->namaPaket : null,
                'sisaMasaBerlaku' => $paketSaatIni && $paketSaatIni->tglBerakhir
                ? now()->diffInDays($paketSaatIni->tglBerakhir)
                : null,
            ];
        });

        return response()->json([
            'data' => $result
        ]);
    }
}
