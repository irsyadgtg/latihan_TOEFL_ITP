<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Question;
use Illuminate\Support\Facades\DB;

class SimulationQuestionsSeeder extends Seeder
{
    private $currentOrder = 1;

    public function run(): void
    {
        DB::transaction(function () {
            // Clear existing simulation questions
            Question::where('simulation_set_id', 1)->delete();
            
            $this->seedListening(); // 50 soal
            $this->seedStructure();  // 40 soal  
            $this->seedReading();    // 50 soal
            
            echo "✅ Seeded " . ($this->currentOrder - 1) . " simulation questions (Total: 140)\n";
        });
    }

    private function seedListening()
    {
        echo "🎧 Seeding Listening section...\n";
        
        // PART A: 30 soal individual (short conversations)
        for ($i = 1; $i <= 30; $i++) {
            Question::create([
                'simulation_set_id' => 1,
                'modul' => 'listening',
                'unit_number' => null,
                'question_text' => "What does the woman mean?",
                'attachment' => "/storage/attachments/listening/short_conversation_{$i}.mp3",
                'option_a' => 'She agrees with the man',
                'option_b' => 'She disagrees with the man',
                'option_c' => 'She is confused',
                'option_d' => 'She needs more information',
                'correct_option' => ['a', 'b', 'c', 'd'][rand(0, 3)],
                'explanation' => "Listen for the woman's tone and context clues.",
                'order_number' => $this->currentOrder++,
                'group_id' => null,
            ]);
        }

        // PART B: 7 conversations = 17 soal total
        $conversations = [
            ['questions' => 2, 'topic' => 'Registration Process'],
            ['questions' => 3, 'topic' => 'Library Research'],
            ['questions' => 2, 'topic' => 'Class Schedule'],
            ['questions' => 3, 'topic' => 'Campus Housing'],
            ['questions' => 2, 'topic' => 'Professor Meeting'],
            ['questions' => 3, 'topic' => 'Student Activities'],
            ['questions' => 2, 'topic' => 'Cafeteria Plans'],
        ];

        foreach ($conversations as $index => $conv) {
            $convNum = $index + 1;
            
            // Create parent group
            $parent = Question::create([
                'simulation_set_id' => 1,
                'modul' => 'listening',
                'unit_number' => null,
                'question_text' => "Conversation {$convNum}: {$conv['topic']}",
                'attachment' => "/storage/attachments/listening/conversation_{$convNum}.mp3",
                'option_a' => null,
                'option_b' => null,
                'option_c' => null,
                'option_d' => null,
                'correct_option' => null,
                'explanation' => null,
                'order_number' => null,
                'group_id' => null,
            ]);
            
            $parent->update(['group_id' => $parent->id]);

            // Create children questions
            $questionTexts = [
                'What is the main topic of the conversation?',
                'What does the man suggest?',
                'What will the woman probably do next?',
            ];

            for ($q = 0; $q < $conv['questions']; $q++) {
                Question::create([
                    'simulation_set_id' => 1,
                    'modul' => 'listening',
                    'unit_number' => null,
                    'question_text' => $questionTexts[$q] ?? 'What can be inferred from the conversation?',
                    'attachment' => null,
                    'option_a' => 'Option A for conversation question',
                    'option_b' => 'Option B for conversation question',
                    'option_c' => 'Option C for conversation question',
                    'option_d' => 'Option D for conversation question',
                    'correct_option' => ['a', 'b', 'c', 'd'][rand(0, 3)],
                    'explanation' => 'Listen for specific details and implied meanings.',
                    'order_number' => $this->currentOrder++,
                    'group_id' => $parent->id,
                ]);
            }
        }

        // PART C: 1 talk = 3 soal total
        $talks = [
            ['questions' => 3, 'topic' => 'Biology Lecture'],
        ];

        foreach ($talks as $index => $talk) {
            $talkNum = $index + 1;
            
            // Create parent group
            $parent = Question::create([
                'simulation_set_id' => 1,
                'modul' => 'listening',
                'unit_number' => null,
                'question_text' => "Talk {$talkNum}: {$talk['topic']}",
                'attachment' => "/storage/attachments/listening/talk_{$talkNum}.mp3",
                'option_a' => null,
                'option_b' => null,
                'option_c' => null,
                'option_d' => null,
                'correct_option' => null,
                'explanation' => null,
                'order_number' => null,
                'group_id' => null,
            ]);
            
            $parent->update(['group_id' => $parent->id]);

            // Create children questions
            $questionTexts = [
                'What is the main purpose of this talk?',
                'According to the speaker, what should students do?',
                'What does the speaker imply about...?',
                'What will the speaker probably discuss next?',
            ];

            for ($q = 0; $q < $talk['questions']; $q++) {
                Question::create([
                    'simulation_set_id' => 1,
                    'modul' => 'listening',
                    'unit_number' => null,
                    'question_text' => $questionTexts[$q],
                    'attachment' => null,
                    'option_a' => 'Option A for talk question',
                    'option_b' => 'Option B for talk question',
                    'option_c' => 'Option C for talk question',
                    'option_d' => 'Option D for talk question',
                    'correct_option' => ['a', 'b', 'c', 'd'][rand(0, 3)],
                    'explanation' => 'Listen for the main ideas and supporting details.',
                    'order_number' => $this->currentOrder++,
                    'group_id' => $parent->id,
                ]);
            }
        }

        echo "✓ Listening: 50 soal (30 individual + 17 conversation + 3 talk)\n";
    }

    private function seedStructure()
    {
        echo "📝 Seeding Structure section...\n";
        
        // PART A: 15 soal individual (incomplete sentences)
        $incompleteQuestions = [
            ['text' => 'The students _____ to the library every day.', 'options' => ['go', 'goes', 'going', 'gone'], 'correct' => 'a'],
            ['text' => 'If I _____ more time, I would study harder.', 'options' => ['have', 'had', 'having', 'has'], 'correct' => 'b'],
            ['text' => 'The book _____ on the table belongs to Mary.', 'options' => ['lying', 'lies', 'lay', 'lain'], 'correct' => 'a'],
            ['text' => 'She _____ English for five years.', 'options' => ['studies', 'study', 'has studied', 'studying'], 'correct' => 'c'],
            ['text' => 'The meeting _____ at 3 PM yesterday.', 'options' => ['start', 'started', 'starts', 'starting'], 'correct' => 'b'],
            ['text' => '_____ the weather is nice, we will go to the park.', 'options' => ['Because', 'If', 'Although', 'Unless'], 'correct' => 'b'],
            ['text' => 'The teacher asked the students _____ quietly.', 'options' => ['work', 'to work', 'working', 'worked'], 'correct' => 'b'],
            ['text' => 'Neither John _____ Mary came to the party.', 'options' => ['or', 'nor', 'and', 'but'], 'correct' => 'b'],
            ['text' => 'The car _____ was stolen has been found.', 'options' => ['who', 'which', 'what', 'whom'], 'correct' => 'b'],
            ['text' => 'She is _____ intelligent student in the class.', 'options' => ['more', 'most', 'the most', 'much'], 'correct' => 'c'],
            ['text' => 'By next year, they _____ their project.', 'options' => ['complete', 'completed', 'will complete', 'will have completed'], 'correct' => 'd'],
            ['text' => 'The students were asked _____ their homework.', 'options' => ['submit', 'to submit', 'submitting', 'submitted'], 'correct' => 'b'],
            ['text' => '_____ carefully, the instructions are easy to follow.', 'options' => ['Read', 'Reading', 'To read', 'When read'], 'correct' => 'b'],
            ['text' => 'The professor _____ the lecture will be postponed.', 'options' => ['announce', 'announced', 'announcement', 'announcing'], 'correct' => 'b'],
            ['text' => 'It is important _____ on time for the exam.', 'options' => ['arrive', 'to arrive', 'arriving', 'arrived'], 'correct' => 'b'],
        ];

        foreach ($incompleteQuestions as $q) {
            Question::create([
                'simulation_set_id' => 1,
                'modul' => 'structure',
                'unit_number' => null,
                'question_text' => $q['text'],
                'attachment' => null,
                'option_a' => $q['options'][0],
                'option_b' => $q['options'][1],
                'option_c' => $q['options'][2],
                'option_d' => $q['options'][3],
                'correct_option' => $q['correct'],
                'explanation' => 'Choose the word or phrase that best completes the sentence.',
                'order_number' => $this->currentOrder++,
                'group_id' => null,
            ]);
        }

        // PART B: 25 soal individual (error identification)
        $errorQuestions = [
            'The students is studying hard for their exams next week.',
            'She have been working at this company for three years.',
            'Each of the books are placed on the correct shelf.',
            'The teacher explained the lesson clear to all students.',
            'If I was you, I would take that job opportunity.',
            'The meeting will hold in the conference room tomorrow.',
            'Neither the students nor the teacher were present yesterday.',
            'She is more intelligent than any students in her class.',
            'The book which I bought it yesterday is very interesting.',
            'He suggested to go to the movies instead of staying home.',
            'The professor asked us studying the chapter before class.',
            'Despite of the rain, they decided to go camping.',
            'She has been lived in this city for ten years.',
            'The informations provided were very helpful for the research.',
            'He is enough tall to reach the top shelf.',
            'The children was playing in the garden when it started raining.',
            'She speaks English more fluent than her sister.',
            'The number of students in the class are increasing.',
            'He said that he will come to the party yesterday.',
            'The book was wrote by a famous author.',
            'She is accustomed to get up early every morning.',
            'The teacher made the students to write an essay.',
            'Less people attended the meeting than expected.',
            'She is looking forward to meet her old friends.',
            'The house where we lived in was very old.',
        ];

        foreach ($errorQuestions as $index => $errorText) {
            Question::create([
                'simulation_set_id' => 1,
                'modul' => 'structure',
                'unit_number' => null,
                'question_text' => $errorText,
                'attachment' => null,
                'option_a' => 'A',
                'option_b' => 'B', 
                'option_c' => 'C',
                'option_d' => 'D',
                'correct_option' => ['a', 'b', 'c', 'd'][rand(0, 3)],
                'explanation' => 'Identify the underlined word or phrase that must be changed.',
                'order_number' => $this->currentOrder++,
                'group_id' => null,
            ]);
        }

        echo "✓ Structure: 40 soal (15 incomplete + 25 error identification)\n";
    }

    private function seedReading()
    {
        echo "📖 Seeding Reading section...\n";
        
        $passages = [
            [
                'title' => 'The History of Universities',
                'content' => 'Universities have a long and distinguished history dating back to medieval times. The first universities were established in Europe during the 11th and 12th centuries. These institutions were originally created to train clergy and government officials. The University of Bologna, founded in 1088, is often considered the first university in the Western world. Oxford University, established around 1096, became one of the most prestigious institutions of higher learning. These early universities focused primarily on theology, law, and medicine. Over time, the curriculum expanded to include the liberal arts and sciences.',
                'questions' => [
                    'What is the main topic of the passage?',
                    'When were the first universities established?',
                    'Which university is considered the first in the Western world?',
                    'What subjects did early universities focus on?',
                    'According to the passage, Oxford University was established around',
                    'The word "distinguished" in line 1 is closest in meaning to',
                    'What can be inferred about early universities?',
                    'The passage suggests that university curricula',
                    'The word "prestigious" in line 5 means',
                    'According to the passage, universities were originally created to train'
                ]
            ],
            [
                'title' => 'Climate Change and Ocean Levels',
                'content' => 'Global climate change has become one of the most pressing environmental issues of our time. Rising temperatures caused by greenhouse gas emissions are leading to significant changes in ocean levels worldwide. As polar ice caps and glaciers melt, the additional water enters the oceans, causing sea levels to rise. This phenomenon poses serious threats to coastal communities and low-lying island nations. Scientists predict that sea levels could rise by several meters over the next century if current trends continue. The consequences would be devastating for millions of people living in coastal areas.',
                'questions' => [
                    'What is the main cause of rising ocean levels?',
                    'According to the passage, what happens when ice caps melt?',
                    'Who is most threatened by rising sea levels?',
                    'How much could sea levels rise according to scientists?',
                    'The word "pressing" in line 1 is closest in meaning to',
                    'What does the passage say about greenhouse gas emissions?',
                    'The word "phenomenon" in line 4 refers to',
                    'What can be inferred about coastal communities?',
                    'The word "devastating" in line 7 means',
                    'According to the passage, the consequences of rising sea levels would be'
                ]
            ],
            [
                'title' => 'The Development of Photography',
                'content' => 'Photography has undergone tremendous changes since its invention in the early 19th century. The first permanent photograph was created by Joseph Niépce in 1826 using a camera obscura and a pewter plate coated with bitumen. Louis Daguerre later improved the process, creating the daguerreotype in 1839. This method produced sharp, detailed images but required long exposure times. The invention of flexible film by George Eastman in the 1880s revolutionized photography, making it accessible to the general public. Digital photography, introduced in the late 20th century, has further transformed how we capture and share images.',
                'questions' => [
                    'When was the first permanent photograph created?',
                    'Who created the first permanent photograph?',
                    'What was the daguerreotype?',
                    'What was a disadvantage of the daguerreotype method?',
                    'Who invented flexible film?',
                    'How did flexible film change photography?',
                    'When was digital photography introduced?',
                    'The word "tremendous" in line 1 means',
                    'What can be inferred about early photography?',
                    'According to the passage, digital photography has'
                ]
            ],
            [
                'title' => 'Animal Communication',
                'content' => 'Animal communication is a fascinating field of study that reveals the complex ways creatures interact with each other. Different species have evolved various methods to convey information, including vocalizations, body language, chemical signals, and visual displays. Dolphins use echolocation and a sophisticated system of clicks and whistles to communicate with other members of their pod. Bees perform intricate dances to inform their hive mates about the location of food sources. Even plants communicate through chemical signals released into the air or soil. These communication systems are essential for survival, reproduction, and social organization.',
                'questions' => [
                    'What is the main topic of the passage?',
                    'How do dolphins communicate according to the passage?',
                    'What do bees use dances for?',
                    'How do plants communicate?',
                    'The word "sophisticated" in line 4 means',
                    'What are communication systems essential for?',
                    'The word "intricate" in line 5 is closest in meaning to',
                    'What can be inferred about animal communication?',
                    'According to the passage, different species have',
                    'The word "convey" in line 2 means'
                ]
            ],
            [
                'title' => 'The Impact of Technology on Education',
                'content' => 'Technology has dramatically transformed the educational landscape in recent decades. The introduction of computers, the internet, and mobile devices has created new opportunities for learning and teaching. Online courses and distance learning programs have made education more accessible to students worldwide. Interactive software and multimedia resources have enhanced the learning experience, allowing students to engage with content in innovative ways. However, the integration of technology in education also presents challenges, including the digital divide and concerns about screen time. Educators must carefully balance the benefits of technology with traditional teaching methods.',
                'questions' => [
                    'What has transformed education in recent decades?',
                    'How have online courses affected education?',
                    'What have interactive software and multimedia resources done?',
                    'What challenges does technology in education present?',
                    'The word "dramatically" in line 1 means',
                    'What does the passage say about the digital divide?',
                    'According to the passage, educators must',
                    'The word "innovative" in line 5 is closest in meaning to',
                    'What can be inferred about distance learning?',
                    'The word "integration" in line 6 means'
                ]
            ]
        ];

        foreach ($passages as $index => $passage) {
            $passageNum = $index + 1;
            
            // Create parent group (passage)
            $parent = Question::create([
                'simulation_set_id' => 1,
                'modul' => 'reading',
                'unit_number' => null,
                'question_text' => "Passage {$passageNum}: {$passage['title']}\n\n{$passage['content']}",
                'attachment' => null,
                'option_a' => null,
                'option_b' => null,
                'option_c' => null,
                'option_d' => null,
                'correct_option' => null,
                'explanation' => null,
                'order_number' => null,
                'group_id' => null,
            ]);
            
            $parent->update(['group_id' => $parent->id]);

            // Create 10 questions for each passage
            foreach ($passage['questions'] as $qIndex => $questionText) {
                Question::create([
                    'simulation_set_id' => 1,
                    'modul' => 'reading',
                    'unit_number' => null,
                    'question_text' => $questionText,
                    'attachment' => null,
                    'option_a' => 'Option A for reading question',
                    'option_b' => 'Option B for reading question',
                    'option_c' => 'Option C for reading question',
                    'option_d' => 'Option D for reading question',
                    'correct_option' => ['a', 'b', 'c', 'd'][rand(0, 3)],
                    'explanation' => 'Read the passage carefully and choose the best answer.',
                    'order_number' => $this->currentOrder++,
                    'group_id' => $parent->id,
                ]);
            }
        }

        echo "✓ Reading: 50 soal (5 passages × 10 questions each)\n";
    }
}