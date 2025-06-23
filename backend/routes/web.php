<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Verifikasi email (GET karena user mengklik link dari email)
Route::get('/email/verify/{id}', [AuthController::class, 'verify'])->name('verification.verify');

//Kirim token lupa password
Route::get('/reset-password/{token}', function ($token) {
    return response()->json([
        'message' => 'Ini halaman reset password (dummy). Token: '.$token
    ]);
})->name('password.reset');
