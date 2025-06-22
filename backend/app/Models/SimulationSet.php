<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SimulationSet extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description', 
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function simulations()
    {
        return $this->hasMany(Simulation::class);
    }

    // Time limits constants
    public static function getTimeLimits()
    {
        return [
            'listening' => 2100, // 35 minutes
            'structure' => 1500, // 25 minutes
            'reading' => 3300,   // 55 minutes
        ];
    }

    // Scope untuk simulasi aktif
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}