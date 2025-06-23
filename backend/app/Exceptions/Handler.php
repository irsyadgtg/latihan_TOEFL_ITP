<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Tambahkan ini untuk menangani otorisasi/autentikasi untuk API
        $this->renderable(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) { // Jika request adalah API
                return response()->json(['message' => $e->getMessage()], 401);
            }
        });

        // Ini adalah bagian kunci untuk error redirect pada fitur password reset
        // Kita akan menangani HttpException secara umum atau spesifik jika bisa
        $this->renderable(function (HttpException $e, $request) {
            // Ketika Laravel mencoba redirect, seringkali dia akan membuang HttpException
            // dengan kode status 302 (redirect) atau lainnya, yang kemudian ditangkap
            // oleh UrlGenerator karena tidak menemukan route.
            // Kita akan mencegat ini untuk request API.
            if ($request->is('api/*')) {
                // Jika ini adalah redirect yang tidak diinginkan dari Auth/Password reset
                // Biasanya akan muncul sebagai status 302 (redirect)
                // Anda bisa lebih spesifik di sini jika ingin,
                // misalnya hanya jika message mengandung 'No query results' atau sejenisnya
                // atau jika statusnya 302.
                if ($e->getStatusCode() === 302 || str_contains($e->getMessage(), 'Route [] not defined')) {
                     // Tangani sebagai respon JSON
                    return response()->json(['message' => 'An authentication related error occurred.'], 400);
                }
                // Jika HttpException lain, biarkan Laravel tangani defaultnya atau kustomisasi lebih lanjut
                // return response()->json(['message' => $e->getMessage()], $e->getStatusCode());
            }
        });

        // Atau, pendekatan yang lebih umum dan sering berhasil untuk kasus Anda:
        // Tangani Throwable secara umum untuk request API
        $this->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                // Jika errornya dari UrlGenerator.php line 477 dan mengandung 'Route [] not defined'
                // Ini adalah ciri khas masalah redirect yang tidak ditemukan
                if (str_contains($e->getFile(), 'UrlGenerator.php') && str_contains($e->getMessage(), 'Route [] not defined')) {
                    // Respons khusus untuk masalah reset password yang gagal redirect
                    // Anda bisa membedakan pesan berdasarkan request data jika perlu,
                    // tapi ini adalah fallback yang aman.
                    return response()->json(['message' => 'Authentication or password reset failed. Please check your input.'], 400);
                }

                // Untuk error lain di API, kembalikan JSON
                // Ini adalah fallback umum jika tidak ada penanganan spesifik di atas
                if (config('app.debug')) {
                    return response()->json([
                        'message' => $e->getMessage(),
                        'exception' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => $e->getTrace(),
                    ], 500);
                }
                return response()->json(['message' => 'An unexpected error occurred.'], 500);
            }
        });
    }

}
