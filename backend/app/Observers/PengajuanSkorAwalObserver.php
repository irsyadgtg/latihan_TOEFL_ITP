<?php

namespace App\Observers;

use App\Models\PengajuanSkorAwal;
use App\Models\NotifikasiAdmin;

class PengajuanSkorAwalObserver
{
    /**
     * Handle the PengajuanSkorAwal "created" event.
     */
    public function created(PengajuanSkorAwal $pengajuanSkorAwal): void
    {
        NotifikasiAdmin::create([
            'pesan' => "Ada pengajuan skor awal baru dari {$pengajuanSkorAwal->peserta->namaLengkap}",
            'jenisNotifikasi' => 'PENGAJUAN_SKOR_AWAL',
            'sumberId' => $pengajuanSkorAwal->idPengajuanSkorAwal,
            'sumberTipe' => 'PengajuanSkorAwal',
        ]);
    }

    /**
     * Handle the PengajuanSkorAWal "updated" event.
     */
    public function updated(PengajuanSkorAwal $pengajuanSkorAwal): void
    {
        //
    }

    /**
     * Handle the PengajuanSkorAWal "deleted" event.
     */
    public function deleted(PengajuanSkorAwal $pengajuanSkorAwal): void
    {
        //
    }

    /**
     * Handle the PengajuanSkorAWal "restored" event.
     */
    public function restored(PengajuanSkorAWal $pengajuanSkorAWal): void
    {
        //
    }

    /**
     * Handle the PengajuanSkorAWal "force deleted" event.
     */
    public function forceDeleted(PengajuanSkorAWal $pengajuanSkorAWal): void
    {
        //
    }
}
