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
            $results = [];

            foreach ($validated['answers'] as $answerData) {
                $question = Question::findOrFail($answerData['question_id']);

                // Ensure this is a quiz question (not simulation)
                if ($question->simulation_set_id !== null) {
                    return response()->json(['message' => 'Invalid question type'], 400);
                }

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

            Log::info('Quiz submitted successfully', [
                'idPengguna' => $idPengguna,
                'questions_answered' => count($results),
                'correct_answers' => count(array_filter($results, fn($r) => $r['is_correct']))
            ]);

            return response()->json([
                'results' => $results,
                'message' => 'Quiz submitted successfully'
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