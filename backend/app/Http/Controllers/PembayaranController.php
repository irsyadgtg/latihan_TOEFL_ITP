<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaketKursus;
use App\Models\PesertaPaketKursus;
use App\Models\Transaksi;
use App\Models\PengajuanRencanaBelajar;
use App\Models\PengajuanSkorAwal;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PembayaranController extends Controller
{
    public function showPaketDetail($id)
    {
        $peserta = Auth::user();

        $paketKursus = PaketKursus::with('pegawai:idPegawai,namaLengkap')
            ->where('idPaketKursus', $id)
            ->where(function ($query) use ($peserta) {
                $query->where('aktif', true)
                    ->orWhereIn('idPaketKursus', function($subquery) use ($peserta) {
                        $subquery->select('idPaketKursus')
                            ->from('peserta_paket_kursus')
                            ->where('idPeserta', $peserta->idPeserta)
                            ->where('statusAktif', true)
                            ->where('paketSaatIni', true);
                    });
            })
            ->first();

        if (!$paketKursus) {
            return response()->json(['message' => 'Paket tidak ditemukan atau tidak tersedia untuk anda'], 404);
        }

        return response()->json($paketKursus);
    }

    public function checkEligibility($id)
    {   
        $peserta = Auth::user();
        $idPeserta = Auth::user()->idPeserta;
        $paketKursus = PaketKursus::with('pegawai:idPegawai,namaLengkap')
            ->where('idPaketKursus', $id)
            ->where(function ($query) use ($peserta) {
                $query->where('aktif', true)
                    ->orWhereIn('idPaketKursus', function($subquery) use ($peserta) {
                        $subquery->select('idPaketKursus')
                            ->from('peserta_paket_kursus')
                            ->where('idPeserta', $peserta->idPeserta)
                            ->where('statusAktif', true)
                            ->where('paketSaatIni', true);
                    });
            })
            ->first();

        if (!$paketKursus) {
            return response()->json(['message' => 'Paket tidak ditemukan atau tidak tersedia untuk anda'], 404);
        }

        // Tambahkan cek apakah paket gratis
        if ($paketKursus->harga == 0) {
            return response()->json(['message' => 'Paket ini gratis. Anda bisa langsung mengakses tanpa perlu pembelian.']);
        }

        $sudahPunyaPaketAktif = PesertaPaketKursus::where('idPeserta', $idPeserta)
            ->where('statusAktif', true)
            ->where('paketSaatIni', true)
            ->exists();

        if ($sudahPunyaPaketAktif) {
            return response()->json(['message' => 'Anda sudah memiliki paket aktif saat ini. Tidak bisa membeli paket baru.'], 400);
        }

        $prb = PengajuanRencanaBelajar::where('idPeserta', $idPeserta)
            ->where('status', 'Sudah ada feedback')
            ->latest('created_at')->first();

        if (!$prb) {
            return response()->json(['message' => 'Belum ada pengajuan rencana belajar yang valid.'], 400);
        }

        $psa = PengajuanSkorAwal::find($prb->idPengajuanSkorAwal);
        if (!$psa || $psa->status != 'Disetujui' || Carbon::now()->gt($psa->masaBerlaku)) {
            return response()->json(['message' => 'Pengajuan Skor Awal tidak valid atau sudah kadaluarsa.'], 400);
        }

        return response()->json(['message' => 'Eligible untuk membeli paket kursus ini. Silakan upload bukti pembayaran.']);
    }

    public function beliPaketInfo($id)
    {
         $peserta = Auth::user();
         $idPeserta = Auth::user()->idPeserta;
         $paketKursus = PaketKursus::with('pegawai:idPegawai,namaLengkap')
            ->where('idPaketKursus', $id)
            ->where(function ($query) use ($peserta) {
                $query->where('aktif', true)
                    ->orWhereIn('idPaketKursus', function($subquery) use ($peserta) {
                        $subquery->select('idPaketKursus')
                            ->from('peserta_paket_kursus')
                            ->where('idPeserta', $peserta->idPeserta)
                            ->where('statusAktif', true)
                            ->where('paketSaatIni', true);
                    });
            })
            ->first();

        if (!$paketKursus) {
            return response()->json(['message' => 'Paket tidak ditemukan atau tidak tersedia untuk anda'], 404);
        }

        // Tambahkan cek apakah paket gratis
        if ($paketKursus->harga == 0) {
            return response()->json(['message' => 'Paket ini gratis. Anda bisa langsung mengakses tanpa perlu pembelian.']);
        }

        $sudahPunyaPaketAktif = PesertaPaketKursus::where('idPeserta', $idPeserta)
            ->where('statusAktif', true)
            ->where('paketSaatIni', true)
            ->exists();

        if ($sudahPunyaPaketAktif) {
            return response()->json(['message' => 'Anda sudah memiliki paket aktif saat ini. Tidak bisa membeli paket baru.'], 400);
        }

        $prb = PengajuanRencanaBelajar::where('idPeserta', $idPeserta)
            ->where('status', 'Sudah ada feedback')
            ->latest('created_at')->first();

        if (!$prb) {
            return response()->json(['message' => 'Belum ada pengajuan rencana belajar yang valid.'], 400);
        }

        $psa = PengajuanSkorAwal::find($prb->idPengajuanSkorAwal);
        if (!$psa || $psa->status != 'Disetujui' || Carbon::now()->gt($psa->masaBerlaku)) {
            return response()->json(['message' => 'Pengajuan Skor Awal tidak valid atau sudah kadaluarsa.'], 400);
        }

        return response()->json([
            'message' => 'Eligible untuk membeli paket kursus ini. Silakan upload bukti pembayaran.',
            'nama_paket' => $paketKursus->namaPaket,
            'harga' => $paketKursus->harga,
            'bank' => 'Mandiri',
            'nomor_rekening' => '1234567890',
            'nama_rekening' => 'TOEFL ITP LaC'
        ]);
    }


    public function beliPaket(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'buktiPembayaran' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $peserta = Auth::user();
        $idPeserta = Auth::user()->idPeserta;
        $paketKursus = PaketKursus::with('pegawai:idPegawai,namaLengkap')
        ->where('idPaketKursus', $id)
        ->where(function ($query) use ($peserta) {
            $query->where('aktif', true)
                ->orWhereIn('idPaketKursus', function($subquery) use ($peserta) {
                    $subquery->select('idPaketKursus')
                        ->from('peserta_paket_kursus')
                        ->where('idPeserta', $peserta->idPeserta)
                        ->where('statusAktif', true)
                        ->where('paketSaatIni', true);
                });
        })
        ->first();

        if (!$paketKursus) {
            return response()->json(['message' => 'Paket tidak ditemukan atau tidak tersedia untuk anda'], 404);
        }

        // Tambahkan cek apakah paket gratis
        if ($paketKursus->harga == 0) {
            return response()->json(['message' => 'Paket ini gratis. Anda bisa langsung mengakses tanpa perlu pembelian.']);
        }

        $sudahPunyaPaketAktif = PesertaPaketKursus::where('idPeserta', $idPeserta)
            ->where('statusAktif', true)
            ->where('paketSaatIni', true)
            ->exists();

        if ($sudahPunyaPaketAktif) {
            return response()->json(['message' => 'Anda sudah memiliki paket aktif saat ini. Tidak bisa membeli paket baru.'], 400);
        }

        $prb = PengajuanRencanaBelajar::where('idPeserta', $idPeserta)
            ->where('status', 'Sudah ada feedback')
            ->latest('created_at')->first();

        if (!$prb) {
            return response()->json(['message' => 'Belum ada pengajuan rencana belajar yang valid.'], 400);
        }

        $psa = PengajuanSkorAwal::find($prb->idPengajuanSkorAwal);
        if (!$psa || $psa->status != 'Disetujui' || Carbon::now()->gt($psa->masaBerlaku)) {
            return response()->json(['message' => 'Pengajuan Skor Awal tidak valid atau sudah kadaluarsa.'], 400);
        }

        // Cek duplikat transaksi pending
        $cekDuplikat = Transaksi::whereHas('pesertaPaket', function ($query) use ($idPeserta, $id) {
        $query->where('idPeserta', $idPeserta)
                ->where('idPaketKursus', $id);
            })
            ->where('status', 'PENDING')
            ->exists();

        if ($cekDuplikat) {
            return response()->json(['message' => 'Masih ada transaksi pending untuk paket ini.'], 422);
        }

        // Buat record peserta_paket_kursus
        $pesertaPaket = PesertaPaketKursus::create([
            'tglMulai' => now(),
            'idPeserta' => $idPeserta,
            'idPaketKursus' => $id,
            'statusAktif' => false,
            'paketSaatIni' => false,
        ]);

        // Simpan file bukti
        $path = $request->file('buktiPembayaran')->store('bukti_pembayaran', 'public');

        // Generate kodeTransaksi unik
        do {
            $kodeTransaksi = 'TRX-' . date('Ymd') . '-' . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (Transaksi::where('kodeTransaksi', $kodeTransaksi)->exists());

        // Buat transaksi
        Transaksi::create([
            'kodeTransaksi' => $kodeTransaksi,
            'idPeserta' => $idPeserta,
            'idPesertaPaketKursus' => $pesertaPaket->idPesertaPaketKursus,
            'nominal' => $paketKursus->harga,
            'status' => 'PENDING',
            'buktiPembayaran' => $path,
            'keterangan' => null
        ]);

        return response()->json(['message' => 'Pengajuan pembelian paket berhasil, menunggu verifikasi.']);
    }

    public function riwayatTransaksi()
    {
        $idPeserta = Auth::user()->idPeserta;

        $transaksi = Transaksi::whereHas('pesertaPaket', function ($q) use ($idPeserta) {
            $q->where('idPeserta', $idPeserta);
        })->with('pesertaPaket.paket')->get();

        $data = $transaksi->map(function ($trans) {
            return [
                'kodeTransaksi' => $trans->kodeTransaksi,
                'namaPaket' => $trans->pesertaPaket->paket->namaPaket ?? null,
                'hargaPaket' => $trans->pesertaPaket->paket->harga ?? null,
                'nominalBayar' => $trans->nominal,
                'statusTransaksi' => $trans->status,
                'tanggalTransaksi' => $trans->created_at->format('Y-m-d H:i:s'),
                'buktiPembayaran' => $trans->buktiPembayaran,
                'keterangan' => $trans->keterangan,
            ];
        });

        return response()->json($data);
    }
}
