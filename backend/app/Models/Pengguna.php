<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Pengguna extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'pengguna';
    protected $primaryKey = 'idPengguna';

    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'idPeserta',
        'idPegawai'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getKeyName()
    {
        return $this->primaryKey;
    }

    public function peserta()
    {
        return $this->belongsTo(PesertaKursus::class, 'idPeserta');
    }

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'idPegawai');
    }

}
