<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'idPengguna',
        'question_id',
        'selected_option',
        'is_correct',
        'simulation_id'
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // 🔥 RELASI dengan Pengguna
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'idPengguna', 'idPengguna');
    }

    // 🔥 RELASI dengan Question
    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    // 🔥 RELASI dengan Simulation (nullable)
    public function simulation()
    {
        return $this->belongsTo(Simulation::class);
    }

    // 🔥 SCOPE: Get quiz answers only (not simulation)
    public function scopeQuizOnly($query)
    {
        return $query->whereNull('simulation_id');
    }

    // 🔥 SCOPE: Get simulation answers only
    public function scopeSimulationOnly($query)
    {
        return $query->whereNotNull('simulation_id');
    }

    // 🔥 SCOPE: Get answers for specific user
    public function scopeForUser($query, $idPengguna)
    {
        return $query->where('idPengguna', $idPengguna);
    }

    // 🔥 SCOPE: Get answers for specific modul and unit (quiz only)
    public function scopeForModulUnit($query, $modul, $unitNumber)
    {
        return $query->whereHas('question', function($q) use ($modul, $unitNumber) {
            $q->where('modul', $modul)
              ->where('unit_number', $unitNumber)
              ->whereNull('simulation_set_id'); // Quiz only
        });
    }

    // 🔥 HELPER: Check if user has completed quiz for specific unit
    public static function hasCompletedQuiz($idPengguna, $modul, $unitNumber)
    {
        $totalQuestions = Question::where('modul', $modul)
                                 ->where('unit_number', $unitNumber)
                                 ->whereNull('simulation_set_id')
                                 ->count();

        if ($totalQuestions === 0) {
            return false;
        }

        $answeredQuestions = self::where('idPengguna', $idPengguna)
                                ->whereNull('simulation_id')
                                ->whereHas('question', function($q) use ($modul, $unitNumber) {
                                    $q->where('modul', $modul)
                                      ->where('unit_number', $unitNumber)
                                      ->whereNull('simulation_set_id');
                                })
                                ->count();

        return $answeredQuestions >= $totalQuestions;
    }

    // 🔥 HELPER: Get quiz score for user in specific unit
    public static function getQuizScore($idPengguna, $modul, $unitNumber)
    {
        $answers = self::where('idPengguna', $idPengguna)
                      ->whereNull('simulation_id')
                      ->whereHas('question', function($q) use ($modul, $unitNumber) {
                          $q->where('modul', $modul)
                            ->where('unit_number', $unitNumber)
                            ->whereNull('simulation_set_id');
                      })
                      ->get();

        if ($answers->isEmpty()) {
            return null;
        }

        $correct = $answers->where('is_correct', true)->count();
        $total = $answers->count();

        return [
            'correct' => $correct,
            'total' => $total,
            'percentage' => round(($correct / $total) * 100, 2)
        ];
    }
}