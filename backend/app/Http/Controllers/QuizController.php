<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\UserAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class QuizController extends Controller
{
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.selected_option' => 'required|in:a,b,c,d'
        ]);

        try {
            DB::beginTransaction();
            
            $idPengguna = Auth::id();
            
            // 🔥 VALIDASI BARU: Dapatkan info modul dan unit dari soal pertama
            $firstQuestion = Question::findOrFail($validated['answers'][0]['question_id']);
            
            // Pastikan ini quiz latihan (bukan simulasi)
            if ($firstQuestion->simulation_set_id !== null) {
                return response()->json(['message' => 'Invalid question type'], 400);
            }
            
            $modul = $firstQuestion->modul;
            $unitNumber = $firstQuestion->unit_number;
            
            // 🔥 VALIDASI BARU: Hitung total soal yang seharusnya dijawab dalam unit ini
            $totalQuestionsInUnit = Question::where('modul', $modul)
                                           ->where('unit_number', $unitNumber)
                                           ->whereNull('simulation_set_id') // Quiz latihan only
                                           ->whereNotNull('correct_option') // Soal valid (bukan deskripsi group)
                                           ->count();
            
            // 🔥 VALIDASI BARU: Pastikan jumlah jawaban sama dengan total soal
            $totalAnswersSubmitted = count($validated['answers']);
            
            if ($totalAnswersSubmitted !== $totalQuestionsInUnit) {
                return response()->json([
                    'message' => 'Anda harus menjawab semua soal sebelum submit!',
                    'details' => [
                        'total_soal' => $totalQuestionsInUnit,
                        'jawaban_dikirim' => $totalAnswersSubmitted,
                        'soal_belum_dijawab' => $totalQuestionsInUnit - $totalAnswersSubmitted
                    ]
                ], 400);
            }
            
            // 🔥 VALIDASI BARU: Pastikan semua question_id yang dikirim memang dari unit yang sama
            $questionIds = array_column($validated['answers'], 'question_id');
            $questionsInUnit = Question::where('modul', $modul)
                                      ->where('unit_number', $unitNumber)
                                      ->whereNull('simulation_set_id')
                                      ->whereNotNull('correct_option')
                                      ->pluck('id')
                                      ->toArray();
            
            $invalidQuestions = array_diff($questionIds, $questionsInUnit);
            if (!empty($invalidQuestions)) {
                return response()->json([
                    'message' => 'Terdapat soal yang tidak valid untuk unit ini',
                    'invalid_question_ids' => $invalidQuestions
                ], 400);
            }
            
            // 🔥 VALIDASI BARU: Pastikan tidak ada soal yang duplikat dalam submission
            $uniqueQuestionIds = array_unique($questionIds);
            if (count($uniqueQuestionIds) !== count($questionIds)) {
                return response()->json([
                    'message' => 'Terdapat soal yang dijawab lebih dari sekali'
                ], 400);
            }
            
            $results = [];

            foreach ($validated['answers'] as $answerData) {
                $question = Question::findOrFail($answerData['question_id']);
                $isCorrect = $question->correct_option === $answerData['selected_option'];

                // Check if user already answered this question
                $existingAnswer = UserAnswer::where('idPengguna', $idPengguna)
                                          ->where('question_id', $question->id)
                                          ->whereNull('simulation_id') // Only quiz answers
                                          ->first();

                if ($existingAnswer) {
                    // Update existing answer
                    $existingAnswer->update([
                        'selected_option' => $answerData['selected_option'],
                        'is_correct' => $isCorrect
                    ]);
                    $userAnswer = $existingAnswer;
                } else {
                    // Create new answer
                    $userAnswer = UserAnswer::create([
                        'idPengguna' => $idPengguna,
                        'question_id' => $question->id,
                        'selected_option' => $answerData['selected_option'],
                        'is_correct' => $isCorrect,
                        'simulation_id' => null // This is quiz, not simulation
                    ]);
                }

                $results[] = [
                    'question_id' => $question->id,
                    'question_text' => $question->question_text,
                    'selected_option' => $answerData['selected_option'],
                    'correct_option' => $question->correct_option,
                    'is_correct' => $isCorrect,
                    'explanation' => $question->explanation
                ];
            }

            DB::commit();

            // 🔥 HITUNG SKOR FINAL
            $correctCount = count(array_filter($results, fn($r) => $r['is_correct']));
            $totalCount = count($results);
            $percentage = round(($correctCount / $totalCount) * 100, 2);

            Log::info('Quiz submitted successfully', [
                'idPengguna' => $idPengguna,
                'modul' => $modul,
                'unit_number' => $unitNumber,
                'questions_answered' => $totalCount,
                'correct_answers' => $correctCount,
                'percentage' => $percentage
            ]);

            return response()->json([
                'results' => $results,
                'summary' => [
                    'total_soal' => $totalCount,
                    'jawaban_benar' => $correctCount,
                    'persentase' => $percentage,
                    'modul' => $modul,
                    'unit' => $unitNumber
                ],
                'message' => 'Quiz berhasil diselesaikan!'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Quiz submit failed: ' . $e->getMessage());
            return response()->json(['message' => 'Error submitting quiz: ' . $e->getMessage()], 500);
        }
    }

    public function answers(Request $request)
    {
        $validated = $request->validate([
            'modul' => 'required|in:listening,structure,reading',
            'unit_number' => 'required|integer'
        ]);

        try {
            $idPengguna = Auth::id();

            // Get questions for this unit (only quiz questions, not simulation)
            $questions = Question::where('modul', $validated['modul'])
                               ->where('unit_number', $validated['unit_number'])
                               ->whereNull('simulation_set_id') // Only quiz questions
                               ->pluck('id');

            // Get user answers for these questions (only quiz answers, not simulation)
            $userAnswers = UserAnswer::where('idPengguna', $idPengguna)
                                    ->whereIn('question_id', $questions)
                                    ->whereNull('simulation_id') // Only quiz answers
                                    ->with('question')
                                    ->get();

            $results = $userAnswers->map(function ($answer) {
                return [
                    'question_id' => $answer->question->id,
                    'question_text' => $answer->question->question_text,
                    'selected_option' => $answer->selected_option,
                    'correct_option' => $answer->question->correct_option,
                    'is_correct' => $answer->is_correct,
                    'explanation' => $answer->question->explanation
                ];
            });

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Get quiz answers failed: ' . $e->getMessage());
            return response()->json(['message' => 'Error getting quiz answers: ' . $e->getMessage()], 500);
        }
    }
}