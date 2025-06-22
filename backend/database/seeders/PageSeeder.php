<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Data untuk semua pages berdasarkan skill mapping
        $pages = [
            // LISTENING COMPREHENSION PAGES (Unit 0-10)
            [
                'modul' => 'listening',
                'unit_number' => 0,
                'order_number' => 1,
                'title' => 'TOEFL ITP Listening Overview',
                'description' => 'Pengenalan umum TOEFL ITP Listening Comprehension: struktur test, jenis pertanyaan, strategi dasar, dan tips sukses menghadapi 50 soal dalam 35 menit.'
            ],
            
            // Unit 1 - Skill: Identify gist of short and long conversations
            [
                'modul' => 'listening',
                'unit_number' => 1,
                'order_number' => 1,
                'title' => 'Identifying Gist of Conversations',
                'description' => 'Mempelajari cara mengidentifikasi gist/topik utama dalam percakapan pendek dan panjang. Fokus pada ide pokok, bukan detail spesifik. Teknik: dengarkan kata kunci, pahami konteks umum, abaikan informasi yang tidak relevan.'
            ],
            
            // Unit 2 - Skill: Explain advice in short conversations  
            [
                'modul' => 'listening',
                'unit_number' => 2,
                'order_number' => 1,
                'title' => 'Understanding Advice in Short Conversations',
                'description' => 'Menjelaskan saran dan nasihat yang diberikan dalam percakapan pendek. Mengenali frasa advice: should, ought to, why don\'t you, how about, I suggest. Memahami maksud pembicara saat memberikan rekomendasi eksplisit dan implisit.'
            ],
            
            // Unit 3 - Skill: Predict what the speaker will probably do next
            [
                'modul' => 'listening',
                'unit_number' => 3,
                'order_number' => 1,
                'title' => 'Predicting Speaker\'s Next Actions',
                'description' => 'Memprediksi tindakan yang akan dilakukan pembicara selanjutnya berdasarkan konteks percakapan. Menganalisis masalah, solusi yang dibahas, dan ekspresi intention: I\'m going to, I\'ll, I plan to. Menggunakan logical reasoning.'
            ],
            
            // Unit 4 - Skill: Use context to understand meaning
            [
                'modul' => 'listening',
                'unit_number' => 4,
                'order_number' => 1,
                'title' => 'Using Context for Meaning',
                'description' => 'Menggunakan konteks untuk memahami makna dalam percakapan pendek. Memanfaatkan contextual clues: situasi, hubungan antar pembicara, tone, kata-kata sekitar. Strategi memahami vocabulary asing melalui konteks.'
            ],
            
            // Unit 5 - Skill: Infer unstated details of short conversations
            [
                'modul' => 'listening',
                'unit_number' => 5,
                'order_number' => 1,
                'title' => 'Inferring Unstated Details in Short Conversations',
                'description' => 'Menyimpulkan detail yang tidak disebutkan secara eksplisit dalam percakapan pendek. Reading between the lines: memahami implied meaning, attitude, emotions. Menggunakan tone, stress, intonation sebagai petunjuk.'
            ],
            
            // Unit 6 - Skill: Identify stated details in longer conversations
            [
                'modul' => 'listening',
                'unit_number' => 6,
                'order_number' => 1,
                'title' => 'Identifying Stated Details in Long Conversations',
                'description' => 'Mengidentifikasi detail eksplisit dalam percakapan panjang. Teknik note-taking: mencatat facts, numbers, names, dates, locations. Fokus pada informasi factual yang disebutkan langsung. Organisasi notes: who, what, when, where, why, how.'
            ],
            
            // Unit 7 - Skill: Identify unstated details in longer conversations
            [
                'modul' => 'listening',
                'unit_number' => 7,
                'order_number' => 1,
                'title' => 'Identifying Unstated Details in Long Conversations',
                'description' => 'Mengidentifikasi detail implisit dalam percakapan panjang. Menganalisis deeper meaning: motivasi pembicara, relationship dynamics, unspoken assumptions. Menggabungkan multiple pieces of information untuk draw conclusions.'
            ],
            
            // Unit 8 - Skill: Identify gist in lectures
            [
                'modul' => 'listening',
                'unit_number' => 8,
                'order_number' => 1,
                'title' => 'Identifying Gist in Academic Lectures',
                'description' => 'Mengidentifikasi gist dalam lecture akademik. Fokus pada main topic, thesis statement, central theme. Memperhatikan introduction dan conclusion. Mengenali discourse markers: today we\'ll discuss, the main point is, in summary.'
            ],
            
            // Unit 9 - Skill: Identify stated details in lectures
            [
                'modul' => 'listening',
                'unit_number' => 9,
                'order_number' => 1,
                'title' => 'Identifying Stated Details in Lectures',
                'description' => 'Mengidentifikasi detail eksplisit dalam lecture akademik. Active listening untuk specific information: dates, statistics, definitions, examples. Note-taking strategy dengan outline format. Mengenali emphasis dan repetition sebagai clues.'
            ],
            
            // Unit 10 - Skill: Identify unstated details in lectures
            [
                'modul' => 'listening',
                'unit_number' => 10,
                'order_number' => 1,
                'title' => 'Identifying Unstated Details in Lectures',
                'description' => 'Mengidentifikasi detail implisit dalam lecture akademik. Advanced inference: professor\'s attitude, bias, assumptions, implied connections antar konsep. Memahami implications dari examples dan analogies yang diberikan.'
            ],

            // STRUCTURE AND WRITTEN EXPRESSION PAGES (Unit 0-10)
            [
                'modul' => 'structure',
                'unit_number' => 0,
                'order_number' => 1,
                'title' => 'TOEFL ITP Structure Overview',
                'description' => 'Pengenalan Structure and Written Expression: 40 soal dalam 25 menit. Part A (15 soal structure completion), Part B (25 soal error identification). Strategi umum dan tips menghadapi grammar questions.'
            ],
            
            // Unit 1 - Skill: Noun questions
            [
                'modul' => 'structure',
                'unit_number' => 1,
                'order_number' => 1,
                'title' => 'Noun Questions in TOEFL ITP',
                'description' => 'Menguasai pertanyaan tentang noun yang paling sering muncul dalam TOEFL ITP. Memahami noun forms, countable/uncountable nouns, possessive forms, dan noun functions dalam kalimat. Identifying errors terkait noun usage.'
            ],
            
            // Unit 2 - Skill: Verb questions
            [
                'modul' => 'structure',
                'unit_number' => 2,
                'order_number' => 1,
                'title' => 'Verb Questions in TOEFL ITP',
                'description' => 'Menguasai pertanyaan tentang verb yang paling sering muncul dalam TOEFL ITP. Verb tenses, verb forms, modal verbs, passive voice, dan conditional sentences. Identifying common verb errors dan correct usage.'
            ],
            
            // Unit 3 - Skill: Subject-Verb agreement
            [
                'modul' => 'structure',
                'unit_number' => 3,
                'order_number' => 1,
                'title' => 'Subject-Verb Agreement',
                'description' => 'Menguasai Subject-Verb agreement yang paling sering diuji dalam TOEFL ITP. Rules untuk singular/plural subjects, collective nouns, indefinite pronouns, compound subjects. Identifying agreement errors dalam complex sentences.'
            ],
            
            // Unit 4 - Skill: Adjective and adverb questions
            [
                'modul' => 'structure',
                'unit_number' => 4,
                'order_number' => 1,
                'title' => 'Adjective and Adverb Questions',
                'description' => 'Menguasai pertanyaan adjective dan adverb yang paling sering muncul dalam TOEFL ITP. Comparative/superlative forms, adjective order, adverb placement, dan distinguishing adjectives vs adverbs. Common usage errors.'
            ],
            
            // Unit 5 - Skill: Pronoun questions
            [
                'modul' => 'structure',
                'unit_number' => 5,
                'order_number' => 1,
                'title' => 'Pronoun Questions in TOEFL ITP',
                'description' => 'Menguasai pertanyaan pronoun yang paling sering muncul dalam TOEFL ITP. Personal pronouns, possessive pronouns, reflexive pronouns, relative pronouns. Pronoun reference dan agreement problems.'
            ],
            
            // Unit 6 - Skill: Parallel structure questions
            [
                'modul' => 'structure',
                'unit_number' => 6,
                'order_number' => 1,
                'title' => 'Parallel Structure Questions',
                'description' => 'Menguasai parallel structure yang paling sering diuji dalam TOEFL ITP. Parallelism dalam series, comparisons, correlative conjunctions (both...and, either...or). Identifying dan correcting parallelism errors.'
            ],
            
            // Unit 7 - Skill: Simple and compound sentence questions
            [
                'modul' => 'structure',
                'unit_number' => 7,
                'order_number' => 1,
                'title' => 'Simple and Compound Sentences',
                'description' => 'Menguasai pertanyaan tentang simple dan compound sentences yang paling sering muncul dalam TOEFL ITP. Coordinating conjunctions, sentence combining, punctuation rules. Avoiding run-on sentences dan fragments.'
            ],
            
            // Unit 8 - Skill: Complex sentence questions
            [
                'modul' => 'structure',
                'unit_number' => 8,
                'order_number' => 1,
                'title' => 'Complex Sentence Questions',
                'description' => 'Menguasai pertanyaan complex sentences yang paling sering muncul dalam TOEFL ITP. Subordinating conjunctions, dependent clauses, relative clauses. Proper clause connection dan avoiding sentence fragments.'
            ],
            
            // Unit 9 - Skill: Reduced clause questions
            [
                'modul' => 'structure',
                'unit_number' => 9,
                'order_number' => 1,
                'title' => 'Reduced Clause Questions',
                'description' => 'Menguasai pertanyaan reduced clauses yang paling sering muncul dalam TOEFL ITP. Participial phrases, infinitive phrases, appositives. Reducing adjective clauses dan adverb clauses correctly.'
            ],
            
            // Unit 10 - Skill: Preposition and word-choice questions
            [
                'modul' => 'structure',
                'unit_number' => 10,
                'order_number' => 1,
                'title' => 'Preposition and Word Choice Questions',
                'description' => 'Menguasai pertanyaan preposition dan word choice yang paling sering muncul dalam TOEFL ITP. Prepositional phrases, phrasal verbs, idiomatic expressions. Common preposition errors dan word form confusion.'
            ],

            // READING COMPREHENSION PAGES (Unit 0-6)
            [
                'modul' => 'reading',
                'unit_number' => 0,
                'order_number' => 1,
                'title' => 'TOEFL ITP Reading Overview',
                'description' => 'Pengenalan Reading Comprehension: 50 soal dalam 55 menit. 4-5 passages dengan berbagai topik akademik. Jenis pertanyaan: main idea, detail, vocabulary, inference, organization. Strategi reading dan time management.'
            ],
            
            // Unit 1 - Skill: Identify topic and main idea
            [
                'modul' => 'reading',
                'unit_number' => 1,
                'order_number' => 1,
                'title' => 'Identifying Topic and Main Ideas',
                'description' => 'Mengidentifikasi topic dan main idea dalam academic passages. Membedakan antara topic (what the passage is about) dan main idea (what the author says about the topic). Strategies untuk menemukan thesis statement dan controlling ideas.'
            ],
            
            // Unit 2 - Skill: Explain explicit details
            [
                'modul' => 'reading',
                'unit_number' => 2,
                'order_number' => 1,
                'title' => 'Understanding Explicit Details',
                'description' => 'Menjelaskan central information dan details yang explicitly given dalam passage. Scanning techniques untuk menemukan specific information. Distinguishing between main information dan supporting details yang tersurat jelas.'
            ],
            
            // Unit 3 - Skill: Find referential relationship
            [
                'modul' => 'reading',
                'unit_number' => 3,
                'order_number' => 1,
                'title' => 'Finding Referential Relationships',
                'description' => 'Menemukan referential relationship questions dalam reading passages. Memahami pronoun references, demonstratives (this, that, these, those), dan other referring expressions. Tracking antecedents across sentences dan paragraphs.'
            ],
            
            // Unit 4 - Skill: Literal equivalent meaning
            [
                'modul' => 'reading',
                'unit_number' => 4,
                'order_number' => 1,
                'title' => 'Understanding Vocabulary in Context',
                'description' => 'Menggunakan context untuk memahami literal equivalent meaning dari word atau phrase. Context clues strategies: definition, example, contrast, cause-effect. Determining word meaning tanpa kamus melalui surrounding text.'
            ],
            
            // Unit 5 - Skill: Explain implicit details
            [
                'modul' => 'reading',
                'unit_number' => 5,
                'order_number' => 1,
                'title' => 'Understanding Implicit Details',
                'description' => 'Menjelaskan central information dan details yang implicitly given dalam passage. Making inferences dari available information. Reading between the lines untuk understand implied meanings dan unstated conclusions.'
            ],
            
            // Unit 6 - Skill: Analyze organizational structure
            [
                'modul' => 'reading',
                'unit_number' => 6,
                'order_number' => 1,
                'title' => 'Analyzing Organizational Structure',
                'description' => 'Menganalisis organizational structure dari academic passage. Recognizing common patterns: chronological, cause-effect, compare-contrast, problem-solution, classification. Understanding how organization affects meaning dan supports main ideas.'
            ]
        ];

        // Insert atau update pages
        foreach ($pages as $pageData) {
            $pageData['created_at'] = Carbon::now();
            $pageData['updated_at'] = Carbon::now();
            
            // Check if page already exists
            $existing = DB::table('pages')->where([
                ['modul', '=', $pageData['modul']],
                ['unit_number', '=', $pageData['unit_number']],
                ['order_number', '=', $pageData['order_number']]
            ])->first();

            if (!$existing) {
                DB::table('pages')->insert($pageData);
                echo "Created page: {$pageData['modul']} Unit {$pageData['unit_number']} - {$pageData['title']}\n";
            } else {
                echo "Page already exists: {$pageData['modul']} Unit {$pageData['unit_number']} - {$pageData['title']}\n";
            }
        }

        echo "\nPage seeding completed!\n";
        echo "Total pages: " . count($pages) . "\n";
        echo "Listening: 11 pages (Unit 0-10)\n";
        echo "Structure: 11 pages (Unit 0-10)\n"; 
        echo "Reading: 7 pages (Unit 0-6)\n";
    }
}