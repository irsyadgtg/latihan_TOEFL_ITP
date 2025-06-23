<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotifikasiAdmin extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'notifikasi_admin';

    protected $primaryKey = 'idNotifikasi';

    protected $fillable = [
        'pesan',
        'jenisNotifikasi',
        'sudahDibaca',
        'tglDibuat',
        'sumberId',
        'sumberTipe',
    ];
}
