<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    use HasFactory;

    protected $table = 'transaksi';
    protected $primaryKey = 'idTransaksi';
    protected $fillable = [
        'kodeTransaksi',
        'nominal',
        'status',
        'buktiPembayaran',
        'keterangan',
        'idPesertaPaketKursus'
    ];

    public function pesertaPaket()
    {
        return $this->belongsTo(PesertaPaketKursus::class, 'idPesertaPaketKursus');
    }
}
