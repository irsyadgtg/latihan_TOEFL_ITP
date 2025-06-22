<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use App\Models\PesertaKursus;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;


class AuthController extends Controller
{

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'namaLengkap' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:pengguna,username',
            'nik' => 'required|digits:16|unique:peserta_kursus,nik',
            'email' => 'required|email|unique:pengguna,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            $peserta = PesertaKursus::create([
                'namaLengkap' => $request->namaLengkap,
                'alamat' => null,
                'nomorTelepon' => null,
                'urlFotoProfil' => 'foto-profil/foto-profil-admin.jpg',
                'status' => 'aktif',
                'nik' => $request->nik,
            ]);

            $pengguna = Pengguna::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'peserta',
                'idPeserta' => $peserta->idPeserta,
            ]);

            $verificationUrl = URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                ['id' => $pengguna->idPengguna]
            );

            Mail::raw("Klik link berikut untuk verifikasi akun Anda: $verificationUrl", function ($message) use ($pengguna) {
                $message->to($pengguna->email)
                        ->subject('Verifikasi Email Akun Anda');
            });

            DB::commit();

            return response()->json(['message' => 'Registrasi berhasil. Silakan cek email untuk verifikasi.'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Registrasi gagal', 'error' => $e->getMessage()], 500);
        }
    }

    public function verify(Request $request)
    {
        $user = Pengguna::find($request->route('id'));

        if (!$request->hasValidSignature()) {
            return response()->json(['message' => 'Link verifikasi kadaluarsa atau tidak valid.'], 403);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email sudah diverifikasi sebelumnya.'], 200);
        }

        $user->email_verified_at = now();
        $user->save();

        return response()->json(['message' => 'Email berhasil diverifikasi. Silakan login.'], 200);
    }

    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:pengguna,email',
        ]);

        $user = Pengguna::where('email', $request->email)->first();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email sudah diverifikasi.'], 200);
        }

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->idPengguna]
        );

        Mail::raw("Klik link berikut untuk verifikasi ulang akun Anda: $verificationUrl", function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('Verifikasi Ulang Email Akun Anda');
        });

        return response()->json(['message' => 'Link verifikasi baru telah dikirim ke email Anda.'], 200);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string', // Bisa username atau email
            'password' => 'required|string|min:8',
        ]);

        $loginInput = $request->login;
        $fieldType = filter_var($loginInput, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        // Cari pengguna berdasarkan email atau username
        $user = Pengguna::where($fieldType, $loginInput)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Login gagal. Periksa kembali email/username dan password Anda.',
            ], 401);
        }

        // Cek email verifikasi (hanya untuk peserta kursus)
        if ($user->role === 'peserta' && !$user->email_verified_at) {
            return response()->json([
                'message' => 'Email Anda belum diverifikasi. Silakan cek email untuk melakukan verifikasi.'
            ], 403);
        }

        // Cek status aktif atau tidak
        if ($user->role === 'peserta') {
            if (!$user->peserta || $user->peserta->status !== 'aktif') {
                return response()->json([
                    'message' => 'Akun Anda belum aktif atau masih dalam proses verifikasi.'
                ], 403);
            }
        } else {
            if (!$user->pegawai || $user->pegawai->status !== 'aktif') {
                return response()->json([
                    'message' => 'Akun pegawai Anda belum aktif.'
                ], 403);
            }
        }

        // Login sukses, buat token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    // Kirim link reset password ke email
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Link reset password telah dikirim ke email Anda.'], 200);
        }

        return response()->json([
            'message' => 'Gagal mengirim link reset password. Pastikan email terdaftar.'
        ], 400);
    }

    // Proses reset password
    public function resetPassword(ResetPasswordRequest $request)
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                ])->setRememberToken(Str::random(60));

                $user->save();
                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password baru berhasil dibuat.'], 200);
        } elseif ($status === Password::INVALID_TOKEN) {
            return response()->json(['message' => 'Link reset password sudah kadaluarsa atau tidak valid.'], 410);
        }

        return response()->json(['message' => 'Gagal melakukan reset password.'], 400);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil. Token telah dihapus.']);
    }
}
