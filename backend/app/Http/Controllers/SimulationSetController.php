<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SimulationSet;
use App\Models\Simulation;

class SimulationSetController extends Controller
{
    public function index()
    {
        $sets = SimulationSet::withCount('questions')->get();
        return response()->json($sets);
    }

    public function show($id)
    {
        $set = SimulationSet::with(['questions' => function ($q) {
            $q->orderBy('modul')->orderBy('order_number');
        }])->findOrFail($id);

        return response()->json([
            'set' => $set,
            'questions' => $set->questions
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean'
        ]);

        $set = SimulationSet::create($data);

        return response()->json($set, 201);
    }

    public function update(Request $request, $id)
    {
        $set = SimulationSet::findOrFail($id);
        
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean'
        ]);

        $set->update($data);

        return response()->json($set);
    }

    //  UPDATED: Toggle aktivasi dengan pengecekan simulasi yang sedang berjalan
    public function toggleActive($id)
    {
        $set = SimulationSet::findOrFail($id);
        
        // 🔥 NEW: Cek apakah ada simulasi yang sedang berjalan untuk simulation set ini
        $runningSimulations = Simulation::where('simulation_set_id', $id)
            ->whereIn('status', ['in_progress_listening', 'in_progress_structure', 'in_progress_reading'])
            ->count();

        if ($runningSimulations > 0) {
            return response()->json([
                'success' => false,
                'message' => "Tidak dapat mengubah status aktivasi. Ada {$runningSimulations} sesi simulasi yang sedang berjalan.",
                'running_sessions' => $runningSimulations,
                'is_active' => $set->is_active
            ], 400);
        }

        // Jika tidak ada simulasi yang berjalan, boleh toggle
        $set->update([
            'is_active' => !$set->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => $set->is_active ? 'Simulasi diaktifkan' : 'Simulasi dinonaktifkan',
            'is_active' => $set->is_active,
            'simulation_set' => $set,
            'running_sessions' => 0
        ]);
    }

    // Get status aktivasi beserta info sesi yang berjalan
    public function getActivationStatus($id)
    {
        $set = SimulationSet::findOrFail($id);
        
        $runningSimulations = Simulation::where('simulation_set_id', $id)
            ->whereIn('status', ['in_progress_listening', 'in_progress_structure', 'in_progress_reading'])
            ->with(['user:idPengguna,name']) // Include user info for debugging
            ->get();

        return response()->json([
            'simulation_set' => $set,
            'is_active' => $set->is_active,
            'can_toggle' => $runningSimulations->count() === 0,
            'running_sessions' => $runningSimulations->count(),
            'running_simulations' => $runningSimulations->map(function($sim) {
                return [
                    'id' => $sim->id,
                    'user_name' => $sim->user->name ?? 'Unknown',
                    'status' => $sim->status,
                    'started_at' => $sim->started_at
                ];
            })
        ]);
    }

    // Get current active simulation untuk peserta
    public function getActiveSimulation()
    {
        $activeSet = SimulationSet::active()->first();

        if (!$activeSet) {
            return response()->json([
                'active_simulation' => null,
                'message' => 'Tidak ada simulasi yang aktif'
            ]);
        }

        return response()->json([
            'active_simulation' => $activeSet,
            'message' => 'Simulasi aktif ditemukan'
        ]);
    }

    public function destroy($id)
    {
        $set = SimulationSet::findOrFail($id);
        
        // Check if set has simulations
        if ($set->simulations()->exists()) {
            return response()->json([
                'error' => 'Tidak dapat menghapus simulation set yang sudah digunakan'
            ], 400);
        }

        $set->delete();

        return response()->json([
            'message' => 'Simulation set berhasil dihapus'
        ]);
    }
}