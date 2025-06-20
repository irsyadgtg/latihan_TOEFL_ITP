<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Instruktur extends Model
{
    use HasFactory;

    protected $table = 'instruktur';
    protected $primaryKey = 'idInstruktur';

     protected $fillable = [
        'keahlian',
        'waktuMulai',
        'waktuBerakhir',
        'tglKetersediaan',
        'idPegawai',
    ];

    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'idPegawai');
    }

    public function feedbackRencanaBelajar()
    {
        return $this->hasMany(FeedbackRencanaBelajar::class, 'idInstruktur');
    }
}
