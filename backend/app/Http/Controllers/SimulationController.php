<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Simulation;
use App\Models\UserAnswer;
use App\Models\Question;
use App\Models\SimulationSet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class SimulationController extends Controller
{
    // Check if user eligible to take simulation
    public function checkEligibility(Request $request)
    {
        $user = Auth::user();
        $simulationSetId = $request->query('simulation_set_id', 1);
        
        // Check if simulation set is active
        $simulationSet = SimulationSet::find($simulationSetId);
        if (!$simulationSet || !$simulationSet->is_active) {
            return response()->json([
                'eligible' => false,
                'message' => 'Simulasi sedang tidak aktif. Silakan hubungi instruktur.'
            ]);
        }
        
        // Check if user already completed simulation
        $existingSimulation = Simulation::where('idPengguna', $user->idPengguna)
            ->where('simulation_set_id', $simulationSetId)
            ->where('status', 'completed')
            ->first();

        if ($existingSimulation) {
            return response()->json([
                'eligible' => false,
                'message' => 'Anda sudah pernah mengerjakan simulasi ini.',
                'completed_at' => $existingSimulation->updated_at
            ]);
        }

        // Check for incomplete simulation
        $incompleteSimulation = Simulation::where('idPengguna', $user->idPengguna)
            ->where('simulation_set_id', $simulationSetId)
            ->whereIn('status', ['not_started', 'in_progress_listening', 'in_progress_structure', 'in_progress_reading'])
            ->first();

        return response()->json([
            'eligible' => true,
            'has_incomplete' => !!$incompleteSimulation,
            'incomplete_simulation' => $incompleteSimulation,
            'simulation_set' => $simulationSet
        ]);
    }

    // Get list simulasi yang sudah completed (TIDAK DI-PROTECT - hasil lama tetap bisa dilihat)
    public function getCompletedSimulations(Request $request)
    {
        $user = Auth::user();
        $simulationSetId = $request->query('simulation_set_id', 1);
        
        $simulations = Simulation::where('idPengguna', $user->idPengguna)
            ->where('simulation_set_id', $simulationSetId)
            ->where('status', 'completed')
            ->orderBy('finished_at', 'desc')
            ->get(['id', 'total_score', 'finished_at', 'score_listening', 'score_structure', 'score_reading']);

        return response()->json([
            'simulations' => $simulations
        ]);
    }

    // Start simulation baru atau lanjutkan yang ada
    public function start(Request $request)
    {
        $data = $request->validate([
            'simulation_set_id' => 'required|exists:simulation_sets,id',
        ]);

        $user = Auth::user();
        $simulationSetId = $data['simulation_set_id'];

        // Check if simulation set is active
        $simulationSet = SimulationSet::find($simulationSetId);
        if (!$simulationSet || !$simulationSet->is_active) {
            return response()->json(['error' => 'Simulasi sedang tidak aktif'], 400);
        }

        // Check if already completed
        if (Simulation::where('idPengguna', $user->idPengguna)->where('simulation_set_id', $simulationSetId)->where('status', 'completed')->exists()) {
            return response()->json(['error' => 'Simulasi sudah pernah dikerjakan'], 400);
        }

        // Check for existing incomplete simulation
        $existingSimulation = Simulation::where('idPengguna', $user->idPengguna)
            ->where('simulation_set_id', $simulationSetId)
            ->whereIn('status', ['not_started', 'in_progress_listening', 'in_progress_structure', 'in_progress_reading'])
            ->first();

        if ($existingSimulation) {
            // Update status if still not_started
            if ($existingSimulation->status === 'not_started') {
                $existingSimulation->update([
                    'status' => 'in_progress_listening',
                    'started_at' => now()
                ]);
            }
            
            return response()->json([
                'simulation_id' => $existingSimulation->id,
                'current_section' => $existingSimulation->getCurrentSection(),
                'resumed' => true
            ]);
        }

        // Create new simulation
        $simulation = Simulation::create([
            'idPengguna' => $user->idPengguna,
            'simulation_set_id' => $simulationSetId,
            'status' => 'in_progress_listening',
            'started_at' => now()
        ]);

        return response()->json([
            'simulation_id' => $simulation->id,
            'current_section' => 'listening',
            'resumed' => false
        ]);
    }

    // 🔥 PROTECTED: Ambil soal untuk section tertentu
    public function getQuestions(Request $request, $simulationId)
    {
        $simulation = Simulation::findOrFail($simulationId);
        
        if ($simulation->idPengguna !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($simulation->status === 'completed') {
            return response()->json(['error' => 'Simulasi sudah selesai'], 400);
        }

        // 🔥 NEW: Check if simulation set is still active
        $simulationSet = SimulationSet::find($simulation->simulation_set_id);
        if (!$simulationSet || !$simulationSet->is_active) {
            return response()->json(['error' => 'Simulasi sudah dinonaktifkan oleh instruktur'], 400);
        }

        $currentSection = $simulation->getCurrentSection();
        
        if (!$currentSection) {
            return response()->json(['error' => 'Invalid simulation status'], 400);
        }

        // Get ALL questions for current section (individuals + group parents + group children)
        $questions = Question::where('simulation_set_id', $simulation->simulation_set_id)
            ->where('modul', $currentSection)
            ->orderBy('order_number')
            ->get();

        Log::info('Retrieved questions for section', [
            'section' => $currentSection,
            'total_count' => $questions->count(),
            'breakdown' => [
                'group_parents' => $questions->where('group_id', '=', DB::raw('id'))->where('correct_option', null)->count(),
                'group_children' => $questions->where('group_id', '!=', DB::raw('id'))->whereNotNull('group_id')->whereNotNull('correct_option')->count(),
                'individuals' => $questions->whereNull('group_id')->whereNotNull('correct_option')->count()
            ]
        ]);

        // Get time limit for current section
        $timeLimits = SimulationSet::getTimeLimits();
        $timeLimit = $timeLimits[$currentSection];

        return response()->json([
            'questions' => $questions,
            'current_section' => $currentSection,
            'time_limit' => $timeLimit,
            'simulation' => $simulation
        ]);
    }

    // 🔥 PROTECTED: Submit jawaban per section
    public function submitSection(Request $request)
    {
        $data = $request->validate([
            'simulation_id' => 'required|exists:simulations,id',
            'section' => 'required|in:listening,structure,reading',
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.selected_option' => 'required|in:a,b,c,d',
            'time_spent' => 'required|integer|min:0'
        ]);

        $user = Auth::user();
        $simulation = Simulation::findOrFail($data['simulation_id']);

        if ($simulation->idPengguna !== $user->idPengguna) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // 🔥 NEW: Check if simulation set is still active
        $simulationSet = SimulationSet::find($simulation->simulation_set_id);
        if (!$simulationSet || !$simulationSet->is_active) {
            return response()->json(['error' => 'Simulasi sudah dinonaktifkan oleh instruktur'], 400);
        }

        $section = $data['section'];
        $currentSection = $simulation->getCurrentSection();

        if ($section !== $currentSection) {
            return response()->json(['error' => 'Invalid section'], 400);
        }

        return DB::transaction(function () use ($simulation, $data, $section, $user) {
            // Save answers for this section
            foreach ($data['answers'] as $ans) {
                $question = Question::find($ans['question_id']);
                $isCorrect = $ans['selected_option'] === $question->correct_option;

                UserAnswer::create([
                    'idPengguna' => $user->idPengguna,
                    'question_id' => $question->id,
                    'selected_option' => $ans['selected_option'],
                    'is_correct' => $isCorrect,
                    'simulation_id' => $simulation->id
                ]);
            }

            // Update simulation with time spent and next status
            $updateData = [
                "time_spent_{$section}" => $data['time_spent']
            ];

            // Determine next status
            $nextStatus = $this->getNextStatus($section);
            if ($nextStatus) {
                $updateData['status'] = $nextStatus;
            } else {
                // Last section completed - calculate final scores
                $updateData['status'] = 'completed';
                $updateData['finished_at'] = now();
                
                $scores = $this->calculateScores($simulation->id);
                $updateData = array_merge($updateData, $scores);
            }

            $simulation->update($updateData);

            return response()->json([
                'message' => "Section {$section} completed",
                'next_section' => $nextStatus ? $this->getSectionFromStatus($nextStatus) : null,
                'completed' => !$nextStatus,
                'simulation_id' => $simulation->id,
                'scores' => $nextStatus ? null : [
                    'listening' => $simulation->fresh()->score_listening,
                    'structure' => $simulation->fresh()->score_structure,
                    'reading' => $simulation->fresh()->score_reading,
                    'total' => $simulation->fresh()->total_score
                ]
            ]);
        });
    }

    // 🔥 UPDATED: Ambil hasil simulasi dengan group parents included
    public function getResults($simulationId)
    {
        $simulation = Simulation::findOrFail($simulationId);
        
        if ($simulation->idPengguna !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($simulation->status !== 'completed') {
            return response()->json(['error' => 'Simulasi belum selesai'], 400);
        }

        // Get user answers with question data
        $answers = UserAnswer::where('simulation_id', $simulationId)
            ->with(['question' => function ($query) {
                $query->orderBy('order_number');
            }])
            ->get()
            ->sortBy('question.order_number');

        // 🔥 NEW: Get group parent questions for all groups in this simulation
        $groupIds = $answers->filter(function($answer) {
            return $answer->question->group_id !== null;
        })->pluck('question.group_id')->unique();

        $groupParents = [];
        if ($groupIds->isNotEmpty()) {
            $groupParents = Question::whereIn('id', $groupIds)
                ->get()
                ->keyBy('id');
        }

        Log::info('Retrieved simulation results with group data', [
            'simulation_id' => $simulationId,
            'total_answers' => $answers->count(),
            'group_ids_found' => $groupIds->toArray(),
            'group_parents_fetched' => $groupParents->count()
        ]);

        // Get raw scores for detailed breakdown
        $rawScores = [];
        $modules = ['listening', 'structure', 'reading'];
        
        foreach ($modules as $module) {
            $correctCount = $answers->filter(function($answer) use ($module) {
                return $answer->question->modul === $module && $answer->is_correct;
            })->count();
            
            $totalCount = $answers->filter(function($answer) use ($module) {
                return $answer->question->modul === $module;
            })->count();
            
            $rawScores[$module] = [
                'correct' => $correctCount,
                'total' => $totalCount,
                'percentage' => $totalCount > 0 ? round(($correctCount / $totalCount) * 100, 1) : 0
            ];
        }

        return response()->json([
            'simulation' => $simulation,
            'answers' => $answers,
            'group_parents' => $groupParents, // 🔥 NEW: Include group parent questions
            'scores' => [
                'listening' => $simulation->score_listening,
                'structure' => $simulation->score_structure, 
                'reading' => $simulation->score_reading,
                'total' => $simulation->total_score,
                'cefr_level' => $this->getCEFRLevel($simulation->total_score)
            ],
            'raw_scores' => $rawScores,
            'time_spent' => [
                'listening' => $simulation->time_spent_listening,
                'structure' => $simulation->time_spent_structure,
                'reading' => $simulation->time_spent_reading,
                'total' => ($simulation->time_spent_listening ?? 0) + 
                          ($simulation->time_spent_structure ?? 0) + 
                          ($simulation->time_spent_reading ?? 0)
            ],
            'score_interpretation' => [
                'total_range' => '310-677',
                'listening_range' => '310-680',
                'structure_range' => '310-680', 
                'reading_range' => '310-670',
                'cefr_mapping' => [
                    'C1' => '627-677',
                    'B2' => '543-626', 
                    'B1' => '460-542',
                    'A2-B1' => '337-459',
                    'A2' => '310-336'
                ]
            ]
        ]);
    }

    // Get next status after completing a section
    private function getNextStatus($currentSection)
    {
        switch ($currentSection) {
            case 'listening':
                return 'in_progress_structure';
            case 'structure':
                return 'in_progress_reading';
            case 'reading':
                return null; // Completed
            default:
                return null;
        }
    }

    // Get section name from status
    private function getSectionFromStatus($status)
    {
        switch ($status) {
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

    // Calculate TOEFL ITP scores using official formula
    private function calculateScores($simulationId)
    {
        $modules = ['listening', 'structure', 'reading'];
        $scores = [];
        $rawScores = [];

        // TOEFL ITP Level 1 Standards
        $maxScores = [
            'listening' => 50,
            'structure' => 40, 
            'reading' => 50
        ];

        foreach ($modules as $module) {
            // Get raw score (correct answers count)
            $correctCount = UserAnswer::where('simulation_id', $simulationId)
                ->where('is_correct', true)
                ->whereHas('question', function ($query) use ($module) {
                    $query->where('modul', $module);
                })
                ->count();

            $rawScores[$module] = $correctCount;
            $maxScore = $maxScores[$module];

            // Calculate scaled score using TOEFL ITP formula
            if ($module === 'reading') {
                // Reading: scaled = 31 + (raw/50) * 36
                $scaledScore = 31 + ($correctCount / $maxScore) * 36;
            } else {
                // Listening & Structure: scaled = 31 + (raw/max) * 37  
                $scaledScore = 31 + ($correctCount / $maxScore) * 37;
            }

            // Convert to display format (scaled * 10) = 310-680 range
            $scores["score_{$module}"] = round($scaledScore * 10, 0);
        }

        // Calculate total TOEFL ITP score
        // Formula: ((scaled_L + scaled_S + scaled_R) / 3) * 10
        $scaledListening = $scores['score_listening'] / 10;
        $scaledStructure = $scores['score_structure'] / 10; 
        $scaledReading = $scores['score_reading'] / 10;
        
        $totalScore = (($scaledListening + $scaledStructure + $scaledReading) / 3) * 10;
        $scores['total_score'] = round($totalScore, 0);

        return $scores;
    }

    // Get CEFR level from total score
    private function getCEFRLevel($totalScore)
    {
        if ($totalScore >= 627) return 'C1';
        if ($totalScore >= 543) return 'B2'; 
        if ($totalScore >= 460) return 'B1';
        if ($totalScore >= 337) return 'A2-B1';
        if ($totalScore >= 310) return 'A2';
        return 'Below A2';
    }
}