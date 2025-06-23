<?php

namespace App\Observers;

use App\Models\Transaksi;
use App\Models\NotifikasiAdmin;

class TransaksiObserver
{
    /**
     * Handle the Transaksi "created" event.
     */
    public function created(Transaksi $transaksi): void
    {
        NotifikasiAdmin::create([
            'pesan' => "Peserta {$transaksi->pesertaPaket->peserta->namaLengkap} melakukan pembayaran sebesar Rp " . number_format($transaksi->nominal, 0, ',', '.'),
            'jenisNotifikasi' => 'TRANSAKSI_PEMBAYARAN',
            'sumberId' => $transaksi->idTransaksi,
            'sumberTipe' => 'Transaksi',
        ]);
    }

    /**
     * Handle the Transaksi "updated" event.
     */
    public function updated(Transaksi $transaksi): void
    {
        //
    }

    /**
     * Handle the Transaksi "deleted" event.
     */
    public function deleted(Transaksi $transaksi): void
    {
        //
    }

    /**
     * Handle the Transaksi "restored" event.
     */
    public function restored(Transaksi $transaksi): void
    {
        //
    }

    /**
     * Handle the Transaksi "force deleted" event.
     */
    public function forceDeleted(Transaksi $transaksi): void
    {
        //
    }
}
