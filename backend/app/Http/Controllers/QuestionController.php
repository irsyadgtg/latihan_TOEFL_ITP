<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        try {
            // SIMULATION QUESTIONS: simulation_set = 1
            if ($request->query('simulation_set') == 1) {
                $query = Question::where('simulation_set_id', 1);

                // FIXED: Optional modul filter
                if ($request->query('modul')) {
                    $query->where('modul', $request->query('modul'));
                    Log::info('Fetched simulation questions for specific module', [
                        'modul' => $request->query('modul')
                    ]);
                } else {
                    Log::info('Fetched ALL simulation questions from all modules');
                }

                $questions = $query->orderByRaw("CASE WHEN order_number IS NULL THEN 999999 ELSE order_number END")
                    ->get();

                Log::info('Simulation questions result', [
                    'count' => $questions->count(),
                    'has_modul_filter' => $request->query('modul') ? true : false
                ]);
                return response()->json($questions);
            }

            // QUIZ LATIHAN: normal quiz per unit (TIDAK BOLEH TERGANGGU)
            $quizQuestions = Question::where('modul', $request->modul)
                ->where('unit_number', $request->unit_number)
                ->whereNull('simulation_set_id')
                ->orderByRaw("CASE WHEN order_number IS NULL THEN 999999 ELSE order_number END")
                ->get();

            return response()->json($quizQuestions);
        } catch (Exception $e) {
            Log::error('Error fetching questions: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch questions'], 500);
        }
    }

    // HELPER: Get next order number for quiz within unit
    private function getNextQuizOrderNumber($modul, $unitNumber)
    {
        $maxOrder = Question::where('modul', $modul)
            ->where('unit_number', $unitNumber)
            ->whereNull('simulation_set_id')
            ->whereNotNull('order_number')
            ->max('order_number');
        
        return ($maxOrder ?? 0) + 1;
    }

    // HELPER: Shift quiz questions in unit
    private function shiftQuizQuestions($modul, $unitNumber, $fromOrder, $direction = 'up')
    {
        if ($direction === 'up') {
            // Close gap: shift questions down
            Question::where('modul', $modul)
                ->where('unit_number', $unitNumber)
                ->whereNull('simulation_set_id')
                ->where('order_number', '>', $fromOrder)
                ->decrement('order_number');
        } else {
            // Make space: shift questions up
            Question::where('modul', $modul)
                ->where('unit_number', $unitNumber)
                ->whereNull('simulation_set_id')
                ->where('order_number', '>=', $fromOrder)
                ->increment('order_number');
        }
    }

    // HELPER: Get global order offset for each module (simulation only)
    private function getModulOrderOffset($targetModul)
    {
        $moduls = ['listening', 'structure', 'reading'];
        $offset = 0;

        foreach ($moduls as $modul) {
            if ($modul === $targetModul) {
                break;
            }

            // Count all real questions in this module (individuals + group children)
            $individuals = Question::where('simulation_set_id', 1)
                ->where('modul', $modul)
                ->whereNull('group_id')
                ->whereNotNull('correct_option')
                ->whereNotNull('order_number')
                ->count();

            $groupChildren = Question::where('simulation_set_id', 1)
                ->where('modul', $modul)
                ->whereNotNull('group_id')
                ->where('group_id', '!=', DB::raw('id'))
                ->whereNotNull('correct_option')
                ->whereNotNull('order_number')
                ->count();

            $offset += $individuals + $groupChildren;
        }

        return $offset;
    }

    // HELPER: Get total questions count across all modules (simulation only)
    private function getTotalQuestionsCount()
    {
        $moduls = ['listening', 'structure', 'reading'];
        $total = 0;

        foreach ($moduls as $modul) {
            $individuals = Question::where('simulation_set_id', 1)
                ->where('modul', $modul)
                ->whereNull('group_id')
                ->whereNotNull('correct_option')
                ->whereNotNull('order_number')
                ->count();

            $groupChildren = Question::where('simulation_set_id', 1)
                ->where('modul', $modul)
                ->whereNotNull('group_id')
                ->where('group_id', '!=', DB::raw('id'))
                ->whereNotNull('correct_option')
                ->whereNotNull('order_number')
                ->count();

            $total += $individuals + $groupChildren;
        }

        return $total;
    }

    // CORE: Global resequencing across all modules (simulation only)
    private function resequenceAllModules()
    {
        Log::info('=== GLOBAL RE-SEQUENCING ALL SIMULATION MODULES ===');

        $moduls = ['listening', 'structure', 'reading'];
        $currentOrder = 1;

        foreach ($moduls as $modul) {
            Log::info("Processing module: {$modul}");

            // Get all items in this module (individuals + groups) - SIMULATION ONLY
            $individuals = Question::where('simulation_set_id', 1)
                ->where('modul', $modul)
                ->whereNull('group_id')
                ->whereNotNull('correct_option')
                ->whereNotNull('order_number')
                ->orderBy('order_number')
                ->get();

            $groups = Question::where('simulation_set_id', 1)
                ->where('modul', $modul)
                ->where('group_id', DB::raw('id'))
                ->whereNull('correct_option') // Group parents have null correct_option
                ->get();

            // Build sorted list for this module
            $moduleItems = [];

            // Add individuals
            foreach ($individuals as $individual) {
                $moduleItems[] = [
                    'type' => 'individual',
                    'order' => $individual->order_number,
                    'question' => $individual
                ];
            }

            // Add groups (represented by their first child's order)
            foreach ($groups as $group) {
                $children = Question::where('group_id', $group->id)
                    ->where('id', '!=', $group->id)
                    ->whereNotNull('correct_option')
                    ->whereNotNull('order_number')
                    ->orderBy('order_number')
                    ->get();

                if ($children->isNotEmpty()) {
                    $moduleItems[] = [
                        'type' => 'group',
                        'order' => $children->first()->order_number,
                        'question' => $group,
                        'children' => $children
                    ];
                }
            }

            // Sort items in this module by their current order
            usort($moduleItems, function ($a, $b) {
                return $a['order'] <=> $b['order'];
            });

            // Reassign order numbers starting from currentOrder
            foreach ($moduleItems as $item) {
                if ($item['type'] === 'individual') {
                    $item['question']->update(['order_number' => $currentOrder]);
                    $currentOrder++;
                } else if ($item['type'] === 'group') {
                    // Update all children sequentially
                    foreach ($item['children'] as $child) {
                        $child->update(['order_number' => $currentOrder]);
                        $currentOrder++;
                    }
                }
            }

            Log::info("Module {$modul} processed, next order: {$currentOrder}");
        }

        Log::info('Global re-sequencing complete', ['final_order' => $currentOrder - 1]);
    }

    // CORE: Make space within specific module (simulation only)
    private function makeSpaceInModule($modul, $targetPosition, $spaceNeeded = 1)
    {
        Log::info('=== MAKING SPACE IN MODULE ===', [
            'modul' => $modul,
            'target_position' => $targetPosition,
            'space_needed' => $spaceNeeded
        ]);

        // CRITICAL: Only shift SIMULATION questions that are in this module AND >= targetPosition
        $questionsToShift = Question::where('simulation_set_id', 1)
            ->where('modul', $modul)
            ->whereNotNull('order_number')
            ->whereNotNull('correct_option') // Only real questions
            ->where('order_number', '>=', $targetPosition)
            ->get();

        Log::info('Questions to shift', [
            'count' => $questionsToShift->count(),
            'ids' => $questionsToShift->pluck('id')->toArray(),
            'current_orders' => $questionsToShift->pluck('order_number')->toArray()
        ]);

        // Increment each question individually to avoid conflicts
        foreach ($questionsToShift as $question) {
            $newOrder = $question->order_number + $spaceNeeded;
            Log::info('Shifting question', [
                'id' => $question->id,
                'old_order' => $question->order_number,
                'new_order' => $newOrder
            ]);
            $question->update(['order_number' => $newOrder]);
        }

        Log::info('Space created in module successfully');
    }

    public function store(Request $request)
    {
        Log::info('=== STORE REQUEST START ===', $request->except(['attachment']));

        try {
            $isSimulation = intval($request->simulation_set_id) === 1;
            $correctOption = $request->input('correct_option');
            $isGroupDescription = $isSimulation && (!$request->has('correct_option') || $correctOption === '' || $correctOption === null);

            // DETECT GROUP: Ada children sebagai string JSON
            $hasChildren = $request->has('children') && !empty($request->children);

            if ($hasChildren) {
                Log::info('=== PROCESSING AS GROUP ===');
                return $this->storeGroup($request);
            }

            Log::info('=== PROCESSING AS INDIVIDUAL ===');
            return $this->storeIndividual($request, $isGroupDescription);
        } catch (Exception $e) {
            Log::error('Store failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to create question: ' . $e->getMessage()], 500);
        }
    }

    private function storeIndividual(Request $request, bool $isGroupDescription)
    {
        $isSimulation = intval($request->simulation_set_id) === 1;

        $rules = [
            'question_text' => 'required|string',
            'explanation' => 'nullable|string',
            'modul' => 'required|in:listening,structure,reading',
            'unit_number' => 'nullable|integer',
            'simulation_set_id' => 'nullable|exists:simulation_sets,id',
            'group_id' => 'nullable|exists:questions,id',
        ];

        if ($isGroupDescription) {
            // Group description (parent) validation
            $rules += [
                'correct_option' => 'nullable',
                'order_number' => 'nullable',
                'option_a' => 'nullable|string',
                'option_b' => 'nullable|string',
                'option_c' => 'nullable|string',
                'option_d' => 'nullable|string',
            ];
        } else {
            // Individual question OR quiz latihan validation
            $rules += [
                'correct_option' => 'required|in:a,b,c,d',
                'option_a' => 'required|string',
                'option_b' => 'required|string',
                'option_c' => 'required|string',
                'option_d' => 'required|string',
            ];

            // Order number handling
            if ($isSimulation) {
                $rules['order_number'] = 'required|integer|min:1';
            } else {
                // Quiz latihan: order_number optional, will be auto-assigned
                $rules['order_number'] = 'nullable|integer|min:1';
            }
        }

        if ($request->hasFile('attachment')) {
            $rules['attachment'] = 'nullable|file|mimes:jpg,jpeg,png,gif,mp3,wav,ogg,mp4,webm|max:20480';
        }

        $data = $request->validate($rules);

        if ($isSimulation) {
            $data['unit_number'] = null;
            $data['simulation_set_id'] = 1;
        } else {
            // QUIZ LATIHAN: Auto-assign order_number if not provided
            if (!isset($data['order_number']) || $data['order_number'] === null) {
                $data['order_number'] = $this->getNextQuizOrderNumber($data['modul'], $data['unit_number']);
            }
        }

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('attachments', 'public');
            $data['attachment'] = '/storage/' . $path;
        } elseif ($request->filled('attachment')) {
            $data['attachment'] = $request->input('attachment');
        }

        return DB::transaction(function () use ($data, $isGroupDescription, $isSimulation) {
            if (!$isGroupDescription && $isSimulation) {
                // SIMULATION ONLY: Handle order number for simulation questions
                $targetOrder = $data['order_number'];
                $modul = $data['modul'];

                // Make space only in same module
                $this->makeSpaceInModule($modul, $targetOrder, 1);

                // Create the question with the target order
                $data['order_number'] = $targetOrder;
            } elseif (!$isGroupDescription && !$isSimulation) {
                // QUIZ LATIHAN: Handle order number within unit
                $targetOrder = $data['order_number'];
                $modul = $data['modul'];
                $unitNumber = $data['unit_number'];

                // Make space for quiz question within unit
                $this->shiftQuizQuestions($modul, $unitNumber, $targetOrder, 'down');

                // Create the question with the target order
                $data['order_number'] = $targetOrder;
            }

            $question = Question::create($data);

            if ($isGroupDescription) {
                // Set group_id to itself for group parent
                $question->update(['group_id' => $question->id]);
            } else if ($isSimulation) {
                // Always resequence globally for simulation to maintain order across modules
                $this->resequenceAllModules();
            }
            // QUIZ LATIHAN: No global resequencing needed, just simple unit-based

            Log::info('Individual question created', [
                'id' => $question->id,
                'type' => $isSimulation ? 'simulation' : 'quiz',
                'order' => $question->order_number
            ]);
            return response()->json($question, 201);
        });
    }

    private function storeGroup(Request $request)
    {
        return DB::transaction(function () use ($request) {
            // 1. Parse and validate children
            $childrenJson = $request->input('children');
            Log::info('Children JSON received', ['json' => $childrenJson]);

            if (is_string($childrenJson)) {
                $children = json_decode($childrenJson, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new Exception('Invalid JSON in children: ' . json_last_error_msg());
                }
            } else {
                throw new Exception('Children must be JSON string');
            }

            if (!is_array($children) || count($children) < 1) {
                throw new Exception('At least one child question is required');
            }

            Log::info('Parsed children', ['count' => count($children), 'children' => $children]);

            // 2. Validate parent
            $parentRules = [
                'question_text' => 'nullable|string',
                'modul' => 'required|in:listening,structure,reading',
                'order_number' => 'required|integer|min:1',
            ];

            if ($request->hasFile('attachment')) {
                $parentRules['attachment'] = 'nullable|file|mimes:jpg,jpeg,png,gif,mp3,wav,ogg,mp4,webm|max:20480';
            }

            $data = $request->validate($parentRules);

            // 3. Validate each child
            foreach ($children as $index => $child) {
                if (
                    !isset($child['question_text']) || !isset($child['option_a']) ||
                    !isset($child['option_b']) || !isset($child['option_c']) ||
                    !isset($child['option_d']) || !isset($child['correct_option'])
                ) {
                    throw new Exception("Child {$index}: Missing required fields");
                }

                if (
                    empty(trim($child['question_text'])) || empty(trim($child['option_a'])) ||
                    empty(trim($child['option_b'])) || empty(trim($child['option_c'])) ||
                    empty(trim($child['option_d'])) || empty(trim($child['correct_option']))
                ) {
                    throw new Exception("Child {$index}: Fields cannot be empty");
                }

                if (!in_array($child['correct_option'], ['a', 'b', 'c', 'd'])) {
                    throw new Exception("Child {$index}: Invalid correct option");
                }
            }

            // 4. Make space in same module only (SIMULATION ONLY)
            $startOrder = $data['order_number'];
            $childrenCount = count($children);
            $modul = $data['modul'];

            Log::info('Group insertion', ['start_order' => $startOrder, 'children_count' => $childrenCount]);

            $this->makeSpaceInModule($modul, $startOrder, $childrenCount);

            // 5. Create parent
            $parentData = [
                'question_text' => $data['question_text'] ?? '',
                'modul' => $modul,
                'simulation_set_id' => 1, // Groups only for simulation
                'unit_number' => null,
                'correct_option' => null, // Parent has no correct answer
                'order_number' => null, // Parent has no order
                'option_a' => null,
                'option_b' => null,
                'option_c' => null,
                'option_d' => null,
                'explanation' => null,
            ];

            if ($request->hasFile('attachment')) {
                $path = $request->file('attachment')->store('attachments', 'public');
                $parentData['attachment'] = '/storage/' . $path;
            } elseif ($request->filled('attachment')) {
                $parentData['attachment'] = $request->input('attachment');
            }

            $parent = Question::create($parentData);
            $parent->update(['group_id' => $parent->id]);

            Log::info('Parent created', ['id' => $parent->id]);

            // 6. Create children with sequential order numbers
            foreach ($children as $index => $childData) {
                $childQuestion = [
                    'question_text' => trim($childData['question_text']),
                    'option_a' => trim($childData['option_a']),
                    'option_b' => trim($childData['option_b']),
                    'option_c' => trim($childData['option_c']),
                    'option_d' => trim($childData['option_d']),
                    'correct_option' => $childData['correct_option'],
                    'explanation' => trim($childData['explanation'] ?? ''),
                    'modul' => $modul,
                    'simulation_set_id' => 1,
                    'unit_number' => null,
                    'group_id' => $parent->id,
                    'order_number' => $startOrder + $index,
                    'attachment' => null,
                ];

                $child = Question::create($childQuestion);
                Log::info('Child created', ['id' => $child->id, 'order' => $child->order_number]);
            }

            // Always resequence globally to maintain order across modules
            $this->resequenceAllModules();

            return response()->json([
                'message' => 'Grup soal berhasil disimpan',
                'parent' => $parent,
                'children_count' => $childrenCount
            ], 201);
        });
    }

    public function update(Request $request, $id)
    {
        Log::info('=== UPDATE REQUEST START ===', ['id' => $id, 'data' => $request->except(['attachment'])]);

        try {
            $question = Question::findOrFail($id);

            // DETECT GROUP UPDATE: Ada children
            $hasChildren = $request->has('children') && !empty($request->children);

            if ($hasChildren) {
                Log::info('=== PROCESSING GROUP UPDATE ===');
                return $this->updateGroup($request, $id);
            }

            Log::info('=== PROCESSING INDIVIDUAL UPDATE ===');
            return $this->updateIndividual($request, $question);
        } catch (Exception $e) {
            Log::error('Update failed: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Failed to update question: ' . $e->getMessage()], 500);
        }
    }

    private function updateIndividual(Request $request, Question $question)
    {
        $isSimulation = intval($request->simulation_set_id) === 1;
        $correctOption = $request->input('correct_option');
        $isGroupDescription = $isSimulation && (!$request->has('correct_option') || $correctOption === '' || $correctOption === null);

        $rules = [
            'question_text' => 'required|string',
            'explanation' => 'nullable|string',
            'modul' => 'required|in:listening,structure,reading',
            'unit_number' => 'nullable|integer',
            'simulation_set_id' => 'nullable|exists:simulation_sets,id',
            'group_id' => 'nullable|exists:questions,id',
        ];

        if ($isGroupDescription) {
            $rules += [
                'correct_option' => 'nullable',
                'order_number' => 'nullable',
                'option_a' => 'nullable|string',
                'option_b' => 'nullable|string',
                'option_c' => 'nullable|string',
                'option_d' => 'nullable|string',
            ];
        } else {
            $rules += [
                'correct_option' => 'required|in:a,b,c,d',
                'option_a' => 'required|string',
                'option_b' => 'required|string',
                'option_c' => 'required|string',
                'option_d' => 'required|string',
            ];

            // Order number handling for both simulation and quiz
            if ($isSimulation) {
                $rules['order_number'] = 'required|integer|min:1';
            } else {
                $rules['order_number'] = 'required|integer|min:1';
            }
        }

        if ($request->hasFile('attachment')) {
            $rules['attachment'] = 'nullable|file|mimes:jpg,jpeg,png,gif,mp3,wav,ogg,mp4,webm|max:20480';
        }

        $data = $request->validate($rules);

        if ($isSimulation) {
            $data['unit_number'] = null;
            $data['simulation_set_id'] = 1;
            $data['modul'] = $question->modul; // Keep same module
        }

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('attachments', 'public');
            $data['attachment'] = '/storage/' . $path;
        } elseif ($request->filled('attachment')) {
            $data['attachment'] = $request->input('attachment');
        }

        return DB::transaction(function () use ($question, $data, $isGroupDescription, $isSimulation) {
            if (
                !$isGroupDescription &&
                $question->order_number != $data['order_number'] &&
                $question->group_id === null
            ) { // Only for individual questions

                $oldOrder = $question->order_number;
                $newOrder = $data['order_number'];

                Log::info('Individual order change detected', ['old' => $oldOrder, 'new' => $newOrder]);

                if ($isSimulation) {
                    // SIMULATION: Handle order change within same module only
                    $modul = $question->modul;

                    // First, remove this question from sequence (temporarily)
                    $question->update(['order_number' => null]);

                    // Close the gap left by removed question (same module only)
                    Question::where('simulation_set_id', 1)
                        ->where('modul', $modul)
                        ->whereNotNull('order_number')
                        ->whereNotNull('correct_option')
                        ->where('order_number', '>', $oldOrder)
                        ->decrement('order_number');

                    // Make space at new position (same module only)
                    $this->makeSpaceInModule($modul, $newOrder, 1);

                    // Set the new order
                    $data['order_number'] = $newOrder;
                } else {
                    // QUIZ LATIHAN: Handle order change within unit only
                    $modul = $question->modul;
                    $unitNumber = $question->unit_number;

                    // First, remove this question from sequence (temporarily)
                    $question->update(['order_number' => null]);

                    // Close the gap left by removed question (same unit only)
                    Question::where('modul', $modul)
                        ->where('unit_number', $unitNumber)
                        ->whereNull('simulation_set_id')
                        ->whereNotNull('order_number')
                        ->where('order_number', '>', $oldOrder)
                        ->decrement('order_number');

                    // Make space at new position (same unit only)
                    $this->shiftQuizQuestions($modul, $unitNumber, $newOrder, 'down');

                    // Set the new order
                    $data['order_number'] = $newOrder;
                }
            }

            $question->update($data);

            if (!$isGroupDescription && $isSimulation) {
                // Always resequence globally for simulation to maintain order across modules
                $this->resequenceAllModules();
            }
            // QUIZ LATIHAN: No global resequencing needed

            Log::info('Individual question updated', [
                'id' => $question->id,
                'type' => $isSimulation ? 'simulation' : 'quiz'
            ]);
            return response()->json($question);
        });
    }

    private function updateGroup(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $parent = Question::findOrFail($id);

            // 1. Parse children
            $childrenJson = $request->input('children');
            Log::info('Update group children JSON', ['json' => $childrenJson]);

            if (is_string($childrenJson)) {
                $children = json_decode($childrenJson, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new Exception('Invalid JSON in children: ' . json_last_error_msg());
                }
            } else {
                throw new Exception('Children must be JSON string');
            }

            if (!is_array($children) || count($children) < 1) {
                throw new Exception('At least one child question is required');
            }

            // 2. Validate parent data
            $parentRules = [
                'question_text' => 'nullable|string',
                'modul' => 'required|in:listening,structure,reading',
                'order_number' => 'nullable|integer|min:1', // Group order change
            ];

            if ($request->hasFile('attachment')) {
                $parentRules['attachment'] = 'nullable|file|mimes:jpg,jpeg,png,gif,mp3,wav,ogg,mp4,webm|max:20480';
            }

            $data = $request->validate($parentRules);

            // 3. Get existing children info
            $existingChildren = Question::where('group_id', $parent->id)
                ->where('id', '!=', $parent->id)
                ->whereNotNull('order_number')
                ->whereNotNull('correct_option')
                ->orderBy('order_number')
                ->get();

            $oldChildrenCount = $existingChildren->count();
            $newChildrenCount = count($children);
            $oldStartOrder = $existingChildren->isNotEmpty() ? $existingChildren->first()->order_number : null;

            // Handle group order change (same module only)
            $newStartOrder = $request->filled('order_number') ? $data['order_number'] : $oldStartOrder;

            Log::info('Group update info', [
                'old_count' => $oldChildrenCount,
                'new_count' => $newChildrenCount,
                'old_start_order' => $oldStartOrder,
                'new_start_order' => $newStartOrder,
            ]);

            // 4. Update parent
            $parentData = [
                'question_text' => $data['question_text'] ?? '',
            ];

            if ($request->hasFile('attachment')) {
                $path = $request->file('attachment')->store('attachments', 'public');
                $parentData['attachment'] = '/storage/' . $path;
            } elseif ($request->filled('attachment')) {
                $parentData['attachment'] = $request->input('attachment');
            }

            $parent->update($parentData);

            // 5. Remove old children completely (same module only)
            if ($oldStartOrder && $oldChildrenCount > 0) {
                // Remove old children order numbers
                Question::where('group_id', $parent->id)
                    ->where('id', '!=', $parent->id)
                    ->update(['order_number' => null]);

                // Close gaps by shifting everything after old group (same module only)
                Question::where('simulation_set_id', 1)
                    ->where('modul', $data['modul'])
                    ->whereNotNull('order_number')
                    ->whereNotNull('correct_option')
                    ->where('order_number', '>', $oldStartOrder + $oldChildrenCount - 1)
                    ->decrement('order_number', $oldChildrenCount);
            }

            // Delete all old children
            Question::where('group_id', $parent->id)
                ->where('id', '!=', $parent->id)
                ->delete();

            // 6. Insert group at new position (same module only)
            $finalStartOrder = $newStartOrder ?? 1;
            $this->makeSpaceInModule($data['modul'], $finalStartOrder, $newChildrenCount);

            // 7. Create new children
            foreach ($children as $index => $childData) {
                $childQuestion = [
                    'question_text' => trim($childData['question_text']),
                    'option_a' => trim($childData['option_a']),
                    'option_b' => trim($childData['option_b']),
                    'option_c' => trim($childData['option_c']),
                    'option_d' => trim($childData['option_d']),
                    'correct_option' => $childData['correct_option'],
                    'explanation' => trim($childData['explanation'] ?? ''),
                    'modul' => $data['modul'],
                    'simulation_set_id' => 1,
                    'unit_number' => null,
                    'group_id' => $parent->id,
                    'order_number' => $finalStartOrder + $index,
                    'attachment' => null,
                ];

                Question::create($childQuestion);
            }

            // Always resequence globally to maintain order across modules
            $this->resequenceAllModules();

            Log::info('Group updated successfully', ['parent_id' => $parent->id]);

            return response()->json([
                'message' => 'Grup soal berhasil diupdate',
                'parent' => $parent,
                'children_count' => $newChildrenCount
            ]);
        });
    }

    public function destroy($id)
    {
        Log::info('=== DELETE REQUEST ===', ['id' => $id]);

        try {
            return DB::transaction(function () use ($id) {
                $question = Question::findOrFail($id);
                $modul = $question->modul;
                $isSimulation = $question->simulation_set_id === 1;
                $unitNumber = $question->unit_number;

                if ($question->group_id === $question->id) {
                    // DELETING GROUP PARENT: Delete children FIRST, then parent
                    Log::info('Deleting group parent', ['group_id' => $question->id]);

                    // STEP 1: Get children info BEFORE deleting anything
                    $children = Question::where('group_id', $question->id)
                        ->where('id', '!=', $question->id)
                        ->whereNotNull('order_number')
                        ->whereNotNull('correct_option')
                        ->orderBy('order_number')
                        ->get();

                    Log::info('Found children to delete', [
                        'children_ids' => $children->pluck('id')->toArray(),
                        'children_count' => $children->count()
                    ]);

                    if ($children->isNotEmpty()) {
                        $startOrder = $children->first()->order_number;
                        $endOrder = $children->last()->order_number;
                        $childrenCount = $children->count();

                        Log::info('Group deletion info', [
                            'start_order' => $startOrder,
                            'end_order' => $endOrder,
                            'children_count' => $childrenCount
                        ]);

                        // STEP 2: Delete children FIRST
                        $deletedChildrenCount = Question::where('group_id', $question->id)
                            ->where('id', '!=', $question->id)
                            ->delete();
                        Log::info('Deleted children first', ['deleted_children_count' => $deletedChildrenCount]);

                        // STEP 3: Delete parent
                        $question->delete();
                        Log::info('Deleted parent after children');

                        // STEP 4: Shift questions after group up (same module only, simulation only)
                        if ($isSimulation) {
                            $shiftedCount = Question::where('simulation_set_id', 1)
                                ->where('modul', $modul)
                                ->whereNotNull('order_number')
                                ->whereNotNull('correct_option')
                                ->where('order_number', '>', $endOrder)
                                ->decrement('order_number', $childrenCount);

                            Log::info('Shifted questions after group deletion', ['shifted_count' => $shiftedCount]);
                        }
                    } else {
                        // Group with no children, just delete parent
                        Log::info('Deleting group with no children');
                        $question->delete();
                    }
                } else {
                    // Deleting individual question
                    if ($question->order_number && $question->group_id === null) {
                        if ($isSimulation) {
                            // Shift questions after this one up (same module only, simulation only)
                            Question::where('simulation_set_id', 1)
                                ->where('modul', $modul)
                                ->whereNotNull('order_number')
                                ->whereNotNull('correct_option')
                                ->where('order_number', '>', $question->order_number)
                                ->decrement('order_number');
                        } else {
                            // QUIZ LATIHAN: Shift questions after this one up (same unit only)
                            Question::where('modul', $modul)
                                ->where('unit_number', $unitNumber)
                                ->whereNull('simulation_set_id')
                                ->whereNotNull('order_number')
                                ->where('order_number', '>', $question->order_number)
                                ->decrement('order_number');
                        }
                    }

                    $question->delete();
                }

                if ($isSimulation) {
                    // Always resequence globally for simulation to maintain order across modules
                    $this->resequenceAllModules();
                }
                // QUIZ LATIHAN: No global resequencing needed

                Log::info('Question deleted successfully', [
                    'type' => $isSimulation ? 'simulation' : 'quiz'
                ]);
                return response()->json(['message' => 'Soal berhasil dihapus']);
            });
        } catch (Exception $e) {
            Log::error('Delete failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete question'], 500);
        }
    }
}