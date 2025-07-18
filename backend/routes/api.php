<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KelolaProfilPegawaiController;
use App\Http\Controllers\KelolaProfilPesertaController;
use App\Http\Controllers\InstrukturController;
use App\Http\Controllers\PengajuanSkorAWalController;
use App\Http\Controllers\KelolaPaketKursusController;
use App\Http\Controllers\RencanaBelajarController;
use App\Http\Controllers\TinjauRencanaBelajarController;
use App\Http\Controllers\PantauPesertaController;
use App\Http\Controllers\DashboardAdminController;
use App\Http\Controllers\AdminTransaksiController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\NotifikasiAdminController;

//pembelajaran
use App\Http\Controllers\PageController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\UserProgressController;
use App\Http\Controllers\UnitAccessController;

use App\Http\Controllers\SimulationController;
use App\Http\Controllers\SimulationSetController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\LaporanPembelajaranController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardInstrukturController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

//Debug juga
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

//Debug authorisasi token user
Route::middleware('auth:sanctum')->get('/debug-user', function (Request $request) {
    return response()->json([
        'authenticated_user' => $request->user(),
    ]);
});


// Registrasi
Route::post('/register', [AuthController::class, 'register']);

// Kirim ulang link verifikasi
Route::post('/email/resend', [AuthController::class, 'resendVerification']);

//Login
Route::post('/login', [AuthController::class, 'login']);
Route::get('/login', function () {
    return response()->json(['message' => 'Please login'], 401);
})->name('login');

//Logout
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

//Lupa password dan Reset password
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/reset-password/{token}', function ($token) {
    return response()->json([
        'message' => 'Ini halaman reset password (dummy). Token: ' . $token
    ]);
})->name('password.reset');

Route::middleware(['auth:sanctum'])->group(function () {
    //Kelola Instruktur
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard-admin', [DashboardAdminController::class, 'getDashboardData']); //Dashboard admin
        Route::get('/profil/admin', [KelolaProfilPegawaiController::class, 'getProfilAdmin']); // Detail Profil admin
        Route::post('/profil/admin', [KelolaProfilPegawaiController::class, 'updateProfilAdmin']); //Update profil
        Route::get('/admin/instruktur', [InstrukturController::class, 'daftarInstrukturAdmin']); // Daftar instruktur
        Route::post('/admin/instruktur', [InstrukturController::class, 'store']); // Tambah
        Route::get('/admin/instruktur/{id}', [InstrukturController::class, 'getDetailInstruktur']); //Detail instruktur untuk diubah ketersediannya
        Route::patch('/admin/instruktur/{id}/nonaktif', [InstrukturController::class, 'delete']); // Nonaktif
        Route::patch('admin/instruktur/{id}/ketersediaan', [InstrukturController::class, 'ubahKetersediaan']); // Ubah Ketersediaan
        Route::get('/admin/pengajuan-skor-awal', [PengajuanSkorAwalController::class, 'listForSeleksi']); //Daftar pengajuan 
        Route::get('/admin/pengajuan-skor-awal/{id}', [PengajuanSkorAwalController::class, 'showDetailPengajuanSkor']); //Detail pengajuan untuk diseleksi
        Route::patch('/pengajuan-skor-awal/{id}/seleksi', [PengajuanSkorAwalController::class, 'seleksi']); // Admin menyeleksi pengajuan skor awal
        Route::get('/paket-kursus', [KelolaPaketKursusController::class, 'index']); //Daftar paket kursus
        Route::post('/paket-kursus', [KelolaPaketKursusController::class, 'store']); //Tambah
        Route::get('/paket-kursus/{id}', [KelolaPaketKursusController::class, 'show']); //Detail buat diubah
        Route::patch('/paket-kursus/{id}/ubah-detail', [KelolaPaketKursusController::class, 'updateDetailPaket']); //Update detail
        Route::get('/paket-kursus/{id}/aktivasi', [KelolaPaketKursusController::class, 'getDetailAktivasi']); //Detail buat atur aktivasi
        Route::patch('/paket-kursus/{id}/aktivasi', [KelolaPaketKursusController::class, 'toggleAktif']); //Atur aktivasi
        Route::get('/admin/pantau-peserta', [PantauPesertaController::class, 'index']); //Pantau peserta kursus
        Route::get('/admin/transaksi', [AdminTransaksiController::class, 'listTransaksi']); // List semua transaksi
        Route::get('/admin/transaksi/{id}', [AdminTransaksiController::class, 'detailTransaksi']); // Detail transaksi
        Route::patch('/admin/transaksi/{id}/verifikasi', [AdminTransaksiController::class, 'verifikasiTransaksi']); // Verifikasi transaksi
        Route::get('/admin/notifikasi/terbaru', [NotifikasiAdminController::class, 'getNotifikasiTerbaru']); //Notikisai admin terbaru
        Route::get('/admin/notifikasi', [NotifikasiAdminController::class, 'getSemuaNotifikasi']); //All notif admin
        Route::post('/admin/notifikasi/tandai/{id}', [NotifikasiAdminController::class, 'tandaiTerbaca']); //Tandai terbaca di notif admin
    });

    //Daftar Instruktur
    Route::middleware('role:peserta,instruktur')->get('/instruktur/aktif', [InstrukturController::class, 'daftarAktif']);

    Route::middleware('role:instruktur')->group(function () {
        Route::get('/profil/instruktur', [KelolaProfilPegawaiController::class, 'getProfilInstruktur']); //Detail profil instruktur
        Route::post('/profil/instruktur', [KelolaProfilPegawaiController::class, 'updateProfilInstruktur']); //Update profil
        Route::get('/instruktur/daftar-instruktur', [InstrukturController::class, 'daftarInstrukturAdmin']); //Daftar instruktur
        Route::get('/pengajuan-rencana-belajar', [TinjauRencanaBelajarController::class, 'index']); //Daftar pengajuan rencana belajar untuk ditinjau
        Route::get('/pengajuan-rencana-belajar/{id}', [TinjauRencanaBelajarController::class, 'show']); //Detail pengajuan rencana belajar yg ditinjau
        Route::post('/pengajuan-rencana-belajar/{id}/feedback', [TinjauRencanaBelajarController::class, 'beriFeedback']); //Beri feedback

        // START ROLE-BASED PEMBELAJARAN - INSTRUKTUR ONLY
        Route::post('/pages', [PageController::class, 'store']); // Instruktur buat materi baru
        Route::put('/pages/{id}', [PageController::class, 'update']); // Instruktur edit materi
        Route::delete('/pages/{id}', [PageController::class, 'destroy']); // Instruktur hapus materi
        Route::post('/upload', [PageController::class, 'upload']); // Upload file untuk materi

        Route::post('/questions', [QuestionController::class, 'store']); // Instruktur buat soal baru
        Route::put('/questions/{id}', [QuestionController::class, 'update']); // Instruktur edit soal
        Route::post('/questions/{id}', [QuestionController::class, 'update']); // Support _method=PUT
        Route::delete('/questions/{id}', [QuestionController::class, 'destroy']); // Instruktur hapus soal

        Route::post('/simulation-sets', [SimulationSetController::class, 'store']); // Instruktur buat simulation set
        Route::post('/simulation-sets/{id}/toggle-active', [SimulationSetController::class, 'toggleActive']); // Instruktur toggle aktif/nonaktif simulasi

        Route::get('/dashboard/instruktur', [DashboardInstrukturController::class, 'instrukturDashboard']); // Dashboard khusus instruktur

        Route::get('/consultations/students', [ConsultationController::class, 'getStudentConsultations']); // Daftar peserta yang konsultasi
        Route::post('/consultations/{consultationId}/instructor-message', [ConsultationController::class, 'instructorSendMessage']); // Instruktur kirim pesan
        // END ROLE-BASED PEMBELAJARAN - INSTRUKTUR ONLY
    });

    Route::middleware('role:peserta')->group(function () {
        Route::get('/profil/peserta', [KelolaProfilPesertaController::class, 'getProfilPeserta']); //Detail profil peserta
        Route::post('/profil/peserta', [KelolaProfilPesertaController::class, 'updateProfilPeserta']); //Update profil
        Route::get('/peserta/daftar-instruktur', [InstrukturController::class, 'daftarInstrukturAdmin']); //Daftar instruktur
        Route::post('/pengajuan-skor-awal', [PengajuanSkorAwalController::class, 'store']); // Peserta mengajukan skor awal
        Route::get('/pengajuan-skor-awal', [PengajuanSkorAwalController::class, 'index']);  // Peserta melihat daftar riwayat pengajuan
        Route::get('/peserta/rencana-belajar', [RencanaBelajarController::class, 'index']);
        Route::post('/peserta/rencana-belajar', [RencanaBelajarController::class, 'store']);
        Route::get('/peserta/rencana-belajar/{id}', [RencanaBelajarController::class, 'show']);
        Route::get('/peserta/skill', [RencanaBelajarController::class, 'showSkill']);
        Route::get('/peserta/paket-kursus', [KelolaPaketKursusController::class, 'indexPeserta']); //Daftar paket kursus pada peserta
        Route::get('/paket/{id}', [PembayaranController::class, 'showPaketDetail']); // Detail paket peserta
        Route::get('/paket/{id}/eligibility', [PembayaranController::class, 'checkEligibility']);  // Cek eligibility
        Route::get('/paket/{id}/beli', [PembayaranController::class, 'beliPaketInfo']); // Detail info pembayaran paket
        Route::post('/paket/{id}/beli', [PembayaranController::class, 'beliPaket']);   // Beli paket (upload bukti pembayaran)
        Route::get('/pembayaran/riwayat', [PembayaranController::class, 'riwayatTransaksi']);  // Riwayat transaksi

        // START ROLE-BASED PEMBELAJARAN - PESERTA ONLY
        Route::post('/pages/{pageId}/complete', [UserProgressController::class, 'markComplete']); // Peserta tandai halaman selesai
        Route::get('/progress/unit', [UserProgressController::class, 'getUnitProgress']); // Progress per unit peserta

        Route::get('/units/unlocked', [UnitAccessController::class, 'getUnlockedUnits']); // Unit yang terbuka untuk peserta
        Route::get('/units/check-access', [UnitAccessController::class, 'checkUnitAccess']); // Cek akses unit tertentu

        Route::post('/quiz/submit', [QuizController::class, 'submit']); // Peserta submit jawaban quiz
        Route::get('/quiz/answers', [QuizController::class, 'answers']); // Peserta lihat jawaban quiz

        Route::get('/simulations/eligibility', [SimulationController::class, 'checkEligibility']); // Cek eligibility peserta untuk simulasi
        Route::get('/simulations/completed', [SimulationController::class, 'getCompletedSimulations']); // Riwayat simulasi peserta
        Route::post('/simulations/start', [SimulationController::class, 'start']); // Peserta mulai simulasi
        Route::get('/simulations/{simulationId}/questions', [SimulationController::class, 'getQuestions']); // Soal simulasi untuk peserta
        Route::post('/simulations/submit-section', [SimulationController::class, 'submitSection']); // Peserta submit section simulasi
        Route::get('/simulations/{simulationId}/results', [SimulationController::class, 'getResults']); // Hasil simulasi peserta

        //HANDLE TAMBAHAN SIMULASI
        Route::post('/simulations/submit-question', [SimulationController::class, 'submitQuestion']);
        Route::post('/simulations/auto-submit-section', [SimulationController::class, 'autoSubmitSection']);
        Route::get('/simulations/{simulationId}/timer-state', [SimulationController::class, 'getTimerState']);
        Route::post('/simulations/sync-timer', [SimulationController::class, 'syncTimer']);
        Route::get('/simulations/{simulationId}/existing-answers', [SimulationController::class, 'getExistingAnswers']);


        Route::get('/consultations/instructors', [ConsultationController::class, 'getInstructors']); // Daftar instruktur untuk konsultasi
        Route::post('/consultations/{instructorId}/messages', [ConsultationController::class, 'sendMessage']); // Peserta kirim pesan konsultasi

        Route::get('/dashboard/peserta', [DashboardController::class, 'pesertaDashboard']); // Dashboard khusus peserta

        Route::get('/laporan/progress', [LaporanPembelajaranController::class, 'getProgressOverview']); // Overview progress peserta
        Route::get('/laporan/detail', [LaporanPembelajaranController::class, 'getDetailedReport']); // Detail laporan peserta
        // END ROLE-BASED PEMBELAJARAN - PESERTA ONLY
    });

    // START SHARED ROUTES - BOTH INSTRUKTUR AND PESERTA CAN ACCESS
    Route::middleware('role:instruktur,peserta')->group(function () {
        Route::get('/pages', [PageController::class, 'index']); // Both roles can view materi
        Route::get('/questions', [QuestionController::class, 'index']); // Both roles can view soal (?modul=x&unit_number=y)
        Route::get('/simulation-sets', [SimulationSetController::class, 'index']); // Both roles can view simulation sets
        Route::get('/simulation-sets/{id}/questions', [SimulationSetController::class, 'show']); // Both roles can view questions in set
        Route::get('/simulation-sets/{id}', [SimulationSetController::class, 'show']); // Both roles can view simulation set detail

        //consultation
        Route::get('/consultation-pages', [ConsultationController::class, 'getPages']); // Halaman untuk konsultasi
        Route::get('/consultation-units', [ConsultationController::class, 'getUnits']); // Unit untuk konsultasi
        Route::get('/consultations/{targetId}', [ConsultationController::class, 'getConsultation']); // Both roles can view consultation
        Route::post('/consultations/{consultationId}/end-session', [ConsultationController::class, 'endSession']); //  akhiri sesi konsultasi
        Route::get('/consultations/check-access', [ConsultationController::class, 'checkConsultationAccess']);

        // NOTIFICATION ROUTES - INSTRUKTUR AND PESERTA ONLY (Admin punya route sendiri)
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/recent', [NotificationController::class, 'recent']);
        Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
        Route::get('/notifications/type/{type}', [NotificationController::class, 'getByType']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
        Route::post('/notifications', [NotificationController::class, 'create']);
    // END SHARED ROUTES
    });
    
});
