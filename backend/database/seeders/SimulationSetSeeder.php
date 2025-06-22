<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SimulationSetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('simulation_sets')->insert([
            'title' => 'Simulasi TOEFL ITP Set 1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}