<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PesertaKursus extends Model
{
    use HasFactory;

    protected $table = 'peserta_kursus';
    protected $primaryKey = 'idPeserta';

    protected $fillable = [
        'namaLengkap',
        'alamat',
        'nomorTelepon',
        'urlFotoProfil',
        'status',
        'nik',
    ];


    public function pengguna()
    {
        return $this->hasOne(Pengguna::class, 'idPeserta');
    }

    public function pengajuanSkor()
    {
        return $this->hasMany(PengajuanSkorAwal::class, 'idPeserta');
    }

    public function pesertaPaket()
    {
        return $this->hasMany(PesertaPaketKursus::class, 'idPeserta');
    }

    public function rencanaBelajar()
    {
        return $this->hasMany(PengajuanRencanaBelajar::class, 'idPeserta');
    }

}
