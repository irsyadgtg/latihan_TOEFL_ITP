<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeedbackRencanaBelajar extends Model
{
    use HasFactory;

    protected $table = 'feedback_rencana_belajar';
    protected $primaryKey = 'idFeedbackRencanaBelajar';
    protected $fillable = [
        'tglPemberianFeedback', 
        'idPengajuanRencanaBelajar', 
        'idInstruktur',
    ];

    public function rencanaBelajar()
    {
        return $this->belongsTo(PengajuanRencanaBelajar::class, 'idPengajuanRencanaBelajar');
    }

    public function instruktur()
    {
        return $this->belongsTo(Instruktur::class, 'idInstruktur');
    }

    public function detailFeedbackRencanaBelajar()
    {
        return $this->hasMany(DetailFeedbackRencanaBelajar::class, 'idFeedbackRencanaBelajar');
    }

}
