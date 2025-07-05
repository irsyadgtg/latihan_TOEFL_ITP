<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Message;
use App\Models\Pengguna;
use App\Models\Page;
use App\Models\UserProgress;
use App\Models\Notification;
use App\Http\Controllers\UnitAccessController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ConsultationController extends Controller
{
    /**
     * Helper: Check if user has package with konsultasi access and active learning plan
     */
    private function checkKonsultasiAccess()
    {
        $user = Auth::user();

        if ($user->role !== 'peserta') {
            return ['allowed' => true, 'reason' => null]; // Instruktur bebas akses
        }

        // 1. Cek paket aktif
        $pesertaPaket = $user->peserta->pesertaPaket()->where('paketSaatIni', true)->first();
        if (!$pesertaPaket || !$pesertaPaket->paket) {
            return [
                'allowed' => false,
                'reason' => 'Tidak ada paket aktif',
                'action_needed' => 'upgrade_package',
                'message' => 'Anda belum memiliki paket kursus yang aktif. Silakan berlangganan paket yang menyediakan fasilitas konsultasi.'
            ];
        }

        // 2. Cek fasilitas konsultasi di paket
        if (strpos(strtolower($pesertaPaket->paket->fasilitas), 'konsultasi') === false) {
            return [
                'allowed' => false,
                'reason' => 'Paket Anda tidak memiliki akses konsultasi',
                'action_needed' => 'upgrade_package',
                'message' => 'Paket kursus Anda saat ini belum menyediakan fasilitas konsultasi. Upgrade ke paket Premium untuk mendapatkan akses konsultasi dengan instruktur.',
                'current_package' => $pesertaPaket->paket->namaPaket,
                'package_facilities' => $pesertaPaket->paket->fasilitas
            ];
        }

        // 3. Cek rencana belajar aktif
        $unitAccessController = new \App\Http\Controllers\UnitAccessController();
        $unlockedResponse = $unitAccessController->getUnlockedUnits(request());
        $unlockedData = $unlockedResponse->getData(true);

        if (!$unlockedData['has_active_feedback']) {
            return [
                'allowed' => false,
                'reason' => 'Belum ada rencana belajar aktif untuk konsultasi',
                'action_needed' => 'create_learning_plan',
                'message' => 'Silakan buat rencana belajar terlebih dahulu untuk dapat mengakses fitur konsultasi.',
                'current_package' => $pesertaPaket->paket->namaPaket
            ];
        }

        return ['allowed' => true, 'reason' => null];
    }

    /**
     * NEW METHOD: Check consultation access for frontend
     * TAMBAHKAN METHOD INI di dalam class ConsultationController
     */
    public function checkConsultationAccess()
    {
        try {
            $accessCheck = $this->checkKonsultasiAccess();

            return response()->json([
                'has_access' => $accessCheck['allowed'],
                'reason' => $accessCheck['reason'] ?? null,
                'action_needed' => $accessCheck['action_needed'] ?? null,
                'message' => $accessCheck['message'] ?? null,
                'current_package' => $accessCheck['current_package'] ?? null,
                'package_facilities' => $accessCheck['package_facilities'] ?? null
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking consultation access', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'has_access' => false,
                'reason' => 'Error sistem',
                'action_needed' => 'contact_support',
                'message' => 'Terjadi kesalahan sistem. Silakan hubungi admin.'
            ]);
        }
    }

    // UPDATE METHOD getInstructors() - Ganti method yang sudah ada dengan ini:
    public function getInstructors()
    {
        $userId = Auth::id();
        $userRole = Auth::user()->role;

        Log::info('getInstructors called', [
            'user_id' => $userId,
            'user_role' => $userRole
        ]);

        // CEK AKSES KONSULTASI UNTUK PESERTA
        $hasAccess = true;
        $accessInfo = null;

        if ($userRole === 'peserta') {
            $accessCheck = $this->checkKonsultasiAccess();
            $hasAccess = $accessCheck['allowed'];
            if (!$hasAccess) {
                $accessInfo = $accessCheck;
                Log::info('Student consultation access denied', [
                    'user_id' => $userId,
                    'reason' => $accessCheck['reason']
                ]);
            }
        }

        // Set timezone to Asia/Jakarta
        $now = Carbon::now('Asia/Jakarta');
        $today = $now->toDateString();
        $currentTime = $now->toTimeString();

        Log::info('Current time info', [
            'today' => $today,
            'current_time' => $currentTime,
            'timezone' => 'Asia/Jakarta'
        ]);

        // Get all instructors with availability status
        $instructors = DB::table('pengguna')
            ->join('pegawai', 'pengguna.idPegawai', '=', 'pegawai.idPegawai')
            ->leftJoin('instruktur', function ($join) use ($today) {
                $join->on('pegawai.idPegawai', '=', 'instruktur.idPegawai')
                    ->where('instruktur.tglKetersediaan', '=', $today);
            })
            ->where('pengguna.role', 'instruktur')
            ->where('pegawai.status', 'aktif')
            ->select(
                'pengguna.idPengguna as id',
                'pengguna.username as name',
                'pegawai.status as pegawai_status',
                'instruktur.tglKetersediaan',
                'instruktur.waktuMulai',
                'instruktur.waktuBerakhir',
                DB::raw("
                CASE 
                    WHEN instruktur.tglKetersediaan = '$today' 
                    AND '$currentTime' BETWEEN instruktur.waktuMulai AND instruktur.waktuBerakhir
                    THEN true 
                    ELSE false 
                END as is_available
            ")
            )
            ->orderBy('pengguna.username')
            ->get();

        Log::info('Found instructors with availability', [
            'count' => $instructors->count(),
            'instructors' => $instructors->toArray()
        ]);

        // Convert to array and ensure is_available is boolean
        $result = $instructors->map(function ($instructor) {
            return [
                'id' => $instructor->id,
                'name' => $instructor->name,
                'is_available' => (bool) $instructor->is_available,
                'availability_info' => [
                    'date' => $instructor->tglKetersediaan,
                    'start_time' => $instructor->waktuMulai,
                    'end_time' => $instructor->waktuBerakhir
                ]
            ];
        });

        // Return dengan format baru yang include access info
        return response()->json([
            'instructors' => $result,
            'has_access' => $hasAccess,
            'access_info' => $accessInfo
        ]);
    }

    /**
     * Helper method to get instructor data with availability
     */
    private function getInstructorData()
    {
        $now = Carbon::now('Asia/Jakarta');
        $today = $now->toDateString();
        $currentTime = $now->toTimeString();

        // Get all instructors with availability status
        $instructors = DB::table('pengguna')
            ->join('pegawai', 'pengguna.idPegawai', '=', 'pegawai.idPegawai')
            ->leftJoin('instruktur', function ($join) use ($today) {
                $join->on('pegawai.idPegawai', '=', 'instruktur.idPegawai')
                    ->where('instruktur.tglKetersediaan', '=', $today);
            })
            ->where('pengguna.role', 'instruktur')
            ->where('pegawai.status', 'aktif')
            ->select(
                'pengguna.idPengguna as id',
                'pengguna.username as name',
                'pegawai.status as pegawai_status',
                'instruktur.tglKetersediaan',
                'instruktur.waktuMulai',
                'instruktur.waktuBerakhir',
                DB::raw("
                    CASE 
                        WHEN instruktur.tglKetersediaan = '$today' 
                        AND '$currentTime' BETWEEN instruktur.waktuMulai AND instruktur.waktuBerakhir
                        THEN true 
                        ELSE false 
                    END as is_available
                ")
            )
            ->orderBy('pengguna.username')
            ->get();

        Log::info('Found instructors with availability', [
            'count' => $instructors->count(),
            'instructors' => $instructors->toArray()
        ]);

        // Convert to array and ensure is_available is boolean
        $result = $instructors->map(function ($instructor) {
            return [
                'id' => $instructor->id,
                'name' => $instructor->name,
                'is_available' => (bool) $instructor->is_available,
                'availability_info' => [
                    'date' => $instructor->tglKetersediaan,
                    'start_time' => $instructor->waktuMulai,
                    'end_time' => $instructor->waktuBerakhir
                ]
            ];
        });

        return $result;
    }

    public function getConsultation($targetId)
    {
        $userId = Auth::id();
        $userRole = Auth::user()->role;

        Log::info('getConsultation called', [
            'user_id' => $userId,
            'user_role' => $userRole,
            'target_id' => $targetId
        ]);

        if ($userRole === 'peserta') {
            // CEK AKSES KONSULTASI DULU
            $accessCheck = $this->checkKonsultasiAccess();
            if (!$accessCheck['allowed']) {
                return response()->json([
                    'error' => $accessCheck['message'],
                    'access_info' => $accessCheck
                ], 403);
            }

            $instructorId = $targetId;

            // Check if instructor exists and is available
            $instructor = Pengguna::where('idPengguna', $instructorId)
                ->where('role', 'instruktur')
                ->first();
            if (!$instructor) {
                Log::warning('Instructor not found', ['instructor_id' => $instructorId]);
                return response()->json(['error' => 'Instructor not found'], 404);
            }

            // Check instructor availability
            $now = Carbon::now('Asia/Jakarta');
            $today = $now->toDateString();
            $currentTime = $now->toTimeString();

            $availability = DB::table('pegawai')
                ->join('instruktur', 'pegawai.idPegawai', '=', 'instruktur.idPegawai')
                ->where('pegawai.idPegawai', $instructor->idPegawai)
                ->where('pegawai.status', 'aktif')
                ->where('instruktur.tglKetersediaan', $today)
                ->whereBetween(DB::raw("'$currentTime'"), [DB::raw('instruktur.waktuMulai'), DB::raw('instruktur.waktuBerakhir')])
                ->exists();

            if (!$availability) {
                Log::warning('Instructor not available', [
                    'instructor_id' => $instructorId,
                    'today' => $today,
                    'current_time' => $currentTime
                ]);
                return response()->json(['error' => 'Instructor not available at this time'], 403);
            }

            $consultation = Consultation::with(['messages.sender', 'messages.referencePage', 'instructor'])
                ->where('student_id', $userId)
                ->where('instructor_id', $instructorId)
                ->first();

            if (!$consultation) {
                Log::info('No existing consultation, returning empty state');
                return response()->json([
                    'consultation' => null,
                    'instructor' => [
                        'id' => $instructor->idPengguna,
                        'name' => $instructor->username
                    ],
                    'messages' => []
                ]);
            }

            return response()->json([
                'consultation' => $consultation,
                'instructor' => [
                    'id' => $consultation->instructor->idPengguna,
                    'name' => $consultation->instructor->username
                ],
                'messages' => $consultation->messages
            ]);
        } else if ($userRole === 'instruktur') {
            $studentId = $targetId;

            $student = Pengguna::where('idPengguna', $studentId)
                ->where('role', 'peserta')
                ->first();
            if (!$student) {
                Log::warning('Student not found', ['student_id' => $studentId]);
                return response()->json(['error' => 'Student not found'], 404);
            }

            $consultation = Consultation::with(['messages.sender', 'messages.referencePage', 'student'])
                ->where('instructor_id', $userId)
                ->where('student_id', $studentId)
                ->first();

            if (!$consultation) {
                Log::info('No existing consultation, returning empty state');
                return response()->json([
                    'consultation' => null,
                    'instructor' => [
                        'id' => $student->idPengguna,
                        'name' => $student->username
                    ],
                    'messages' => []
                ]);
            }

            return response()->json([
                'consultation' => $consultation,
                'instructor' => [
                    'id' => $consultation->student->idPengguna,
                    'name' => $consultation->student->username
                ],
                'messages' => $consultation->messages
            ]);
        }

        return response()->json(['error' => 'Unauthorized role'], 403);
    }

    public function sendMessage(Request $request, $instructorId)
    {
        $request->validate([
            'message' => 'required_without:attachment|string|max:1000',
            'attachment' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,mp3,mp4,avi,mov',
            'reference_page_id' => 'nullable|exists:pages,id',
            'reference_modul' => 'nullable|string',
            'reference_unit_number' => 'nullable|integer'
        ]);

        $studentId = Auth::id();

        // CEK AKSES KONSULTASI (STRICT CHECK)
        $accessCheck = $this->checkKonsultasiAccess();
        if (!$accessCheck['allowed']) {
            return response()->json([
                'error' => $accessCheck['message'],
                'access_info' => $accessCheck
            ], 403);
        }

        // Check instructor exists
        $instructor = Pengguna::where('idPengguna', $instructorId)
            ->where('role', 'instruktur')
            ->first();
        if (!$instructor) {
            return response()->json(['error' => 'Instructor not found'], 404);
        }

        // REAL-TIME availability check setiap send message
        if (!$this->isInstructorAvailable($instructorId)) {
            Log::warning('Student blocked from sending message - instructor not available', [
                'student_id' => $studentId,
                'instructor_id' => $instructorId,
                'current_time' => Carbon::now('Asia/Jakarta')->toTimeString(),
                'today' => Carbon::now('Asia/Jakarta')->toDateString()
            ]);
            return response()->json([
                'error' => 'Instruktur sedang tidak tersedia saat ini. Sesi konsultasi akan tetap aktif, namun Anda tidak dapat mengirim pesan diluar jam ketersediaan instruktur.'
            ], 403);
        }

        try {
            DB::beginTransaction();

            // Find existing consultation
            $consultation = Consultation::where('student_id', $studentId)
                ->where('instructor_id', $instructorId)
                ->first();

            $isNewConsultation = false;
            $isRestartedConsultation = false;

            // Create consultation if doesn't exist
            if (!$consultation) {
                $consultation = Consultation::create([
                    'student_id' => $studentId,
                    'instructor_id' => $instructorId,
                    'status' => 'pending'
                ]);
                $isNewConsultation = true;
                // Observer akan handle notifikasi otomatis
            }

            // Check if consultation is closed
            if ($consultation->status === 'closed') {
                // Restart consultation
                $consultation->update(['status' => 'pending']);
                $isRestartedConsultation = true;
                // Observer akan handle notifikasi otomatis
            }

            // Add session start marker for new or restarted consultations
            if ($isNewConsultation || $isRestartedConsultation) {
                Message::create([
                    'consultation_id' => $consultation->id,
                    'sender_id' => null,
                    'message' => $isNewConsultation ? 'Sesi konsultasi dimulai' : 'Sesi konsultasi baru dimulai',
                    'message_type' => 'session_marker'
                ]);
                // Session marker tidak trigger observer karena sender_id null
            }

            // Handle attachment upload
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('consultation_attachments', 'public');
            }

            // Create message - Observer akan handle notifikasi otomatis
            $message = Message::create([
                'consultation_id' => $consultation->id,
                'sender_id' => $studentId,
                'message' => $request->message,
                'attachment' => $attachmentPath,
                'reference_page_id' => $request->reference_page_id,
                'reference_modul' => $request->reference_modul,
                'reference_unit_number' => $request->reference_unit_number
            ]);

            $message->load('sender', 'referencePage');

            // Return all messages
            $allMessages = Message::where('consultation_id', $consultation->id)
                ->with('sender', 'referencePage')
                ->orderBy('created_at', 'asc')
                ->get();

            DB::commit();

            Log::info('Student message sent successfully', [
                'student_id' => $studentId,
                'instructor_id' => $instructorId,
                'consultation_id' => $consultation->id,
                'is_new_consultation' => $isNewConsultation,
                'is_restarted_consultation' => $isRestartedConsultation,
                'sent_at' => Carbon::now('Asia/Jakarta')->toTimeString()
            ]);

            return response()->json([
                'message' => $message,
                'consultation' => $consultation->fresh(),
                'all_messages' => $allMessages
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error sending student message', [
                'student_id' => $studentId,
                'instructor_id' => $instructorId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Failed to send message'], 500);
        }
    }

    public function getStudentConsultations()
    {
        try {
            $instructorId = Auth::id();
            $userRole = Auth::user()->role;

            Log::info('getStudentConsultations called', [
                'instructor_id' => $instructorId,
                'user_role' => $userRole
            ]);

            if ($userRole !== 'instruktur') {
                return response()->json(['error' => 'Access denied. Only instructors allowed.'], 403);
            }

            $consultations = Consultation::with(['student', 'latestMessage'])
                ->where('instructor_id', $instructorId)
                ->orderBy('updated_at', 'desc')
                ->get();

            Log::info('Found consultations', [
                'count' => $consultations->count()
            ]);

            return response()->json($consultations);
        } catch (\Exception $e) {
            Log::error('Error in getStudentConsultations', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Server error'], 500);
        }
    }

    public function instructorSendMessage(Request $request, $consultationId)
    {
        $request->validate([
            'message' => 'required_without:attachment|string',
            'attachment' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,mp3,mp4,avi,mov',
            'reference_page_id' => 'nullable|exists:pages,id',
            'reference_modul' => 'nullable|string',
            'reference_unit_number' => 'nullable|integer'
        ]);

        $instructorId = Auth::id();

        // Get consultation and validate ownership
        $consultation = Consultation::with(['student'])
            ->where('id', $consultationId)
            ->where('instructor_id', $instructorId)
            ->first();

        if (!$consultation) {
            return response()->json(['error' => 'Consultation not found or access denied'], 404);
        }

        // Check if consultation is closed
        if ($consultation->status === 'closed') {
            Log::warning('Instructor blocked from sending message - consultation closed', [
                'instructor_id' => $instructorId,
                'consultation_id' => $consultationId,
                'status' => $consultation->status
            ]);
            return response()->json([
                'error' => 'Sesi konsultasi telah berakhir. Anda tidak dapat mengirim pesan pada sesi yang sudah ditutup.'
            ], 403);
        }

        // STRICT: Check instructor availability - REAL-TIME check setiap send message
        if (!$this->isInstructorAvailable($instructorId)) {
            Log::warning('Instructor blocked from sending message - outside availability hours', [
                'instructor_id' => $instructorId,
                'consultation_id' => $consultationId,
                'current_time' => Carbon::now('Asia/Jakarta')->toTimeString(),
                'today' => Carbon::now('Asia/Jakarta')->toDateString()
            ]);
            return response()->json([
                'error' => 'Anda hanya dapat membalas pesan dalam jam ketersediaan yang telah ditentukan. Sesi konsultasi akan tetap aktif.'
            ], 403);
        }

        try {
            DB::beginTransaction();

            // Update status to active when instructor responds (if pending)
            if ($consultation->status === 'pending') {
                $consultation->update(['status' => 'active']);
                // Observer akan handle notifikasi otomatis untuk status change
            }

            // Handle attachment upload
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = $request->file('attachment')->store('consultation_attachments', 'public');
            }

            // Create message - Observer akan handle notifikasi otomatis
            $message = Message::create([
                'consultation_id' => $consultation->id,
                'sender_id' => $instructorId,
                'message' => $request->message,
                'attachment' => $attachmentPath,
                'reference_page_id' => $request->reference_page_id,
                'reference_modul' => $request->reference_modul,
                'reference_unit_number' => $request->reference_unit_number
            ]);

            $message->load('sender', 'referencePage');

            // Return all messages
            $allMessages = Message::where('consultation_id', $consultation->id)
                ->with('sender', 'referencePage')
                ->orderBy('created_at', 'asc')
                ->get();

            DB::commit();

            Log::info('Instructor message sent successfully', [
                'instructor_id' => $instructorId,
                'consultation_id' => $consultationId,
                'sent_at' => Carbon::now('Asia/Jakarta')->toTimeString(),
                'consultation_status' => $consultation->fresh()->status
            ]);

            return response()->json([
                'message' => $message,
                'consultation' => $consultation->fresh(),
                'all_messages' => $allMessages
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error sending instructor message', [
                'instructor_id' => $instructorId,
                'consultation_id' => $consultationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Failed to send message'], 500);
        }
    }

    public function endSession($consultationId)
    {
        $userId = Auth::id();

        try {
            DB::beginTransaction();

            $consultation = Consultation::with(['student', 'instructor'])
                ->where('id', $consultationId)
                ->where(function ($query) use ($userId) {
                    $query->where('student_id', $userId)
                        ->orWhere('instructor_id', $userId);
                })
                ->first();

            if (!$consultation) {
                DB::rollBack();
                return response()->json(['error' => 'Consultation not found'], 404);
            }

            if ($consultation->status === 'closed') {
                DB::rollBack();
                return response()->json(['error' => 'Session already ended'], 400);
            }

            // Update status to closed - Observer akan handle notifikasi otomatis
            $consultation->update(['status' => 'closed']);

            // Add session end marker
            Message::create([
                'consultation_id' => $consultation->id,
                'sender_id' => null,
                'message' => 'Sesi konsultasi berakhir',
                'message_type' => 'session_marker'
            ]);

            // Return all messages including the new session marker
            $allMessages = Message::where('consultation_id', $consultation->id)
                ->with('sender', 'referencePage')
                ->orderBy('created_at', 'asc')
                ->get();

            DB::commit();

            Log::info('Session ended successfully', [
                'user_id' => $userId,
                'consultation_id' => $consultationId,
                'ended_at' => Carbon::now('Asia/Jakarta')->toTimeString()
            ]);

            return response()->json([
                'consultation' => $consultation->fresh(),
                'all_messages' => $allMessages,
                'message' => 'Sesi konsultasi berakhir'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error ending session', [
                'user_id' => $userId,
                'consultation_id' => $consultationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Failed to end session'], 500);
        }
    }

    public function getPages()
    {
        $userId = Auth::id();
        $userRole = Auth::user()->role;

        $pages = Page::select('id', 'title', 'modul', 'unit_number', 'order_number')
            ->orderBy('modul')
            ->orderBy('unit_number')
            ->orderBy('order_number')
            ->get();

        if ($userRole === 'peserta') {
            $completedPageIds = UserProgress::where('idPengguna', $userId)
                ->pluck('page_id')
                ->toArray();

            $accessiblePages = collect();

            // Group pages by modul and unit
            $groupedPages = $pages->groupBy(['modul', 'unit_number']);

            foreach ($groupedPages as $modul => $units) {
                foreach ($units as $unitNumber => $unitPages) {
                    $sortedPages = $unitPages->sortBy('order_number');

                    foreach ($sortedPages as $page) {
                        // Check if this page is accessible (all previous pages completed)
                        $canAccess = true;
                        foreach ($sortedPages as $prevPage) {
                            if ($prevPage->order_number >= $page->order_number) break;
                            if (!in_array($prevPage->id, $completedPageIds)) {
                                $canAccess = false;
                                break;
                            }
                        }

                        if ($canAccess) {
                            $accessiblePages->push($page);
                        }
                    }
                }
            }

            $pages = $accessiblePages;
        }

        return response()->json($pages);
    }

    public function getUnits()
    {
        $userId = Auth::id();
        $userRole = Auth::user()->role;

        // Admin/Instruktur bisa akses semua unit seperti di PageController
        if ($userRole === 'instruktur' || $userRole === 'admin') {
            $units = DB::table('pages')
                ->select('modul', 'unit_number')
                ->distinct()
                ->orderBy('modul')
                ->orderBy('unit_number')
                ->get()
                ->groupBy('modul')
                ->map(function ($moduleUnits) {
                    return $moduleUnits->pluck('unit_number')->sort()->values();
                });

            return response()->json($units);
        }

        // Peserta hanya bisa lihat unit yang accessible berdasarkan feedback
        if ($userRole === 'peserta') {
            // Get unlocked units menggunakan UnitAccessController
            $unitAccessController = new UnitAccessController();
            $unlockedResponse = $unitAccessController->getUnlockedUnits(request());
            $unlockedData = $unlockedResponse->getData(true);

            if (!$unlockedData['has_active_feedback']) {
                // Return hanya unit overview (unit 0) jika tidak ada feedback aktif
                return response()->json([
                    'listening' => [0],
                    'structure' => [0],
                    'reading' => [0]
                ]);
            }

            return response()->json($unlockedData['unlocked_units']);
        }

        // Fallback untuk role lain
        return response()->json([
            'listening' => [0],
            'structure' => [0],
            'reading' => [0]
        ]);
    }
}
