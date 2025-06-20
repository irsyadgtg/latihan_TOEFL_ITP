<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengguna;
use App\Models\Pegawai;
use App\Models\PesertaKursus;
use App\Models\PesertaPaketkursus;
use App\Models\PaketKursus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardAdminController extends Controller
{
    public function getDashboardData()
    {
        //Hitung jumlah user per role
        $totalPeserta = PesertaKursus::where('status', 'aktif')->count();
        $totalInstruktur = Pegawai::where('status', 'aktif')
            ->whereHas('pengguna', function ($query) {
                $query->where('role', 'instruktur');
            })->count();
        $totalAdmin = Pegawai::where('status', 'aktif')
            ->whereHas('pengguna', function ($query) {
                $query->where('role', 'admin');
            })->count();
 
        //Hitung total peserta per paket kursus
        $paketKursusData = PaketKursus::withCount([
            'pesertaPaket as totalPeserta',
            'pesertaPaket as totalPesertaAktif' => function ($query) {
                $query->where('paketSaatIni', true);
            }
        ])->get();

        $paketKursus = $paketKursusData->map(function ($paket) {
            return [
                'namaPaket' => $paket->namaPaket,
                'totalPeserta' => $paket->totalPeserta,
                'totalPesertaAktif' => $paket->totalPesertaAktif,
            ];
        });

        //Statistik pertumbuhan peserta (per bulan-tahun)
        // Subquery buat ambil pengajuan pertama per peserta yang disetujui
        $subquery = DB::table('pengajuan_skor_awal')
            ->select('idPeserta', DB::raw('MIN(tglPengajuan) as tglPengajuan'))
            ->where('status', 'Disetujui')
            ->groupBy('idPeserta');

        // Query utama
        $pertumbuhanPeserta = DB::table('pengajuan_skor_awal as psa')
            ->joinSub($subquery, 'min_tgl', function($join) {
                $join->on('psa.idPeserta', '=', 'min_tgl.idPeserta');
            })
            ->select(
                DB::raw('YEAR(min_tgl.tglPengajuan) as tahun'),
                DB::raw('MONTH(min_tgl.tglPengajuan) as bulan'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('tahun', 'bulan')
            ->orderBy('tahun')
            ->orderBy('bulan')
            ->get();

        return response()->json([
            'totalUserPerRole' => [
                'peserta' => $totalPeserta,
                'instruktur' => $totalInstruktur,
                'admin' => $totalAdmin,
            ],
            'totalPesertaPerPaket' => $paketKursus,
            'pertumbuhanPeserta' => $pertumbuhanPeserta,
        ]);
    }
}
