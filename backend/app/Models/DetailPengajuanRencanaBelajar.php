<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailPengajuanRencanaBelajar extends Model
{
    use HasFactory;

    protected $table = 'detail_pengajuan_rencana_belajar';
    protected $primaryKey = 'idDetailPengajuan';
    protected $fillable = [
        'idSkill', 
        'idPengajuanRencanaBelajar'
    ];

    public function skill()
    {
        return $this->belongsTo(Skill::class, 'idSkill');
    }

    
    public function rencanaBelajar()
    {
        return $this->belongsTo(PengajuanRencanaBelajar::class, 'idPengajuanRencanaBelajar');
    }
}
