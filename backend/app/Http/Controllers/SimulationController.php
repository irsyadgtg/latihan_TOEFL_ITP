<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\Simulation;
use App\Models\SimulationSet;
use App\Models\UserAnswer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SimulationController extends Controller
{
    /**
     * Check eligibility untuk mulai simulasi
     */
    private function checkSimulasiAccess()
    {
        $user = Auth::user();

        if ($user->role !== 'peserta') {
            return ['allowed' => true, 'reason' => null]; // Admin/instruktur bebas akses
        }

        // 1. Cek paket aktif
        $pesertaPaket = $user->peserta->pesertaPaket()->where('paketSaatIni', true)->first();
        if (!$pesertaPaket || !$pesertaPaket->paket) {
            return ['allowed' => false, 'reason' => 'Tidak ada paket aktif'];
        }

        // 2. Cek fasilitas simulasi di paket
        if (strpos($pesertaPaket->paket->fasilitas, 'simulasi') === false) {
            return ['allowed' => false, 'reason' => 'Paket Anda tidak memiliki akses simulasi'];
        }

        // 3. Cek rencana belajar aktif
        $unitAccessController = new \App\Http\Controllers\UnitAccessController();
        $unlockedResponse = $unitAccessController->getUnlockedUnits(request());
        $unlockedData = $unlockedResponse->getData(true);

        if (!$unlockedData['has_active_feedback']) {
            return ['allowed' => false, 'reason' => 'Belum ada rencana belajar aktif'];
        }

        return ['allowed' => true, 'reason' => null];
    }

    public function checkEligibility(Request $request)
    {
        $user = Auth::user();
        $simulationSetId = $request->query('simulation_set_id', 1);

        // CEK AKSES SIMULASI
        $accessCheck = $this->checkSimulasiAccess();
        if (!$accessCheck['allowed']) {
            return response()->json([
                'eligible' => false,
                'reason' => $accessCheck['reason']
            ]);
        }

        $simulationSet = SimulationSet::find($simulationSetId);
        if (!$simulationSet) {
            return response()->json(['error' => 'Simulation set not found'], 404);
        }

        if (!$simulationSet->is_active) {
            return response()->json([
                'eligible' => false,
                'reason' => 'Simulasi sedang tidak aktif'
            ]);
        }

        // Check if already completed
        $existingSimulation = Simulation::where('idPengguna', $user->idPengguna)
            ->where('simulation_set_id', $simulationSetId)
            ->where('status', 'completed')
            ->first();

        if ($existingSimulation) {
            return response()->json([
                'eligible' => false,
                'reason' => 'Simulasi sudah pernah dikerjakan',
                'existing_result' => [
                    'total_score' => $existingSimulation->total_score,
                    'completed_at' => $existingSimulation->finished_at
                ]
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

    /**
     * Get list simulasi yang sudah completed
     */
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

    /**
     * Start simulation baru atau lanjutkan yang ada
     */
    public function start(Request $request)
    {
        $data = $request->validate([
            'simulation_set_id' => 'required|exists:simulation_sets,id',
        ]);

        $user = Auth::user();
        $simulationSetId = $data['simulation_set_id'];

        Log::info('Starting simulation', [
            'user_id' => $user->idPengguna,
            'simulation_set_id' => $simulationSetId
        ]);

        // CEK PAKET DAN RENCANA BELAJAR
        $accessCheck = $this->checkSimulasiAccess();
        if (!$accessCheck['allowed']) {
            return response()->json(['error' => $accessCheck['reason']], 403);
        }

        // Check if simulation set is active
        $simulationSet = SimulationSet::find($simulationSetId);
        if (!$simulationSet || !$simulationSet->is_active) {
            return response()->json(['error' => 'Simulasi sedang tidak aktif'], 400);
        }

        // Check if already completed
        if (Simulation::where('idPengguna', $user->idPengguna)
            ->where('simulation_set_id', $simulationSetId)
            ->where('status', 'completed')->exists()
        ) {
            return response()->json(['error' => 'Simulasi sudah pernah dikerjakan'], 400);
        }

        // Check for existing incomplete simulation
        $existingSimulation = Simulation::where('idPengguna', $user->idPengguna)
            ->where('simulation_set_id', $simulationSetId)
            ->whereIn('status', ['not_started', 'in_progress_listening', 'in_progress_structure', 'in_progress_reading'])
            ->first();

        if ($existingSimulation) {
            // 🔥 UPDATED: Proper resume logic with section timestamps
            if ($existingSimulation->status === 'not_started') {
                $existingSimulation->update([
                    'status' => 'in_progress_listening',
                    'started_at' => now(),
                    'listening_started_at' => now() // Set listening start time
                ]);
            } else {
                // Simulation already in progress - ensure section start time is set
                $currentSection = $existingSimulation->getCurrentSection();
                if ($currentSection && !$existingSimulation->getSectionStartedAt($currentSection)) {
                    $existingSimulation->startSection($currentSection);
                }
            }

            Log::info('Resuming existing simulation', [
                'simulation_id' => $existingSimulation->id,
                'current_section' => $existingSimulation->getCurrentSection(),
                'section_started_at' => $existingSimulation->getSectionStartedAt()
            ]);

            return response()->json([
                'simulation_id' => $existingSimulation->id,
                'current_section' => $existingSimulation->getCurrentSection(),
                'resumed' => true
            ]);
        }

        // 🔥 UPDATED: Create new simulation with proper timestamps
        $simulation = Simulation::create([
            'idPengguna' => $user->idPengguna,
            'simulation_set_id' => $simulationSetId,
            'status' => 'in_progress_listening',
            'started_at' => now(),
            'listening_started_at' => now() // Set listening start time immediately
        ]);

        Log::info('Created new simulation', [
            'simulation_id' => $simulation->id,
            'user_id' => $user->idPengguna,
            'listening_started_at' => $simulation->listening_started_at
        ]);

        return response()->json([
            'simulation_id' => $simulation->id,
            'current_section' => 'listening',
            'resumed' => false
        ]);
    }

    /**
     * Ambil soal untuk section tertentu
     */
    public function getQuestions(Request $request, $simulationId)
    {
        $user = Auth::user();
        $simulation = Simulation::findOrFail($simulationId);

        // Ownership and validation checks...
        if ($simulation->idPengguna !== $user->idPengguna) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($simulation->status === 'completed') {
            return response()->json(['error' => 'Simulasi sudah selesai'], 400);
        }

        $simulationSet = SimulationSet::find($simulation->simulation_set_id);
        if (!$simulationSet || !$simulationSet->is_active) {
            return response()->json(['error' => 'Simulasi sudah dinonaktifkan oleh instruktur'], 400);
        }

        $currentSection = $simulation->getCurrentSection();

        if (!$currentSection) {
            return response()->json(['error' => 'Invalid simulation status'], 400);
        }

        // 🔥 NEW: Ensure section start time is set
        if (!$simulation->getSectionStartedAt($currentSection)) {
            $simulation->startSection($currentSection);
        }

        // Get ALL questions for current section
        $questions = Question::where('simulation_set_id', $simulation->simulation_set_id)
            ->where('modul', $currentSection)
            ->orderBy('order_number')
            ->get();

        // 🔥 UPDATED: Return proper timer information
        $timeLimits = [
            'listening' => 35,
            'structure' => 25,
            'reading' => 55
        ];
        $timeLimit = $timeLimits[$currentSection] ?? 60;

        return response()->json([
            'questions' => $questions,
            'current_section' => $currentSection,
            'time_limit' => $timeLimit,
            'section_started_at' => $simulation->getSectionStartedAt($currentSection),
            'simulation' => $simulation
        ]);
    }
    public function getTimerState($simulationId)
    {
        $user = Auth::user();
        $simulation = Simulation::findOrFail($simulationId);

        // Ownership check
        if ($simulation->idPengguna !== $user->idPengguna) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $currentSection = $simulation->getCurrentSection();

        if (!$currentSection) {
            return response()->json(['error' => 'Invalid simulation status'], 400);
        }

        // Get time limits (in minutes)
        $timeLimits = [
            'listening' => 35,
            'structure' => 25,
            'reading' => 55
        ];

        $timeLimit = $timeLimits[$currentSection];
        $timeLimitSeconds = $timeLimit * 60;

        // 🔥 CRITICAL FIX: Get section start time from database
        $sectionStartedAt = $simulation->getSectionStartedAt($currentSection);

        if (!$sectionStartedAt) {
            // Section not started yet - start it now
            $simulation->startSection($currentSection);
            $sectionStartedAt = $simulation->getSectionStartedAt($currentSection);

            Log::info('Section started automatically', [
                'simulation_id' => $simulation->id,
                'section' => $currentSection,
                'started_at' => $sectionStartedAt
            ]);
        }

        // Calculate elapsed time berdasarkan section start time
        $elapsedSeconds = now()->diffInSeconds($sectionStartedAt);
        $timeRemaining = max(0, $timeLimitSeconds - $elapsedSeconds);
        $isExpired = $timeRemaining <= 0;

        Log::info('Timer state calculated', [
            'simulation_id' => $simulation->id,
            'section' => $currentSection,
            'section_started_at' => $sectionStartedAt->toISOString(),
            'elapsed_seconds' => $elapsedSeconds,
            'time_remaining' => $timeRemaining,
            'is_expired' => $isExpired,
            'debug_now' => now()->toISOString()
        ]);

        return response()->json([
            'simulation_id' => $simulation->id,
            'current_section' => $currentSection,
            'time_limit' => $timeLimit, // in minutes
            'elapsed_time' => $elapsedSeconds, // in seconds
            'time_remaining' => $timeRemaining, // in seconds
            'is_expired' => $isExpired,
            'status' => $simulation->status,
            'section_started_at' => $sectionStartedAt->toISOString(), // 🔥 CRITICAL: Return ISO string for frontend
            'started_at' => $simulation->started_at->toISOString()
        ]);
    }

    /**
     * 🔥 Sync timer with backend for persistence
     */
    public function syncTimer(Request $request)
    {
        $data = $request->validate([
            'simulation_id' => 'required|exists:simulations,id',
            'time_spent' => 'required|integer|min:0'
        ]);

        $user = Auth::user();
        $simulation = Simulation::findOrFail($data['simulation_id']);

        // Ownership check
        if ($simulation->idPengguna !== $user->idPengguna) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Only update if simulation is in progress
        if (!$simulation->isInProgress()) {
            return response()->json(['error' => 'Simulation not in progress'], 400);
        }

        $currentSection = $simulation->getCurrentSection();

        // Update time spent for current section
        $simulation->update([
            "time_spent_{$currentSection}" => $data['time_spent'],
            'last_timer_sync' => now()
        ]);

        Log::info('Timer synced', [
            'simulation_id' => $simulation->id,
            'section' => $currentSection,
            'time_spent' => $data['time_spent']
        ]);

        return response()->json([
            'message' => 'Timer synced successfully',
            'current_section' => $currentSection,
            'time_spent' => $data['time_spent']
        ]);
    }

    /**
     * 🔥 Auto-submit section when time expires
     */

    public function autoSubmitSection(Request $request)
    {
        $data = $request->validate([
            'simulation_id' => 'required|exists:simulations,id',
            'section' => 'required|in:listening,structure,reading',
            'answers' => 'array', // Keep untuk backward compatibility, tapi prefer empty
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.selected_option' => 'required|in:a,b,c,d'
        ]);

        $user = Auth::user();
        $simulation = Simulation::findOrFail($data['simulation_id']);

        if ($simulation->idPengguna !== $user->idPengguna) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $section = $data['section'];
        $currentSection = $simulation->getCurrentSection();

        if ($section !== $currentSection) {
            return response()->json(['error' => 'Invalid section'], 400);
        }

        $timeLimits = [
            'listening' => 35 * 60,
            'structure' => 25 * 60,
            'reading' => 55 * 60
        ];

        $timeLimit = $timeLimits[$section];

        return DB::transaction(function () use ($simulation, $data, $section, $user, $timeLimit) {

            // CONDITIONAL: Hanya save answers kalau memang ada (untuk backward compatibility)
            // Dalam new flow, answers sudah disimpan via submitQuestion()
            if (!empty($data['answers'])) {
                Log::info('Auto-submit saving remaining answers', [
                    'simulation_id' => $simulation->id,
                    'answers_count' => count($data['answers']),
                    'note' => 'This should be rare in new flow'
                ]);

                foreach ($data['answers'] as $ans) {
                    $question = Question::find($ans['question_id']);
                    if (!$question) continue;

                    $isCorrect = $ans['selected_option'] === $question->correct_option;

                    UserAnswer::updateOrCreate(
                        [
                            'idPengguna' => $user->idPengguna,
                            'question_id' => $question->id,
                            'simulation_id' => $simulation->id
                        ],
                        [
                            'selected_option' => $ans['selected_option'],
                            'is_correct' => $isCorrect
                        ]
                    );
                }
            }

            // Update simulation dengan full time limit (expired)
            $updateData = [
                "time_spent_{$section}" => $timeLimit
            ];

            // Determine next status
            $nextStatus = $this->getNextStatus($section);
            if ($nextStatus) {
                $updateData['status'] = $nextStatus;

                // Set start time untuk section selanjutnya
                $nextSection = $this->getSectionFromStatus($nextStatus);
                if ($nextSection) {
                    $updateData["{$nextSection}_started_at"] = now();
                }
            } else {
                // Last section completed - calculate final scores
                $updateData['status'] = 'completed';
                $updateData['finished_at'] = now();

                $scores = $this->calculateScores($simulation->id);
                $updateData = array_merge($updateData, $scores);
            }

            $simulation->update($updateData);

            Log::info('Section auto-submitted due to time expiry', [
                'simulation_id' => $simulation->id,
                'section' => $section,
                'remaining_answers_submitted' => count($data['answers'] ?? []),
                'next_status' => $nextStatus
            ]);

            return response()->json([
                'message' => "Section {$section} auto-submitted (time expired)",
                'next_section' => $nextStatus ? $this->getSectionFromStatus($nextStatus) : null,
                'completed' => !$nextStatus,
                'simulation_id' => $simulation->id,
                'auto_submitted' => true
            ]);
        });
    }

    /**
     * Submit jawaban per section
     */

    public function submitSection(Request $request)
    {
        // 🔥 FIX: answers sekarang optional, bukan required
        $data = $request->validate([
            'simulation_id' => 'required|exists:simulations,id',
            'section' => 'required|in:listening,structure,reading',
            'time_spent' => 'required|integer|min:0'
            // REMOVED: answers validation yang required
        ]);

        $user = Auth::user();
        $simulation = Simulation::findOrFail($data['simulation_id']);

        if ($simulation->idPengguna !== $user->idPengguna) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

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

            // REMOVED: Answer saving logic - sudah di-handle oleh submitQuestion()
            // Hanya focus pada section finalization

            // Update simulation dengan time spent dan status transition
            $updateData = [
                "time_spent_{$section}" => $data['time_spent']
            ];

            // Determine next status
            $nextStatus = $this->getNextStatus($section);
            if ($nextStatus) {
                $updateData['status'] = $nextStatus;

                // Set start time untuk section selanjutnya
                $nextSection = $this->getSectionFromStatus($nextStatus);
                if ($nextSection) {
                    $updateData["{$nextSection}_started_at"] = now();
                }
            } else {
                // Last section completed - calculate final scores
                $updateData['status'] = 'completed';
                $updateData['finished_at'] = now();

                // Calculate scores berdasarkan answers yang sudah ada di database
                $scores = $this->calculateScores($simulation->id);
                $updateData = array_merge($updateData, $scores);
            }

            $simulation->update($updateData);

            Log::info('Section finalized successfully', [
                'simulation_id' => $simulation->id,
                'section' => $section,
                'next_status' => $nextStatus,
                'method' => 'submitSection - finalization only'
            ]);

            return response()->json([
                'message' => "Section {$section} completed successfully",
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


    public function submitQuestion(Request $request)
    {
        $data = $request->validate([
            'simulation_id' => 'required|exists:simulations,id',
            'answers' => 'required|array|min:1',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.selected_option' => 'required|in:a,b,c,d'
        ]);

        $user = Auth::user();
        $simulation = Simulation::findOrFail($data['simulation_id']);

        if ($simulation->idPengguna !== $user->idPengguna) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($simulation->status === 'completed') {
            return response()->json(['error' => 'Simulasi sudah selesai'], 400);
        }

        $simulationSet = SimulationSet::find($simulation->simulation_set_id);
        if (!$simulationSet || !$simulationSet->is_active) {
            return response()->json(['error' => 'Simulasi sudah dinonaktifkan oleh instruktur'], 400);
        }

        $currentSection = $simulation->getCurrentSection();
        if (!$currentSection) {
            return response()->json(['error' => 'Invalid simulation status'], 400);
        }

        // Validate all questions belong to current section
        $questionIds = collect($data['answers'])->pluck('question_id');
        $validQuestions = Question::whereIn('id', $questionIds)
            ->where('modul', $currentSection)
            ->where('simulation_set_id', $simulation->simulation_set_id)
            ->whereNotNull('correct_option')
            ->pluck('id');

        if ($validQuestions->count() !== $questionIds->count()) {
            return response()->json([
                'error' => 'Beberapa soal tidak valid untuk section ini'
            ], 400);
        }

        return DB::transaction(function () use ($simulation, $data, $user, $currentSection, $questionIds) {
            $savedCount = 0;

            foreach ($data['answers'] as $ans) {
                $question = Question::find($ans['question_id']);
                if (!$question || $question->modul !== $currentSection) {
                    continue;
                }

                $isCorrect = $ans['selected_option'] === $question->correct_option;

                $userAnswer = UserAnswer::updateOrCreate(
                    [
                        'idPengguna' => $user->idPengguna,
                        'question_id' => $question->id,
                        'simulation_id' => $simulation->id
                    ],
                    [
                        'selected_option' => $ans['selected_option'],
                        'is_correct' => $isCorrect
                    ]
                );

                if ($userAnswer) {
                    $savedCount++;
                }
            }

            // Ensure all answers were saved
            if ($savedCount !== count($data['answers'])) {
                throw new \Exception('Tidak semua jawaban berhasil disimpan');
            }

            $isLastInSection = $this->isLastQuestionInSection($questionIds, $currentSection, $simulation->simulation_set_id);

            Log::info('Question answers saved successfully', [
                'simulation_id' => $simulation->id,
                'section' => $currentSection,
                'question_ids' => $questionIds->toArray(),
                'saved_count' => $savedCount,
                'is_last_in_section' => $isLastInSection
            ]);

            return response()->json([
                'message' => 'Answers saved successfully',
                'question_ids' => $questionIds,
                'saved_count' => $savedCount,
                'is_last_in_section' => $isLastInSection,
                'current_section' => $currentSection
            ]);
        });
    }

    /**
     * Get existing answers for current simulation section
     */
    public function getExistingAnswers($simulationId)
    {
        $user = Auth::user();
        $simulation = Simulation::findOrFail($simulationId);

        if ($simulation->idPengguna !== $user->idPengguna) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $currentSection = $simulation->getCurrentSection();
        if (!$currentSection) {
            return response()->json(['error' => 'Invalid simulation status'], 400);
        }

        $existingAnswers = UserAnswer::where('simulation_id', $simulationId)
            ->where('idPengguna', $user->idPengguna)
            ->whereHas('question', function ($query) use ($currentSection) {
                $query->where('modul', $currentSection);
            })
            ->with('question:id,modul')
            ->get(['question_id', 'selected_option']);

        $answersMap = [];
        foreach ($existingAnswers as $answer) {
            $answersMap[$answer->question_id] = $answer->selected_option;
        }

        Log::info('Retrieved existing answers', [
            'simulation_id' => $simulationId,
            'section' => $currentSection,
            'answers_count' => count($answersMap)
        ]);

        return response()->json([
            'simulation_id' => $simulationId,
            'section' => $currentSection,
            'existing_answers' => $answersMap,
            'total_answered' => count($answersMap)
        ]);
    }

    /**
     * Check if current questions are the last in section
     */
    private function isLastQuestionInSection($questionIds, $section, $simulationSetId)
    {
        $allQuestionsInSection = Question::where('simulation_set_id', $simulationSetId)
            ->where('modul', $section)
            ->whereNotNull('correct_option')
            ->orderBy('order_number')
            ->pluck('id');

        if ($allQuestionsInSection->isEmpty()) {
            return false;
        }

        $lastQuestionId = $allQuestionsInSection->last();

        if (is_array($questionIds)) {
            return in_array($lastQuestionId, $questionIds);
        }

        return $questionIds->contains($lastQuestionId);
    }
    /**
     * Get hasil simulasi detail
     */
    public function getResults($simulationId)
    {
        $user = Auth::user();
        $simulation = Simulation::findOrFail($simulationId);

        // Ownership check
        if ($simulation->idPengguna !== $user->idPengguna) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($simulation->status !== 'completed') {
            return response()->json(['error' => 'Simulasi belum selesai'], 400);
        }

        // Get all answers with questions
        $answers = UserAnswer::where('simulation_id', $simulationId)
            ->with(['question' => function ($query) {
                $query->select('id', 'modul', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation', 'group_id', 'order_number');
            }])
            ->get();

        // Get group parent questions (passages for reading)
        $groupParents = Question::where('simulation_set_id', $simulation->simulation_set_id)
            ->whereRaw('group_id = id')
            ->whereNull('correct_option')
            ->orderBy('order_number')
            ->get(['id', 'modul', 'question_text', 'group_id', 'order_number']);

        // Calculate raw scores per section
        $rawScores = [];
        foreach (['listening', 'structure', 'reading'] as $section) {
            $sectionAnswers = $answers->filter(function ($answer) use ($section) {
                return $answer->question && $answer->question->modul === $section;
            });

            $correctCount = $sectionAnswers->where('is_correct', true)->count();
            $totalCount = $sectionAnswers->count();

            $rawScores[$section] = [
                'correct' => $correctCount,
                'total' => $totalCount,
                'percentage' => $totalCount > 0 ? round(($correctCount / $totalCount) * 100, 1) : 0
            ];
        }

        return response()->json([
            'simulation' => $simulation,
            'answers' => $answers,
            'group_parents' => $groupParents,
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

    /**
     * PRIVATE HELPER METHODS
     */

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

    // Calculate TOEFL ITP scores
    private function calculateScores($simulationId)
    {
        $sections = ['listening', 'structure', 'reading'];
        $scores = [];

        foreach ($sections as $section) {
            $correctAnswers = UserAnswer::where('simulation_id', $simulationId)
                ->where('is_correct', true)
                ->whereHas('question', function ($query) use ($section) {
                    $query->where('modul', $section)
                        ->whereNotNull('correct_option'); // Only count answerable questions
                })
                ->count();

            // Convert to TOEFL ITP scale (simplified conversion)
            $scores["score_{$section}"] = $this->convertToTOEFLScale($correctAnswers, $section);
        }

        // Calculate total score (average of three sections)
        $scores['total_score'] = round(($scores['score_listening'] + $scores['score_structure'] + $scores['score_reading']) / 3);

        return $scores;
    }

    // Convert raw score to TOEFL ITP scale
    private function convertToTOEFLScale($correctAnswers, $section)
    {
        // Simplified conversion based on typical TOEFL ITP scaling
        $maxQuestions = [
            'listening' => 50,
            'structure' => 40,
            'reading' => 50
        ];

        $max = $maxQuestions[$section];
        $percentage = ($correctAnswers / $max) * 100;

        // Convert percentage to TOEFL scale (310-680)
        return round(310 + ($percentage / 100) * 370);
    }

    // Get CEFR level based on total score
    private function getCEFRLevel($totalScore)
    {
        if ($totalScore >= 627) return 'C1';
        if ($totalScore >= 543) return 'B2';
        if ($totalScore >= 460) return 'B1';
        if ($totalScore >= 337) return 'A2-B1';
        return 'A2';
    }
}
