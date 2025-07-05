<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PesertaPaketKursus extends Model
{
    use HasFactory;

    protected $table = 'peserta_paket_kursus';
    protected $primaryKey = 'idPesertaPaketKursus';

    protected $casts = [
    'tglMulai' => 'datetime',
    'tglBerakhir' => 'datetime',
    'statusAktif' => 'boolean',
    'paketSaatIni' => 'boolean',
    ];

    protected $fillable = [
        'tglMulai',
        'tglBerakhir',
        'statusAktif',
        'paketSaatIni',
        'idPeserta',
        'idPaketKursus',
    ];


    public function peserta()
    {
        return $this->belongsTo(PesertaKursus::class, 'idPeserta');
    }

    public function paket()
    {
        return $this->belongsTo(PaketKursus::class, 'idPaketKursus');
    }

    public function transaksi()
    {
        return $this->hasOne(Transaksi::class, 'idPesertaPaketKursus');
    }

}
