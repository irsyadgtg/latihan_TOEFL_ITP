<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengajuanRencanaBelajar extends Model
{
    use HasFactory;

    protected $table = 'pengajuan_rencana_belajar';
    protected $primaryKey = 'idPengajuanRencanaBelajar';
    protected $fillable = [
        'namaRencana', 
        'targetSkor', 
        'targetWaktu', 
        'hariPerMinggu',
        'jamPerHari',
        'tglPengajuan', 
        'status', 
        'isAktif', 
        'tanggalMulai', 
        'selesaiPada',
        'idPengajuanSkorAwal', 
        'idPeserta'
    ];

    public function peserta()
    {
        return $this->belongsTo(PesertaKursus::class, 'idPeserta');
    }

    public function pengajuanSkor()
    {
        return $this->belongsTo(PengajuanSkorAwal::class, 'idPengajuanSkorAwal');
    }

    public function detailPengajuanRencanaBelajar()
    {
        return $this->hasMany(DetailPengajuanRencanaBelajar::class, 'idPengajuanRencanaBelajar');
    }

    public function feedbackRencanaBelajar()
    {
        return $this->hasOne(FeedbackRencanaBelajar::class, 'idPengajuanRencanaBelajar');
    }
}
