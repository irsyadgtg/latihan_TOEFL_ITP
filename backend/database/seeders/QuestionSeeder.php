<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Data untuk semua questions berdasarkan skill mapping
        // TIDAK ADA UNIT 0 - hanya unit 1-10 untuk listening/structure, unit 1-6 untuk reading
        $questions = [
            // LISTENING COMPREHENSION QUESTIONS (Unit 1-10) - 20 soal
            
            // Unit 1 - Identify gist of conversations
            [
                'modul' => 'listening',
                'unit_number' => 1,
                'question_text' => 'What is the best strategy to identify the gist of a conversation?',
                'option_a' => 'Focus on specific details and numbers',
                'option_b' => 'Listen for the main topic and overall purpose',
                'option_c' => 'Memorize every word spoken',
                'option_d' => 'Pay attention only to the conclusion',
                'correct_option' => 'b',
                'explanation' => 'To identify gist, focus on the main topic and overall purpose rather than specific details',
                'order_number' => 1
            ],
            [
                'modul' => 'listening',
                'unit_number' => 1,
                'question_text' => 'In a conversation about course registration, what is likely the gist?',
                'option_a' => 'The exact time of classes',
                'option_b' => 'The process and requirements for enrolling in courses',
                'option_c' => 'The professor\'s teaching style',
                'option_d' => 'The location of the registrar\'s office',
                'correct_option' => 'b',
                'explanation' => 'The gist focuses on the main process being discussed, not specific details',
                'order_number' => 2
            ],
            
            // Unit 2 - Explain advice in short conversations
            [
                'modul' => 'listening',
                'unit_number' => 2,
                'question_text' => 'Which phrase typically signals advice in a conversation?',
                'option_a' => 'I think that...',
                'option_b' => 'You should...',
                'option_c' => 'Let me tell you...',
                'option_d' => 'I remember when...',
                'correct_option' => 'b',
                'explanation' => '"You should" is a direct way to give advice, along with other modal verbs like ought to, might want to',
                'order_number' => 1
            ],
            [
                'modul' => 'listening',
                'unit_number' => 2,
                'question_text' => 'If someone says "Why don\'t you talk to your advisor?", they are:',
                'option_a' => 'Asking for information',
                'option_b' => 'Giving advice or making a suggestion',
                'option_c' => 'Expressing confusion',
                'option_d' => 'Sharing their experience',
                'correct_option' => 'b',
                'explanation' => '"Why don\'t you..." is a common way to give advice or make suggestions in English',
                'order_number' => 2
            ],
            
            // Unit 3 - Predict speaker's next action
            [
                'modul' => 'listening',
                'unit_number' => 3,
                'question_text' => 'What helps predict what a speaker will do next?',
                'option_a' => 'Their past experiences only',
                'option_b' => 'The current problem and discussed solutions',
                'option_c' => 'The other speaker\'s preferences',
                'option_d' => 'Random guessing',
                'correct_option' => 'b',
                'explanation' => 'Context about current problems and solutions discussed helps predict future actions',
                'order_number' => 1
            ],
            [
                'modul' => 'listening',
                'unit_number' => 3,
                'question_text' => 'If a student says "I\'m going to check with the library about extending the loan period", what will they likely do next?',
                'option_a' => 'Return the book immediately',
                'option_b' => 'Buy the book instead',
                'option_c' => 'Go to the library to ask about extension',
                'option_d' => 'Ask a classmate for help',
                'correct_option' => 'c',
                'explanation' => 'The phrase "I\'m going to check with the library" clearly indicates their next intended action',
                'order_number' => 2
            ],
            
            // Unit 4 - Use context for meaning
            [
                'modul' => 'listening',
                'unit_number' => 4,
                'question_text' => 'What should you do when you hear an unfamiliar word in a conversation?',
                'option_a' => 'Stop listening and think about the word',
                'option_b' => 'Use surrounding context to understand the meaning',
                'option_c' => 'Ask the speaker to repeat',
                'option_d' => 'Give up on understanding',
                'correct_option' => 'b',
                'explanation' => 'Context clues from surrounding words and situation help understand unfamiliar vocabulary',
                'order_number' => 1
            ],
            [
                'modul' => 'listening',
                'unit_number' => 4,
                'question_text' => 'Context clues include all of the following EXCEPT:',
                'option_a' => 'The situation being discussed',
                'option_b' => 'The relationship between speakers',
                'option_c' => 'The exact pronunciation of words',
                'option_d' => 'The tone and emotion in speech',
                'correct_option' => 'c',
                'explanation' => 'Pronunciation doesn\'t provide context clues for meaning; situation, relationships, and tone do',
                'order_number' => 2
            ],
            
            // Unit 5 - Infer unstated details (short conversations)
            [
                'modul' => 'listening',
                'unit_number' => 5,
                'question_text' => 'Inferring unstated details requires:',
                'option_a' => 'Only listening to direct statements',
                'option_b' => 'Reading between the lines and understanding implications',
                'option_c' => 'Memorizing exact words',
                'option_d' => 'Focusing only on the beginning of conversations',
                'correct_option' => 'b',
                'explanation' => 'Inference involves understanding what is implied but not directly stated',
                'order_number' => 1
            ],
            [
                'modul' => 'listening',
                'unit_number' => 5,
                'question_text' => 'If someone says "I wish I had started studying earlier" with a worried tone, you can infer:',
                'option_a' => 'They are well-prepared for their exam',
                'option_b' => 'They feel unprepared and regret not studying sooner',
                'option_c' => 'They don\'t care about their studies',
                'option_d' => 'They have too much free time',
                'correct_option' => 'b',
                'explanation' => 'The phrase "I wish I had" expresses regret, and the worried tone suggests anxiety about preparation',
                'order_number' => 2
            ],
            
            // Unit 6 - Identify stated details in longer conversations
            [
                'modul' => 'listening',
                'unit_number' => 6,
                'question_text' => 'When taking notes during long conversations, you should focus on:',
                'option_a' => 'Every single word spoken',
                'option_b' => 'Only the speakers\' names',
                'option_c' => 'Key facts like names, numbers, dates, and locations',
                'option_d' => 'Only the conclusion of the conversation',
                'correct_option' => 'c',
                'explanation' => 'Effective note-taking focuses on key factual information that can be tested in detail questions',
                'order_number' => 1
            ],
            [
                'modul' => 'listening',
                'unit_number' => 6,
                'question_text' => 'Stated details in long conversations are usually:',
                'option_a' => 'Hidden and difficult to find',
                'option_b' => 'Clearly mentioned and directly stated',
                'option_c' => 'Only implied through context',
                'option_d' => 'Repeated multiple times only',
                'correct_option' => 'b',
                'explanation' => 'Stated details are explicit information that is clearly mentioned in the conversation',
                'order_number' => 2
            ],
            
            // Unit 7 - Identify unstated details in longer conversations
            [
                'modul' => 'listening',
                'unit_number' => 7,
                'question_text' => 'Unstated details in long conversations require you to:',
                'option_a' => 'Guess randomly based on topic',
                'option_b' => 'Only listen to what is directly said',
                'option_c' => 'Analyze implications and relationships between information',
                'option_d' => 'Focus only on the speakers\' emotions',
                'correct_option' => 'c',
                'explanation' => 'Unstated details require inference by analyzing relationships and implications between stated information',
                'order_number' => 1
            ],
            [
                'modul' => 'listening',
                'unit_number' => 7,
                'question_text' => 'If two students are discussing course schedules and one mentions "conflict", you can infer:',
                'option_a' => 'They are having an argument',
                'option_b' => 'There is a scheduling problem with overlapping classes',
                'option_c' => 'They disagree about professors',
                'option_d' => 'One student is confused about requirements',
                'correct_option' => 'b',
                'explanation' => 'In academic context, "conflict" typically refers to scheduling conflicts with overlapping times',
                'order_number' => 2
            ],
            
            // Unit 8 - Identify gist in lectures
            [
                'modul' => 'listening',
                'unit_number' => 8,
                'question_text' => 'The gist of an academic lecture is best found by listening for:',
                'option_a' => 'Specific examples only',
                'option_b' => 'The main topic and central theme',
                'option_c' => 'Technical vocabulary',
                'option_d' => 'Student questions during the lecture',
                'correct_option' => 'b',
                'explanation' => 'Lecture gist focuses on the main topic and central theme rather than specific details or examples',
                'order_number' => 1
            ],
            [
                'modul' => 'listening',
                'unit_number' => 8,
                'question_text' => 'Which part of a lecture usually contains the main idea?',
                'option_a' => 'Only the middle sections',
                'option_b' => 'Random parts throughout',
                'option_c' => 'The introduction and conclusion',
                'option_d' => 'Only when examples are given',
                'correct_option' => 'c',
                'explanation' => 'Lectures typically state the main idea in the introduction and reinforce it in the conclusion',
                'order_number' => 2
            ],
            
            // Unit 9 - Identify stated details in lectures
            [
                'modul' => 'listening',
                'unit_number' => 9,
                'question_text' => 'Stated details in lectures often include:',
                'option_a' => 'Only the professor\'s personal opinions',
                'option_b' => 'Dates, statistics, definitions, and examples',
                'option_c' => 'Students\' questions and comments',
                'option_d' => 'Implied meanings only',
                'correct_option' => 'b',
                'explanation' => 'Lectures contain explicit factual information like dates, statistics, definitions, and supporting examples',
                'order_number' => 1
            ],
            [
                'modul' => 'listening',
                'unit_number' => 9,
                'question_text' => 'When professors emphasize information by repeating it, they are usually:',
                'option_a' => 'Wasting time',
                'option_b' => 'Indicating important details that may be tested',
                'option_c' => 'Showing uncertainty about the topic',
                'option_d' => 'Trying to fill time in the lecture',
                'correct_option' => 'b',
                'explanation' => 'Repetition and emphasis typically signal important information that students should note',
                'order_number' => 2
            ],
            
            // Unit 10 - Identify unstated details in lectures
            [
                'modul' => 'listening',
                'unit_number' => 10,
                'question_text' => 'Unstated details in lectures require understanding:',
                'option_a' => 'Only what the professor directly states',
                'option_b' => 'The professor\'s attitudes, implications, and connections between concepts',
                'option_c' => 'Technical terms only',
                'option_d' => 'Student responses to questions',
                'correct_option' => 'b',
                'explanation' => 'Advanced inference involves understanding the professor\'s perspective, implied connections, and unstated conclusions',
                'order_number' => 1
            ],
            [
                'modul' => 'listening',
                'unit_number' => 10,
                'question_text' => 'When a professor uses an analogy in a lecture, the unstated purpose is usually to:',
                'option_a' => 'Entertain the students',
                'option_b' => 'Fill time in the class period',
                'option_c' => 'Help students understand a difficult concept by comparing it to something familiar',
                'option_d' => 'Show off their knowledge',
                'correct_option' => 'c',
                'explanation' => 'Analogies are used to clarify complex concepts by relating them to familiar ideas or experiences',
                'order_number' => 2
            ],

            // STRUCTURE AND WRITTEN EXPRESSION QUESTIONS (Unit 1-10) - 20 soal
            
            // Unit 1 - Noun questions
            [
                'modul' => 'structure',
                'unit_number' => 1,
                'question_text' => 'Which sentence contains a correct noun form?',
                'option_a' => 'The informations were helpful.',
                'option_b' => 'The information was helpful.',
                'option_c' => 'The information were helpful.',
                'option_d' => 'The informations was helpful.',
                'correct_option' => 'b',
                'explanation' => '"Information" is an uncountable noun, so it uses singular verb "was" and no plural form',
                'order_number' => 1
            ],
            [
                'modul' => 'structure',
                'unit_number' => 1,
                'question_text' => 'Identify the error: "The childrens\' toys were scattered around the room."',
                'option_a' => 'childrens\'',
                'option_b' => 'toys',
                'option_c' => 'were',
                'option_d' => 'scattered',
                'correct_option' => 'a',
                'explanation' => 'Correct form is "children\'s" - children is already plural, so no extra "s" before apostrophe',
                'order_number' => 2
            ],
            
            // Unit 2 - Verb questions
            [
                'modul' => 'structure',
                'unit_number' => 2,
                'question_text' => 'Choose the correct verb form: "She _____ to the conference next week."',
                'option_a' => 'will go',
                'option_b' => 'will goes',
                'option_c' => 'going',
                'option_d' => 'go',
                'correct_option' => 'a',
                'explanation' => 'Future tense requires "will" + base form of verb (go), not "will goes"',
                'order_number' => 1
            ],
            [
                'modul' => 'structure',
                'unit_number' => 2,
                'question_text' => 'Which sentence uses the correct passive voice?',
                'option_a' => 'The report was wrote by the student.',
                'option_b' => 'The report was written by the student.',
                'option_c' => 'The report was writing by the student.',
                'option_d' => 'The report was write by the student.',
                'correct_option' => 'b',
                'explanation' => 'Passive voice uses "was/were" + past participle; "written" is the past participle of "write"',
                'order_number' => 2
            ],
            
            // Unit 3 - Subject-Verb agreement
            [
                'modul' => 'structure',
                'unit_number' => 3,
                'question_text' => 'Choose the correct verb: "Each of the students _____ responsible for their own project."',
                'option_a' => 'are',
                'option_b' => 'is',
                'option_c' => 'were',
                'option_d' => 'have been',
                'correct_option' => 'b',
                'explanation' => '"Each" is singular, so it requires the singular verb "is", regardless of the plural noun following "of"',
                'order_number' => 1
            ],
            [
                'modul' => 'structure',
                'unit_number' => 3,
                'question_text' => 'Identify the error: "The team of researchers have published their findings."',
                'option_a' => 'team',
                'option_b' => 'researchers',
                'option_c' => 'have',
                'option_d' => 'findings',
                'correct_option' => 'c',
                'explanation' => '"Team" is a collective noun treated as singular, so it should be "has published", not "have"',
                'order_number' => 2
            ],
            
            // Unit 4 - Adjective and adverb questions
            [
                'modul' => 'structure',
                'unit_number' => 4,
                'question_text' => 'Choose the correct form: "She speaks English _____ than her brother."',
                'option_a' => 'more fluent',
                'option_b' => 'more fluently',
                'option_c' => 'most fluent',
                'option_d' => 'most fluently',
                'correct_option' => 'b',
                'explanation' => 'Use adverb "fluently" to modify verb "speaks", and "more" for comparative form',
                'order_number' => 1
            ],
            [
                'modul' => 'structure',
                'unit_number' => 4,
                'question_text' => 'Identify the error: "The students performed very good on the exam."',
                'option_a' => 'students',
                'option_b' => 'performed',
                'option_c' => 'good',
                'option_d' => 'exam',
                'correct_option' => 'c',
                'explanation' => 'Should be "well" (adverb) to modify the verb "performed", not "good" (adjective)',
                'order_number' => 2
            ],
            
            // Unit 5 - Pronoun questions
            [
                'modul' => 'structure',
                'unit_number' => 5,
                'question_text' => 'Choose the correct pronoun: "Between you and _____, I think the test was difficult."',
                'option_a' => 'I',
                'option_b' => 'me',
                'option_c' => 'myself',
                'option_d' => 'mine',
                'correct_option' => 'b',
                'explanation' => 'After preposition "between", use object pronoun "me", not subject pronoun "I"',
                'order_number' => 1
            ],
            [
                'modul' => 'structure',
                'unit_number' => 5,
                'question_text' => 'Identify the error: "The book who I borrowed from the library is very interesting."',
                'option_a' => 'book',
                'option_b' => 'who',
                'option_c' => 'borrowed',
                'option_d' => 'interesting',
                'correct_option' => 'b',
                'explanation' => 'Use "which" or "that" for things; "who" is only for people',
                'order_number' => 2
            ],
            
            // Unit 6 - Parallel structure questions
            [
                'modul' => 'structure',
                'unit_number' => 6,
                'question_text' => 'Choose the correct parallel structure: "She enjoys reading, writing, and _____."',
                'option_a' => 'to paint',
                'option_b' => 'painting',
                'option_c' => 'paint',
                'option_d' => 'painted',
                'correct_option' => 'b',
                'explanation' => 'Maintain parallel structure with gerunds: reading, writing, painting',
                'order_number' => 1
            ],
            [
                'modul' => 'structure',
                'unit_number' => 6,
                'question_text' => 'Identify the error: "The workshop was both informative and it was inspiring."',
                'option_a' => 'workshop',
                'option_b' => 'both',
                'option_c' => 'and it was',
                'option_d' => 'inspiring',
                'correct_option' => 'c',
                'explanation' => 'Should be "both informative and inspiring" - parallel adjective forms after "both...and"',
                'order_number' => 2
            ],
            
            // Unit 7 - Simple and compound sentence questions
            [
                'modul' => 'structure',
                'unit_number' => 7,
                'question_text' => 'Which coordinating conjunction correctly joins these ideas: "The weather was cold _____ we decided to go hiking anyway."',
                'option_a' => 'and',
                'option_b' => 'but',
                'option_c' => 'or',
                'option_d' => 'so',
                'correct_option' => 'b',
                'explanation' => '"But" shows contrast between cold weather and the decision to hike anyway',
                'order_number' => 1
            ],
            [
                'modul' => 'structure',
                'unit_number' => 7,
                'question_text' => 'Identify the error: "I studied hard for the exam, I still didn\'t pass."',
                'option_a' => 'studied',
                'option_b' => 'hard',
                'option_c' => 'the comma',
                'option_d' => 'didn\'t',
                'correct_option' => 'c',
                'explanation' => 'This is a comma splice; should use "but" or semicolon to join independent clauses',
                'order_number' => 2
            ],
            
            // Unit 8 - Complex sentence questions
            [
                'modul' => 'structure',
                'unit_number' => 8,
                'question_text' => 'Choose the correct subordinating conjunction: "_____ it was raining, we postponed the picnic."',
                'option_a' => 'Although',
                'option_b' => 'Because',
                'option_c' => 'Unless',
                'option_d' => 'While',
                'correct_option' => 'b',
                'explanation' => '"Because" shows cause-effect relationship: rain caused postponement',
                'order_number' => 1
            ],
            [
                'modul' => 'structure',
                'unit_number' => 8,
                'question_text' => 'Identify the error: "The professor explained the concept, which students understood it clearly."',
                'option_a' => 'professor',
                'option_b' => 'explained',
                'option_c' => 'which',
                'option_d' => 'it',
                'correct_option' => 'd',
                'explanation' => 'Remove "it" - the relative pronoun "which" already represents the object; don\'t repeat it',
                'order_number' => 2
            ],
            
            // Unit 9 - Reduced clause questions
            [
                'modul' => 'structure',
                'unit_number' => 9,
                'question_text' => 'Choose the correct reduced clause: "_____ by the loud noise, the baby started crying."',
                'option_a' => 'Disturbing',
                'option_b' => 'Disturbed',
                'option_c' => 'To disturb',
                'option_d' => 'Disturb',
                'correct_option' => 'b',
                'explanation' => 'Use past participle "disturbed" for passive meaning - the baby was disturbed by the noise',
                'order_number' => 1
            ],
            [
                'modul' => 'structure',
                'unit_number' => 9,
                'question_text' => 'Identify the error: "Walking to school, the rain started falling heavily."',
                'option_a' => 'Walking',
                'option_b' => 'to school',
                'option_c' => 'rain started',
                'option_d' => 'heavily',
                'correct_option' => 'a',
                'explanation' => 'Dangling modifier - "walking" seems to modify "rain"; should specify who was walking',
                'order_number' => 2
            ],
            
            // Unit 10 - Preposition and word-choice questions
            [
                'modul' => 'structure',
                'unit_number' => 10,
                'question_text' => 'Choose the correct preposition: "She is interested _____ learning foreign languages."',
                'option_a' => 'in',
                'option_b' => 'on',
                'option_c' => 'at',
                'option_d' => 'for',
                'correct_option' => 'a',
                'explanation' => '"Interested in" is the correct prepositional phrase for expressing interest in something',
                'order_number' => 1
            ],
            [
                'modul' => 'structure',
                'unit_number' => 10,
                'question_text' => 'Identify the error: "The economic situation has a great affect on employment rates."',
                'option_a' => 'economic',
                'option_b' => 'great',
                'option_c' => 'affect',
                'option_d' => 'employment',
                'correct_option' => 'c',
                'explanation' => 'Should be "effect" (noun); "affect" is a verb, "effect" is a noun',
                'order_number' => 2
            ],

            // READING COMPREHENSION QUESTIONS (Unit 1-6) - 12 soal
            
            // Unit 1 - Identify topic and main idea
            [
                'modul' => 'reading',
                'unit_number' => 1,
                'question_text' => 'The main idea of a passage is:',
                'option_a' => 'The first sentence of each paragraph',
                'option_b' => 'The central point the author wants to communicate',
                'option_c' => 'The most interesting detail mentioned',
                'option_d' => 'The conclusion of the passage only',
                'correct_option' => 'b',
                'explanation' => 'The main idea is the central point or thesis that the author wants to communicate throughout the passage',
                'order_number' => 1
            ],
            [
                'modul' => 'reading',
                'unit_number' => 1,
                'question_text' => 'Where is the main idea most commonly found?',
                'option_a' => 'Only in the first paragraph',
                'option_b' => 'Only in the last paragraph',
                'option_c' => 'In the first or last paragraph, sometimes both',
                'option_d' => 'Scattered throughout the passage randomly',
                'correct_option' => 'c',
                'explanation' => 'Main ideas are typically stated in the introduction and/or conclusion, though sometimes implied throughout',
                'order_number' => 2
            ],
            
            // Unit 2 - Explain explicit details
            [
                'modul' => 'reading',
                'unit_number' => 2,
                'question_text' => 'Explicit details in a passage are:',
                'option_a' => 'Information that must be inferred',
                'option_b' => 'Information clearly stated in the text',
                'option_c' => 'The author\'s personal opinions',
                'option_d' => 'Background knowledge required',
                'correct_option' => 'b',
                'explanation' => 'Explicit details are information that is clearly and directly stated in the text',
                'order_number' => 1
            ],
            [
                'modul' => 'reading',
                'unit_number' => 2,
                'question_text' => 'The best strategy for finding explicit details is:',
                'option_a' => 'Reading the entire passage slowly',
                'option_b' => 'Scanning for key words from the question',
                'option_c' => 'Memorizing the first paragraph',
                'option_d' => 'Guessing based on the topic',
                'correct_option' => 'b',
                'explanation' => 'Scanning for key words from the question helps locate explicit details quickly and accurately',
                'order_number' => 2
            ],
            
            // Unit 3 - Find referential relationship
            [
                'modul' => 'reading',
                'unit_number' => 3,
                'question_text' => 'Referential relationship questions ask about:',
                'option_a' => 'The main idea of paragraphs',
                'option_b' => 'What pronouns and referring expressions point to',
                'option_c' => 'The author\'s opinion',
                'option_d' => 'Vocabulary definitions',
                'correct_option' => 'b',
                'explanation' => 'Referential questions test understanding of what pronouns and other referring words refer to',
                'order_number' => 1
            ],
            [
                'modul' => 'reading',
                'unit_number' => 3,
                'question_text' => 'To find what "this" refers to, you should:',
                'option_a' => 'Look at the next sentence only',
                'option_b' => 'Guess based on the topic',
                'option_c' => 'Look back to previous sentences for the antecedent',
                'option_d' => 'Skip the question',
                'correct_option' => 'c',
                'explanation' => 'Demonstratives like "this" typically refer back to previously mentioned ideas or concepts',
                'order_number' => 2
            ],
            
            // Unit 4 - Literal equivalent meaning
            [
                'modul' => 'reading',
                'unit_number' => 4,
                'question_text' => 'When you encounter an unfamiliar word, context clues can help you understand:',
                'option_a' => 'The exact dictionary definition',
                'option_b' => 'The approximate meaning in that specific context',
                'option_c' => 'The word\'s etymology',
                'option_d' => 'How to spell the word correctly',
                'correct_option' => 'b',
                'explanation' => 'Context clues help determine the approximate meaning of words as used in specific situations',
                'order_number' => 1
            ],
            [
                'modul' => 'reading',
                'unit_number' => 4,
                'question_text' => 'Which is NOT a common type of context clue?',
                'option_a' => 'Definition or explanation',
                'option_b' => 'Examples given in the text',
                'option_c' => 'The length of the word',
                'option_d' => 'Contrast with opposite ideas',
                'correct_option' => 'c',
                'explanation' => 'Word length doesn\'t provide meaning clues; definitions, examples, and contrasts do',
                'order_number' => 2
            ],
            
            // Unit 5 - Explain implicit details
            [
                'modul' => 'reading',
                'unit_number' => 5,
                'question_text' => 'Implicit details require readers to:',
                'option_a' => 'Only read what is directly stated',
                'option_b' => 'Make logical inferences based on given information',
                'option_c' => 'Guess without any evidence',
                'option_d' => 'Use only background knowledge',
                'correct_option' => 'b',
                'explanation' => 'Implicit details are understood through logical inferences drawn from explicitly stated information',
                'order_number' => 1
            ],
            [
                'modul' => 'reading',
                'unit_number' => 5,
                'question_text' => 'If a passage mentions "the devastating effects were felt for decades," you can infer:',
                'option_a' => 'The effects were positive',
                'option_b' => 'The effects were severe and long-lasting',
                'option_c' => 'The effects lasted only a short time',
                'option_d' => 'There were no real effects',
                'correct_option' => 'b',
                'explanation' => '"Devastating" implies severe damage, and "decades" indicates long duration',
                'order_number' => 2
            ],
            
            // Unit 6 - Analyze organizational structure
            [
                'modul' => 'reading',
                'unit_number' => 6,
                'question_text' => 'Understanding organizational structure helps readers:',
                'option_a' => 'Memorize specific details better',
                'option_b' => 'Follow the author\'s logic and anticipate content',
                'option_c' => 'Find grammar errors in the text',
                'option_d' => 'Count the number of paragraphs',
                'correct_option' => 'b',
                'explanation' => 'Recognizing organization patterns helps readers follow the author\'s reasoning and predict upcoming content',
                'order_number' => 1
            ],
            [
                'modul' => 'reading',
                'unit_number' => 6,
                'question_text' => 'A passage that discusses "causes of pollution" followed by "effects of pollution" uses which organizational pattern?',
                'option_a' => 'Chronological order',
                'option_b' => 'Compare and contrast',
                'option_c' => 'Cause and effect',
                'option_d' => 'Classification',
                'correct_option' => 'c',
                'explanation' => 'Discussing causes followed by effects clearly demonstrates cause-and-effect organizational structure',
                'order_number' => 2
            ]
        ];

        // Insert questions
        foreach ($questions as $questionData) {
            $questionData['simulation_set_id'] = null; // Quiz latihan, bukan simulasi
            $questionData['group_id'] = null;
            $questionData['attachment'] = null;
            $questionData['created_at'] = Carbon::now();
            $questionData['updated_at'] = Carbon::now();
            
            // Check if question already exists
            $existing = DB::table('questions')->where([
                ['modul', '=', $questionData['modul']],
                ['unit_number', '=', $questionData['unit_number']],
                ['order_number', '=', $questionData['order_number']],
                ['question_text', '=', $questionData['question_text']]
            ])->first();

            if (!$existing) {
                DB::table('questions')->insert($questionData);
                echo "Created question: {$questionData['modul']} Unit {$questionData['unit_number']} Q{$questionData['order_number']}\n";
            } else {
                echo "Question already exists: {$questionData['modul']} Unit {$questionData['unit_number']} Q{$questionData['order_number']}\n";
            }
        }

        echo "\nQuestion seeding completed!\n";
        echo "Total questions created: " . count($questions) . "\n";
        echo "Listening Units 1-10: " . count(array_filter($questions, fn($q) => $q['modul'] === 'listening')) . " questions\n";
        echo "Structure Units 1-10: " . count(array_filter($questions, fn($q) => $q['modul'] === 'structure')) . " questions\n";
        echo "Reading Units 1-6: " . count(array_filter($questions, fn($q) => $q['modul'] === 'reading')) . " questions\n";
        echo "Note: Unit 0 (Overview) has NO quiz questions - only study material\n";
    }
}