<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\PesertaPaketKursus;
use App\Models\PaketKursus;
use App\Models\Pegawai;
use Illuminate\Support\Facades\Mail;

class AdminTransaksiController extends Controller
{
    //List semua transaksi
    public function listTransaksi()
    {
        $transaksi = Transaksi::with([
            'pesertaPaket.paket',
            'pesertaPaket.peserta'
        ])->get();

        return response()->json($transaksi);
    }

    //Detail transaksi
    public function detailTransaksi($id)
    {
        $transaksi = Transaksi::with([
            'pesertaPaket.paket',
            'pesertaPaket.peserta'
        ])->find($id);

        if (!$transaksi) {
            return response()->json(['message' => 'Transaksi tidak ditemukan'], 404);
        }

        return response()->json($transaksi);
    }

    //Verifikasi transaksi
    public function verifikasiTransaksi(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:BERHASIL,DITOLAK',
            'keterangan' => 'nullable|string'
        ]);

        if ($request->status == 'DITOLAK' && empty($request->keterangan)) {
            return response()->json(['message' => 'Keterangan harus diisi jika status DITOLAK'], 422);
        }

        $transaksi = Transaksi::with([
            'pesertaPaket.paket'
        ])->find($id);

        if (!$transaksi) {
            return response()->json(['message' => 'Transaksi tidak ditemukan'], 404);
        }

        $transaksi->update([
            'status' => $request->status,
            'keterangan' => $request->keterangan ?? null
        ]);

        if ($request->status == 'BERHASIL') {
            $pesertaPaket = $transaksi->pesertaPaket;

            // Safety check, pastikan relasi paketKursus tidak null
            if (!$pesertaPaket || !$pesertaPaket->paket) {
                return response()->json(['message' => 'Data paket kursus tidak valid'], 422);
            }

            $tglBerakhir = now()->addMonths($pesertaPaket->paket->masaBerlaku);

            // Aktifkan paket
            $pesertaPaket->update([
                'statusAktif' => true,
                'paketSaatIni' => true,
                'tglMulai' => now(),
                'tglBerakhir' => $tglBerakhir,
            ]);

            // Nonaktifkan paket lain (jika ada)
            PesertaPaketKursus::where('idPeserta', $pesertaPaket->idPeserta)
                ->where('idPesertaPaketKursus', '!=', $pesertaPaket->idPesertaPaketKursus)
                ->update(['paketSaatIni' => false]);
        }

        $admin = Pegawai::where('jabatan', 'Staff Administrasi')->first();
        $nomorAdmin = $admin ? $admin->nomor_hp : '-';

        // Kirim email konfirmasi setelah update status
        $peserta = $transaksi->pesertaPaket->peserta;
        $pengguna = $transaksi->pesertaPaket->peserta->pengguna;
        $paket = $transaksi->pesertaPaket->paket;
        $nominal = number_format($transaksi->nominal, 0, ',', '.'); // format rupiah

        $subject = "Konfirmasi Pembayaran Paket Kursus";
        $statusPembayaran = $request->status == 'BERHASIL' ? 'Berhasil' : 'Ditolak';
        $pesan = "
            Halo {$peserta->namaLengkap},\n\n
            Kami telah memproses pembayaran Anda untuk paket: {$paket->namaPaket}.\n
            Total pembayaran: Rp {$nominal}\n
            Status pembayaran: {$statusPembayaran}\n\n
            ";

        if ($request->status == 'BERHASIL') {
            $pesan .= "Paket Anda sudah aktif dan dapat digunakan hingga tanggal " . $tglBerakhir->format('d-m-Y') . ".\n\n";
            $pesan .= "Selamat belajar! Jika ada pertanyaan, jangan ragu untuk menghubungi kami.";
        } else {
            $pesan .= "Mohon maaf, pembayaran Anda ditolak. Alasan penolakan: {$request->keterangan}\n\n";
            $pesan .= "Silakan lakukan pembayaran ulang atau hubungi admin untuk informasi lebih lanjut di: {$nomorAdmin}.";
        }

        // Kirim email
        if (!empty($pengguna->email)) {
        \Mail::raw($pesan, function ($message) use ($pengguna, $subject) {
            $message->to($pengguna->email)
                    ->subject($subject);
        });
        } else {
            // Optional: bisa juga logging, atau minimal return warning
            \Log::warning('Email pengguna kosong untuk peserta id: ' . $peserta->id);
        }

        return response()->json(['message' => 'Status transaksi berhasil diperbarui']);
    }

}
