<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    // UPDATED: Remove 'difficulty' field from fillable
    protected $fillable = [
        'simulation_set_id',
        'modul',
        'unit_number',
        'question_text',
        'attachment',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'correct_option',
        'explanation',
        // 'difficulty', // REMOVED - not used in TOEFL ITP
        'order_number',
        'group_id'
    ];

    public function userAnswers()
    {
        return $this->hasMany(UserAnswer::class);
    }

    public function simulationSet()
    {
        return $this->belongsTo(SimulationSet::class);
    }

    public function groupParent()
    {
        return $this->belongsTo(Question::class, 'group_id');
    }

    public function groupChildren()
    {
        return $this->hasMany(Question::class, 'group_id');
    }
}