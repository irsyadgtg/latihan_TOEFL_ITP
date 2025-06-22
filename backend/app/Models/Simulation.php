<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Simulation extends Model
{
    use HasFactory;

    protected $fillable = [
        'idPengguna',
        'simulation_set_id',
        'started_at',
        'finished_at',
        'score_listening',
        'score_structure',
        'score_reading',
        'total_score',
        // Only 4 new fields
        'status',
        'time_spent_listening',
        'time_spent_structure',
        'time_spent_reading',
    ];

    // Helper method for controller
    public function getCurrentSection()
    {
        switch ($this->status) {
            case 'not_started':
                return null;
            case 'in_progress_listening':
                return 'listening';
            case 'in_progress_structure':
                return 'structure';
            case 'in_progress_reading':
                return 'reading';
            default:
                return null;
        }
    }

    // 🔥 NEW: Relasi ke User
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'idPengguna', 'idPengguna');
    }

    // 🔥 NEW: Relasi ke SimulationSet  
    public function simulationSet()
    {
        return $this->belongsTo(SimulationSet::class);
    }
}