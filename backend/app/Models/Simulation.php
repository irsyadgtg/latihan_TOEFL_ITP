<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Simulation extends Model
{
    use HasFactory;

    protected $fillable = [
        'idPengguna',
        'simulation_set_id',
        'status',
        
        //  EXISTING: Global simulation timestamps
        'started_at',
        'finished_at',
        
        //  NEW: Per-section start timestamps - UNTUK TIMER RESUME
        'listening_started_at',
        'structure_started_at', 
        'reading_started_at',
        
        // EXISTING: Time spent per section (seconds)
        'time_spent_listening',
        'time_spent_structure',
        'time_spent_reading',
        
        //  NEW: Timer sync tracking
        'last_timer_sync',
        
        //  EXISTING: Scores
        'score_listening',
        'score_structure',
        'score_reading',
        'total_score',
    ];

    //  Cast timestamps to Carbon instances
    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'listening_started_at' => 'datetime',
        'structure_started_at' => 'datetime',
        'reading_started_at' => 'datetime',
        'last_timer_sync' => 'datetime',
    ];

    //  EXISTING: Get current section from status
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

    //  NEW: Check if simulation is in progress (diperlukan untuk syncTimer)
    public function isInProgress()
    {
        return in_array($this->status, [
            'in_progress_listening',
            'in_progress_structure', 
            'in_progress_reading'
        ]);
    }

    //  NEW: Get section start timestamp
    public function getSectionStartedAt($section = null)
    {
        $section = $section ?? $this->getCurrentSection();
        
        if (!$section) {
            return null;
        }
        
        return $this->{"{$section}_started_at"};
    }

    //  NEW: Start a specific section (set timestamp)
    public function startSection($section)
    {
        $field = "{$section}_started_at";
        
        if (!$this->$field) {
            $this->update([$field => now()]);
        }
        
        return $this->$field;
    }

    //  NEW: Calculate elapsed time for current section in seconds
    public function getElapsedTimeForCurrentSection()
    {
        $currentSection = $this->getCurrentSection();
        
        if (!$currentSection) {
            return 0;
        }
        
        $sectionStartedAt = $this->getSectionStartedAt($currentSection);
        
        if (!$sectionStartedAt) {
            return 0;
        }
        
        return now()->diffInSeconds($sectionStartedAt);
    }

    //  NEW: Get remaining time for current section in seconds
    public function getRemainingTimeForCurrentSection()
    {
        $currentSection = $this->getCurrentSection();
        
        if (!$currentSection) {
            return 0;
        }
        
        // Time limits per section (in minutes)
        $timeLimits = [
            'listening' => 35,
            'structure' => 25,
            'reading' => 55
        ];
        
        $timeLimitSeconds = ($timeLimits[$currentSection] ?? 60) * 60;
        $elapsedSeconds = $this->getElapsedTimeForCurrentSection();
        
        return max(0, $timeLimitSeconds - $elapsedSeconds);
    }

    //  NEW: Check if current section time has expired
    public function isCurrentSectionExpired()
    {
        return $this->getRemainingTimeForCurrentSection() <= 0;
    }

    //  EXISTING: Relationships
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'idPengguna', 'idPengguna');
    }

    public function simulationSet()
    {
        return $this->belongsTo(SimulationSet::class);
    }
    
    public function userAnswers()
    {
        return $this->hasMany(UserAnswer::class);
    }
}