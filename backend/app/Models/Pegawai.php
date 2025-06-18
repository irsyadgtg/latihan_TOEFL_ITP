<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pegawai extends Model
{
    use HasFactory;

    protected $table = 'pegawai';
    protected $primaryKey = 'idPegawai';

     protected $fillable = [
        'nik_nip',
        'jabatan',
        'namaLengkap',
        'nomorTelepon',
        'alamat',
        'urlFotoProfil',
        'status',
    ];

    public function pengguna()
    {
        return $this->hasOne(Pengguna::class, 'idPegawai');
    }

    public function instruktur()
    {
        return $this->hasOne(Instruktur::class, 'idPegawai');
    }

    public function paketKursus()
    {
        return $this->hasMany(PaketKursus::class, 'idPegawai');
    }

    public function pengajuanSkor()
    {
        return $this->hasMany(PengajuanSkorAwal::class, 'idPegawai');
    }

}
