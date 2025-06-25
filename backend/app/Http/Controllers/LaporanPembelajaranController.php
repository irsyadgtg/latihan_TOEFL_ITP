<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\UserProgress;
use App\Models\UserAnswer;
use App\Models\Simulation;
use App\Models\Page;
use App\Models\Question;
use App\Models\Pengguna;
use App\Models\Skill;
use App\Models\DetailFeedbackRencanaBelajar;
use App\Models\PengajuanRencanaBelajar;
use App\Models\FeedbackRencanaBelajar;
use Carbon\Carbon;

class LaporanPembelajaranController extends Controller
{
    /**
     * Get learning progress overview for eligibility check
     * Route: GET /laporan/progress
     */
    public function getProgressOverview(Request $request)
    {
        $user = Auth::user();
        
        // Only peserta can access learning report
        if ($user->role !== 'peserta') {
            return response()->json([
                'error' => 'Only students can access learning reports'
            ], 403);
        }

        try {
            // Get active learning plan
            $activeFeedback = $this->getActiveFeedback($user->idPeserta);
            
            if (!$activeFeedback) {
                return response()->json([
                    'eligible' => false,
                    'has_active_plan' => false,
                    'message' => 'Tidak ada rencana belajar aktif. Ajukan rencana belajar terlebih dahulu.',
                    'progress' => null
                ]);
            }

            // Get unlocked units
            $unlockedUnits = $this->getUnlockedUnits($user->idPeserta);
            
            // Calculate progress for each component
            $materiProgress = $this->calculateMateriProgress($user->idPengguna, $unlockedUnits);
            $quizProgress = $this->calculateQuizProgress($user->idPengguna, $unlockedUnits);
            $simulasiProgress = $this->calculateSimulasiProgress($user->idPengguna);
            
            // Calculate overall completion
            $overallProgress = ($materiProgress['percentage'] + $quizProgress['percentage'] + $simulasiProgress['percentage']) / 3;
            
            // Check if eligible for full report (all 100%)
            $eligible = $materiProgress['percentage'] == 100 && 
                       $quizProgress['percentage'] == 100 && 
                       $simulasiProgress['completed'];

            return response()->json([
                'eligible' => $eligible,
                'has_active_plan' => true,
                'overall_progress' => round($overallProgress, 1),
                'feedback_info' => [
                    'plan_name' => $activeFeedback->namaRencana,
                    'target_score' => $activeFeedback->targetSkor,
                    'expires_at' => $activeFeedback->selesaiPada
                ],
                'progress' => [
                    'materi' => $materiProgress,
                    'quiz' => $quizProgress,
                    'simulasi' => $simulasiProgress
                ],
                'next_steps' => $this->getNextSteps($materiProgress, $quizProgress, $simulasiProgress),
                'message' => $eligible ? 
                    'Selamat! Anda dapat melihat laporan pembelajaran lengkap.' :
                    'Selesaikan semua materi, latihan, dan simulasi untuk mengakses laporan lengkap.'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get progress overview: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to calculate learning progress'
            ], 500);
        }
    }

    /**
     * Get detailed learning report (when eligible)
     * Route: GET /laporan/detail
     */
    public function getDetailedReport(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'peserta') {
            return response()->json([
                'error' => 'Only students can access learning reports'
            ], 403);
        }

        try {
            // First check eligibility
            $progressResponse = $this->getProgressOverview($request);
            $progressData = $progressResponse->getData(true);
            
            if (!$progressData['eligible']) {
                return response()->json([
                    'error' => 'You must complete all learning requirements first',
                    'progress' => $progressData['progress']
                ], 403);
            }

            // Get active learning plan and feedback
            $activeFeedback = $this->getActiveFeedback($user->idPeserta);
            $rencanaBelajar = PengajuanRencanaBelajar::find($activeFeedback->idPengajuanRencanaBelajar);
            
            // Get focused skills
            $focusedSkills = $this->getFocusedSkills($activeFeedback->idFeedbackRencanaBelajar);
            
            // Get simulation results
            $simulationResult = $this->getSimulationResults($user->idPengguna);
            
            // Calculate study period and duration
            $studyPeriod = $this->calculateStudyPeriod($rencanaBelajar);
            
            // Calculate quiz performance
            $quizPerformance = $this->calculateQuizPerformance($user->idPengguna, $focusedSkills);
            
            // Analyze wrong answers
            $wrongAnswerAnalysis = $this->analyzeWrongAnswers($user->idPengguna);
            
            // Skill mastery analysis
            $skillMastery = $this->analyzeSkillMastery($focusedSkills, $quizPerformance, $simulationResult);
            
            return response()->json([
                'learning_plan_summary' => [
                    'plan_name' => $rencanaBelajar->namaRencana,
                    'focused_skills' => $focusedSkills,
                    'target_score' => $rencanaBelajar->targetSkor,
                    'simulation_score' => $simulationResult['total_score'],
                    'score_difference' => $simulationResult['total_score'] - $rencanaBelajar->targetSkor,
                    'achievement_status' => $simulationResult['total_score'] >= $rencanaBelajar->targetSkor ? 'Target Tercapai' : 'Target Belum Tercapai'
                ],
                'study_period_analysis' => $studyPeriod,
                'quiz_performance' => $quizPerformance,
                'simulation_results' => $simulationResult,
                'wrong_answer_analysis' => $wrongAnswerAnalysis,
                'skill_mastery' => $skillMastery,
                'graduation_status' => [
                    'passed' => $simulationResult['total_score'] >= $rencanaBelajar->targetSkor,
                    'target_score' => $rencanaBelajar->targetSkor,
                    'achieved_score' => $simulationResult['total_score'],
                    'status_message' => $simulationResult['total_score'] >= $rencanaBelajar->targetSkor 
                        ? 'Selamat! Anda telah mencapai target skor yang ditetapkan.' 
                        : 'Target skor belum tercapai. Perlu peningkatan pada area tertentu.'
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get detailed report: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to generate detailed report'
            ], 500);
        }
    }

    /**
     * Get active learning plan feedback
     */
    private function getActiveFeedback($idPeserta)
    {
        return DB::table('feedback_rencana_belajar as fb')
            ->join('pengajuan_rencana_belajar as prb', 'fb.idPengajuanRencanaBelajar', '=', 'prb.idPengajuanRencanaBelajar')
            ->where('prb.idPeserta', $idPeserta)
            ->where('prb.status', 'sudah ada feedback')
            ->where('prb.isAktif', true)
            ->whereDate('prb.selesaiPada', '>=', Carbon::now())
            ->orderBy('fb.tglPemberianFeedback', 'desc')
            ->select('fb.idFeedbackRencanaBelajar', 'prb.idPengajuanRencanaBelajar', 'prb.namaRencana', 'prb.targetSkor', 'prb.selesaiPada', 'prb.tanggalMulai')
            ->first();
    }

    /**
     * Get focused skills from feedback
     */
    private function getFocusedSkills($idFeedbackRencanaBelajar)
    {
        $skillDetails = DB::table('detail_feedback_rencana_belajar as dfb')
            ->join('skill as s', 'dfb.idSkill', '=', 's.idSkill')
            ->where('dfb.idFeedbackRencanaBelajar', $idFeedbackRencanaBelajar)
            ->select('s.idSkill', 's.kategori', 's.skill', 's.deskripsi')
            ->get();

        $grouped = $skillDetails->groupBy('kategori');
        
        return [
            'by_category' => $grouped->map(function($skills, $category) {
                return [
                    'category' => $category,
                    'skills' => $skills->map(function($skill) {
                        return [
                            'id' => $skill->idSkill,
                            'name' => $skill->skill,
                            'description' => $skill->deskripsi
                        ];
                    })->values()
                ];
            })->values(),
            'total_skills' => $skillDetails->count(),
            'categories_covered' => $grouped->keys()
        ];
    }

    /**
     * Calculate study period and duration
     */
    private function calculateStudyPeriod($rencanaBelajar)
    {
        $startDate = Carbon::parse($rencanaBelajar->tanggalMulai);
        $endDate = Carbon::parse($rencanaBelajar->selesaiPada);
        $actualEndDate = Carbon::now();
        
        $plannedDuration = $startDate->diffInDays($endDate);
        $actualDuration = $startDate->diffInDays($actualEndDate);
        
        return [
            'planned_start' => $startDate->format('Y-m-d'),
            'planned_end' => $endDate->format('Y-m-d'),
            'actual_end' => $actualEndDate->format('Y-m-d'),
            'planned_duration_days' => $plannedDuration,
            'actual_duration_days' => $actualDuration,
            'duration_difference' => $actualDuration - $plannedDuration,
            'target_schedule' => [
                'days_per_week' => $rencanaBelajar->hariPerMinggu,
                'hours_per_day' => $rencanaBelajar->jamPerHari,
                'target_time' => $rencanaBelajar->targetWaktu
            ],
            'completion_status' => $actualDuration <= $plannedDuration ? 'Tepat Waktu' : 'Terlambat ' . ($actualDuration - $plannedDuration) . ' hari'
        ];
    }

    /**
     * Calculate quiz performance per module
     */
    private function calculateQuizPerformance($idPengguna, $focusedSkills)
    {
        $modules = ['listening', 'structure', 'reading'];
        $modulePerformance = [];
        $allScores = [];

        foreach ($modules as $modul) {
            $moduleScores = [];
            $unlockedUnits = $this->getUnlockedUnitsForModule($modul, $focusedSkills);
            
            foreach ($unlockedUnits as $unit) {
                if ($unit == 0) continue;
                
                $answers = UserAnswer::where('idPengguna', $idPengguna)
                    ->whereNull('simulation_id')
                    ->whereHas('question', function($q) use ($modul, $unit) {
                        $q->where('modul', $modul)
                          ->where('unit_number', $unit)
                          ->whereNull('simulation_set_id');
                    })
                    ->get();

                if ($answers->isNotEmpty()) {
                    $correct = $answers->where('is_correct', true)->count();
                    $total = $answers->count();
                    $percentage = round(($correct / $total) * 100, 1);
                    $moduleScores[] = $percentage;
                    $allScores[] = $percentage;
                }
            }
            
            $modulePerformance[$modul] = [
                'unit_scores' => $moduleScores,
                'average_score' => !empty($moduleScores) ? round(array_sum($moduleScores) / count($moduleScores), 1) : 0,
                'units_completed' => count($moduleScores),
                'chart_data' => array_map(function($score, $index) {
                    return ['unit' => $index + 1, 'score' => $score];
                }, $moduleScores, array_keys($moduleScores))
            ];
        }

        return [
            'by_module' => $modulePerformance,
            'overall_average' => !empty($allScores) ? round(array_sum($allScores) / count($allScores), 1) : 0,
            'total_quizzes_completed' => array_sum(array_column($modulePerformance, 'units_completed'))
        ];
    }

    /**
     * Get simulation results
     */
    private function getSimulationResults($idPengguna)
    {
        $simulation = Simulation::where('idPengguna', $idPengguna)
            ->where('simulation_set_id', 1)
            ->whereNotNull('finished_at')
            ->latest()
            ->first();

        if (!$simulation) {
            return null;
        }

        return [
            'total_score' => $simulation->total_score,
            'listening_score' => $simulation->score_listening,
            'structure_score' => $simulation->score_structure,
            'reading_score' => $simulation->score_reading,
            'completed_at' => $simulation->finished_at,
            'time_spent' => [
                'listening' => $simulation->time_spent_listening,
                'structure' => $simulation->time_spent_structure,
                'reading' => $simulation->time_spent_reading,
                'total' => ($simulation->time_spent_listening ?? 0) + 
                          ($simulation->time_spent_structure ?? 0) + 
                          ($simulation->time_spent_reading ?? 0)
            ]
        ];
    }

    /**
     * Analyze wrong answers patterns
     */
    private function analyzeWrongAnswers($idPengguna)
    {
        $wrongAnswers = UserAnswer::where('idPengguna', $idPengguna)
            ->where('is_correct', false)
            ->with('question')
            ->get();

        $byModule = $wrongAnswers->groupBy('question.modul');
        $analysis = [];

        foreach (['listening', 'structure', 'reading'] as $modul) {
            $moduleWrong = $byModule->get($modul, collect());
            $total = UserAnswer::where('idPengguna', $idPengguna)
                ->whereHas('question', function($q) use ($modul) {
                    $q->where('modul', $modul);
                })
                ->count();

            $analysis[$modul] = [
                'wrong_count' => $moduleWrong->count(),
                'total_questions' => $total,
                'error_rate' => $total > 0 ? round(($moduleWrong->count() / $total) * 100, 1) : 0,
                'common_mistakes' => $this->getCommonMistakePatterns($moduleWrong, $modul)
            ];
        }

        return $analysis;
    }

    /**
     * Get common mistake patterns
     */
    private function getCommonMistakePatterns($wrongAnswers, $modul)
    {
        // Group by unit to find patterns
        $byUnit = $wrongAnswers->groupBy('question.unit_number');
        $patterns = [];

        foreach ($byUnit as $unit => $answers) {
            if ($unit && $answers->count() >= 2) { // At least 2 wrong answers in same unit
                $patterns[] = [
                    'area' => $this->getUnitDescription($modul, $unit),
                    'wrong_count' => $answers->count(),
                    'suggestion' => $this->getSuggestionForUnit($modul, $unit)
                ];
            }
        }

        return $patterns;
    }

    /**
     * Analyze skill mastery
     */
    private function analyzeSkillMastery($focusedSkills, $quizPerformance, $simulationResult)
    {
        $mastered = [];
        $needsImprovement = [];

        foreach ($focusedSkills['by_category'] as $categoryData) {
            $category = $categoryData['category'];
            $modul = $this->mapCategoryToModule($category);
            
            $moduleScore = $quizPerformance['by_module'][$modul]['average_score'] ?? 0;
            $simulationScore = $this->getSimulationScoreForModule($simulationResult, $modul);
            
            $averagePerformance = ($moduleScore + $simulationScore) / 2;
            
            foreach ($categoryData['skills'] as $skill) {
                if ($averagePerformance >= 75) {
                    $mastered[] = [
                        'skill' => $skill['name'],
                        'category' => $category,
                        'performance' => round($averagePerformance, 1)
                    ];
                } else {
                    $needsImprovement[] = [
                        'skill' => $skill['name'],
                        'category' => $category,
                        'performance' => round($averagePerformance, 1),
                        'recommendation' => $this->getSkillRecommendation($skill['name'], $category)
                    ];
                }
            }
        }

        return [
            'mastered_skills' => $mastered,
            'needs_improvement' => $needsImprovement,
            'mastery_percentage' => count($mastered) > 0 ? round((count($mastered) / (count($mastered) + count($needsImprovement))) * 100, 1) : 0
        ];
    }

    /**
     * Helper methods
     */
    private function getUnlockedUnitsForModule($modul, $focusedSkills)
    {
        $skillIds = collect($focusedSkills['by_category'])
            ->flatMap(function($category) {
                return collect($category['skills'])->pluck('id');
            })
            ->toArray();

        return $this->mapSkillsToUnits($skillIds)[$modul] ?? [0];
    }

    private function mapCategoryToModule($category)
    {
        if (strpos($category, 'Listening') !== false) return 'listening';
        if (strpos($category, 'Structure') !== false) return 'structure';
        if (strpos($category, 'Reading') !== false) return 'reading';
        return 'listening';
    }

    private function getSimulationScoreForModule($simulationResult, $modul)
    {
        if (!$simulationResult) return 0;
        
        $scoreMap = [
            'listening' => $simulationResult['listening_score'],
            'structure' => $simulationResult['structure_score'],
            'reading' => $simulationResult['reading_score']
        ];
        
        // Convert TOEFL score to percentage (rough approximation)
        $score = $scoreMap[$modul] ?? 0;
        return min(100, max(0, ($score - 20) * 1.25)); // Rough conversion
    }

    private function getUnitDescription($modul, $unit)
    {
        $descriptions = [
            'listening' => [
                1 => 'Short Conversations - Gist',
                2 => 'Short Conversations - Advice',
                3 => 'Short Conversations - Predictions',
                // Add more as needed
            ],
            'structure' => [
                1 => 'Noun Questions',
                2 => 'Verb Questions',
                // Add more as needed
            ],
            'reading' => [
                1 => 'Topic and Main Idea',
                2 => 'Explicit Details',
                // Add more as needed
            ]
        ];

        return $descriptions[$modul][$unit] ?? "Unit $unit";
    }

    private function getSuggestionForUnit($modul, $unit)
    {
        return "Perkuat pemahaman pada materi Unit $unit di modul " . ucfirst($modul) . ". Lakukan lebih banyak latihan pada area ini.";
    }

    private function getSkillRecommendation($skill, $category)
    {
        return "Tingkatkan kemampuan dalam '$skill'. Fokus pada latihan yang berkaitan dengan $category.";
    }

    // Keep existing methods from original controller
    private function getUnlockedUnits($idPeserta)
    {
        $activeFeedback = $this->getActiveFeedback($idPeserta);
        
        if (!$activeFeedback) {
            return [
                'listening' => [0],
                'structure' => [0], 
                'reading' => [0]
            ];
        }

        $feedbackSkills = DB::table('detail_feedback_rencana_belajar as dfb')
            ->where('dfb.idFeedbackRencanaBelajar', $activeFeedback->idFeedbackRencanaBelajar)
            ->pluck('idSkill')->toArray();

        return $this->mapSkillsToUnits($feedbackSkills);
    }

    private function mapSkillsToUnits($skillIds)
    {
        $unlocked = [
            'listening' => [0],
            'structure' => [0],
            'reading' => [0]
        ];

        foreach ($skillIds as $skillId) {
            if ($skillId >= 1 && $skillId <= 10) {
                $unitNumber = $skillId;
                if (!in_array($unitNumber, $unlocked['listening'])) {
                    $unlocked['listening'][] = $unitNumber;
                }
            }
            elseif ($skillId >= 11 && $skillId <= 20) {
                $unitNumber = $skillId - 10;
                if (!in_array($unitNumber, $unlocked['structure'])) {
                    $unlocked['structure'][] = $unitNumber;
                }
            }
            elseif ($skillId >= 21 && $skillId <= 26) {
                $unitNumber = $skillId - 20;
                if (!in_array($unitNumber, $unlocked['reading'])) {
                    $unlocked['reading'][] = $unitNumber;
                }
            }
        }

        sort($unlocked['listening']);
        sort($unlocked['structure']);
        sort($unlocked['reading']);

        return $unlocked;
    }

    private function calculateMateriProgress($idPengguna, $unlockedUnits)
    {
        $totalPages = 0;
        $completedPages = 0;
        $breakdown = [];

        foreach (['listening', 'structure', 'reading'] as $modul) {
            $modulPages = 0;
            $modulCompleted = 0;
            
            foreach ($unlockedUnits[$modul] as $unit) {
                if ($unit == 0) continue; // Skip overview
                
                $unitPages = Page::where('modul', $modul)
                                ->where('unit_number', $unit)
                                ->count();
                
                $unitCompleted = UserProgress::whereHas('page', function($q) use ($modul, $unit) {
                                    $q->where('modul', $modul)->where('unit_number', $unit);
                                })
                                ->where('idPengguna', $idPengguna)
                                ->count();
                
                $modulPages += $unitPages;
                $modulCompleted += $unitCompleted;
            }
            
            $totalPages += $modulPages;
            $completedPages += $modulCompleted;
            
            $breakdown[$modul] = [
                'completed' => $modulCompleted,
                'total' => $modulPages,
                'units_unlocked' => count($unlockedUnits[$modul]) - 1, // Exclude overview
                'percentage' => $modulPages > 0 ? round(($modulCompleted / $modulPages) * 100, 1) : 100
            ];
        }

        return [
            'completed' => $completedPages,
            'total' => $totalPages,
            'percentage' => $totalPages > 0 ? round(($completedPages / $totalPages) * 100, 1) : 100,
            'breakdown' => $breakdown,
            'status' => $totalPages > 0 && $completedPages >= $totalPages ? 'Completed' : 'In Progress'
        ];
    }

    private function calculateQuizProgress($idPengguna, $unlockedUnits)
    {
        $totalQuizzes = 0;
        $completedQuizzes = 0;
        $breakdown = [];

        foreach (['listening', 'structure', 'reading'] as $modul) {
            $modulQuizzes = 0;
            $modulCompleted = 0;
            $scores = [];
            
            foreach ($unlockedUnits[$modul] as $unit) {
                if ($unit == 0) continue; // Skip overview
                
                $hasQuestions = Question::where('modul', $modul)
                                      ->where('unit_number', $unit)
                                      ->whereNull('simulation_set_id')
                                      ->exists();
                
                if ($hasQuestions) {
                    $modulQuizzes++;
                    
                    $totalQuestions = Question::where('modul', $modul)
                                             ->where('unit_number', $unit)
                                             ->whereNull('simulation_set_id')
                                             ->count();

                    $answeredQuestions = UserAnswer::where('idPengguna', $idPengguna)
                                                    ->whereNull('simulation_id')
                                                    ->whereHas('question', function($q) use ($modul, $unit) {
                                                        $q->where('modul', $modul)
                                                          ->where('unit_number', $unit)
                                                          ->whereNull('simulation_set_id');
                                                    })
                                                    ->count();

                    if ($answeredQuestions >= $totalQuestions) {
                        $modulCompleted++;
                        
                        $answers = UserAnswer::where('idPengguna', $idPengguna)
                                            ->whereNull('simulation_id')
                                            ->whereHas('question', function($q) use ($modul, $unit) {
                                                $q->where('modul', $modul)
                                                  ->where('unit_number', $unit)
                                                  ->whereNull('simulation_set_id');
                                            })
                                            ->get();

                        if ($answers->isNotEmpty()) {
                            $correct = $answers->where('is_correct', true)->count();
                            $total = $answers->count();
                            $percentage = round(($correct / $total) * 100, 1);
                            $scores[] = $percentage;
                        }
                    }
                }
            }
            
            $totalQuizzes += $modulQuizzes;
            $completedQuizzes += $modulCompleted;
            
            $breakdown[$modul] = [
                'completed' => $modulCompleted,
                'total' => $modulQuizzes,
                'percentage' => $modulQuizzes > 0 ? round(($modulCompleted / $modulQuizzes) * 100, 1) : 100,
                'average_score' => !empty($scores) ? round(array_sum($scores) / count($scores), 1) : null
            ];
        }

        return [
            'completed' => $completedQuizzes,
            'total' => $totalQuizzes,
            'percentage' => $totalQuizzes > 0 ? round(($completedQuizzes / $totalQuizzes) * 100, 1) : 100,
            'breakdown' => $breakdown,
            'status' => $totalQuizzes > 0 && $completedQuizzes >= $totalQuizzes ? 'Completed' : 'In Progress'
        ];
    }

    private function calculateSimulasiProgress($idPengguna)
    {
        $simulation = Simulation::where('idPengguna', $idPengguna)
                               ->where('simulation_set_id', 1)
                               ->whereNotNull('finished_at')
                               ->latest()
                               ->first();

        return [
            'completed' => $simulation ? true : false,
            'percentage' => $simulation ? 100 : 0,
            'status' => $simulation ? 'Completed' : 'Not Completed',
            'score' => $simulation ? [
                'total' => $simulation->total_score,
                'listening' => $simulation->score_listening,
                'structure' => $simulation->score_structure,
                'reading' => $simulation->score_reading,
                'completed_at' => $simulation->finished_at
            ] : null
        ];
    }

    private function getNextSteps($materiProgress, $quizProgress, $simulasiProgress)
    {
        $steps = [];

        if ($materiProgress['percentage'] < 100) {
            $steps[] = [
                'type' => 'materi',
                'message' => 'Selesaikan membaca semua materi yang tersedia',
                'progress' => $materiProgress['percentage']
            ];
        }

        if ($quizProgress['percentage'] < 100) {
            $steps[] = [
                'type' => 'quiz', 
                'message' => 'Kerjakan semua latihan soal di unit yang sudah dibuka',
                'progress' => $quizProgress['percentage']
            ];
        }

        if (!$simulasiProgress['completed']) {
            $steps[] = [
                'type' => 'simulasi',
                'message' => 'Selesaikan simulasi TOEFL ITP',
                'progress' => 0
            ];
        }

        return $steps;
    }
}