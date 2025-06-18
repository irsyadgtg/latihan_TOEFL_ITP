<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengajuanSkorAwal extends Model
{
     use HasFactory;

    protected $table = 'pengajuan_skor_awal';
    protected $primaryKey = 'idPengajuanSkorAwal';

    protected $fillable = [
        'namaTes',
        'skor',
        'urlDokumenPendukung',
        'tglPengajuan',
        'status',
        'masaBerlakuDokumen',
        'keterangan',
        'tglSeleksi',
        'idPeserta',
        'idPegawai',
    ];

    public function peserta()
    {
        return $this->belongsTo(PesertaKursus::class, 'idPeserta');
    }

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'idPegawai');
    }

    public function rencanaBelajar()
    {
        return $this->hasMany(PengajuanRencanaBelajar::class, 'idPengajuanSkorAwal');
    }

}
