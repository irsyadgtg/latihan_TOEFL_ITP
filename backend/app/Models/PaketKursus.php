<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaketKursus extends Model
{
    use HasFactory;

    protected $table = 'paket_kursus';
    protected $primaryKey = 'idPaketKursus';

    protected $fillable = [
        'namaPaket',
        'harga',
        'masaBerlaku',
        'fasilitas',
        'aktif',
        'idPegawai'
    ];

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'idPegawai');
    }

    public function pesertaPaket()
    {
        return $this->hasMany(PesertaPaketKursus::class, 'idPaketKursus');
    }

}
