<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailFeedbackRencanaBelajar extends Model
{
    use HasFactory;

    protected $table = 'detail_feedback_rencana_belajar';
    protected $primaryKey = 'idDetailFeedback';
    protected $fillable = [
        'idSkill', 
        'idFeedbackRencanaBelajar',
    ];

    public function feedbackRencanaBelajar()
    {
        return $this->belongsTo(FeedbackRencanaBelajar::class, 'idFeedbackRencanaBelajar');
    }

    public function skill()
    {
        return $this->belongsTo(Skill::class, 'idSkill');
    }   
}
