<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InstrukturController;
use App\Http\Controllers\PengajuanSkorAWalController;

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

Route::middleware(['auth:sanctum'])->group(function () {
    //Kelola Instruktur
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/instruktur', [InstrukturController::class, 'daftarInstrukturAdmin']); // Daftar instruktur
        Route::post('/admin/instruktur', [InstrukturController::class, 'store']); // Tambah
        Route::get('/admin/instruktur/{id}', [InstrukturController::class, 'getDetailInstruktur']); //Detail instruktur untuk diubah ketersediannya
        Route::patch('/admin/instruktur/{id}/nonaktif', [InstrukturController::class, 'delete']); // Nonaktif
        Route::patch('admin/instruktur/{id}/ketersediaan', [InstrukturController::class, 'ubahKetersediaan']); // Ubah Ketersediaan
        Route::get('/pengajuan-skor-awal', [PengajuanSkorAwalController::class, 'listForSeleksi']); //Daftar pengajuan 
        Route::get('/pengajuan-skor-awal/{id}', [PengajuanSkorAwalController::class, 'showDetailPengajuanSkor']); //Detail pengajuan untuk diseleksi
        Route::patch('/pengajuan-skor-awal/{id}/seleksi', [PengajuanSkorAwalController::class, 'seleksi']); // Admin menyeleksi pengajuan skor awal
        Route::get('/paket-kursus', [KelolaPaketKursusController::class, 'index']); //Daftar paket kursus
        Route::post('/paket-kursus', [KelolaPaketKursusController::class, 'store']); //Tambah
        Route::get('/paket-kursus/{id}', [KelolaPaketKursusController::class, 'show']); //Detail buat diubah
        Route::patch('/paket-kursus/{id}/ubah-detail', [KelolaPaketKursusController::class, 'updateDetailPaket']); //Update detail
        Route::get('/paket-kursus/{id}/aktivasi', [KelolaPaketKursusController::class, 'getDetailAktivasi']); //Detail buat atur aktivasi
        Route::patch('/paket-kursus/{id}/aktivasi', [KelolaPaketKursusController::class, 'toggleAktif']); //Atur aktivasi
    });

    //Daftar Instruktur
    Route::middleware('role:peserta,instruktur')->get('/instruktur/aktif', [InstrukturController::class, 'daftarAktif']);

    Route::middleware('role:peserta')->group(function () {
        Route::post('/pengajuan-skor-awal', [PengajuanSkorAwalController::class, 'store']); // Peserta mengajukan skor awal

        Route::get('/pengajuan-skor-awal', [PengajuanSkorAwalController::class, 'index']);  // Peserta melihat daftar riwayat pengajuan
    });
   
});
