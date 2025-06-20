<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SkillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         $skills = [
            ['kategori' => 'Listening Comprehension', 'skill' => 'Identify gist of short and long conversations', 'deskripsi' => 'I can identify the gist/topic of short and longer conversations'],
            ['kategori' => 'Listening Comprehension', 'skill' => 'Explain advice in short conversations', 'deskripsi' => 'I can explain advice/suggestions given in short conversations'],
            ['kategori' => 'Listening Comprehension', 'skill' => 'Predict what the speaker will probably do next in short conversations', 'deskripsi' => 'I can predict what the speaker will probably do next in short conversations'],
            ['kategori' => 'Listening Comprehension', 'skill' => 'Use context to understand meaning in short conversations', 'deskripsi' => 'I can make use of context to understand meaning in short conversations'],
            ['kategori' => 'Listening Comprehension', 'skill' => 'Infer unstated details of short conversations', 'deskripsi' => 'I can infer unstated details of short conversations'],
            ['kategori' => 'Listening Comprehension', 'skill' => 'Identify stated details in longer conversations', 'deskripsi' => 'I can identify stated details in longer conversations'],
            ['kategori' => 'Listening Comprehension', 'skill' => 'Identify unstated details in longer conversations', 'deskripsi' => 'I can identify unstated details in longer conversations'],
            ['kategori' => 'Listening Comprehension', 'skill' => 'Identify gist in lectures', 'deskripsi' => 'I can identify the gist in lectures'],
            ['kategori' => 'Listening Comprehension', 'skill' => 'Identify stated details in lectures', 'deskripsi' => 'I can identify stated details in lectures'],
            ['kategori' => 'Listening Comprehension', 'skill' => 'Identify unstated details in lectures', 'deskripsi' => 'I can identify unstated details in lectures'],

            ['kategori' => 'Structure and Written Expression', 'skill' => 'Noun questions', 'deskripsi' => 'I can answer questions related to the most frequently asked noun questions in TOEFL ITP'],
            ['kategori' => 'Structure and Written Expression', 'skill' => 'Verb questions', 'deskripsi' => 'I can answer questions related to the most frequently asked verb questions in TOEFL ITP'],
            ['kategori' => 'Structure and Written Expression', 'skill' => 'Subject-Verb agreement', 'deskripsi' => 'I can answer questions related to the most frequently asked SV agreement questions in TOEFL ITP'],
            ['kategori' => 'Structure and Written Expression', 'skill' => 'Adjective and adverb questions', 'deskripsi' => 'I can answer questions related to the most frequently asked adjective and adverb questions in TOEFL ITP'],
            ['kategori' => 'Structure and Written Expression', 'skill' => 'Pronoun questions', 'deskripsi' => 'I can answer questions related to the most frequently asked pronoun questions in TOEFL ITP'],
            ['kategori' => 'Structure and Written Expression', 'skill' => 'Parallel structure questions', 'deskripsi' => 'I can answer questions related to the most frequently asked parallel structure questions in TOEFL ITP'],
            ['kategori' => 'Structure and Written Expression', 'skill' => 'Simple and compound sentence questions', 'deskripsi' => 'I can answer questions related to the most frequently asked simple and compound sentence questions in TOEFL ITP'],
            ['kategori' => 'Structure and Written Expression', 'skill' => 'Complex sentence questions', 'deskripsi' => 'I can answer questions related to the most frequently asked complex sentence questions in TOEFL ITP'],
            ['kategori' => 'Structure and Written Expression', 'skill' => 'Reduced clause questions', 'deskripsi' => 'I can answer questions related to the most frequently asked reduce clause questions in TOEFL ITP'],
            ['kategori' => 'Structure and Written Expression', 'skill' => 'Preposition and word-choice questions', 'deskripsi' => 'I can answer questions related to the most frequently asked preposition and word-choice questions in TOEFL ITP'],

            ['kategori' => 'Reading', 'skill' => 'Identify topic and main idea', 'deskripsi' => 'I can identify the topic of the passage and main idea of a paragraph'],
            ['kategori' => 'Reading', 'skill' => 'Explain explicit details', 'deskripsi' => 'I can explain central information and details explicitly given in the passage'],
            ['kategori' => 'Reading', 'skill' => 'Find referential relationship', 'deskripsi' => 'I can find the referential relationship questions'],
            ['kategori' => 'Reading', 'skill' => 'Literal equivalent meaning', 'deskripsi' => 'I can make use of context to understand literal equivalent of a word or phrase'],
            ['kategori' => 'Reading', 'skill' => 'Explain implicit details', 'deskripsi' => 'I can explain central information and details implicitly given in the passage'],
            ['kategori' => 'Reading', 'skill' => 'Analyze organizational structure', 'deskripsi' => 'I can analyze the organizational structure of a passage'],
        ];

        foreach ($skills as $skill) {
            $existing = DB::table('skill')->where([
                ['kategori', '=', $skill['kategori']],
                ['skill', '=', $skill['skill']]
            ])->first();

            if (!$existing) {
                DB::table('skill')->insert([
                    'kategori' => $skill['kategori'],
                    'skill' => $skill['skill'],
                    'deskripsi' => $skill['deskripsi'],
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }
        }
    }
}
