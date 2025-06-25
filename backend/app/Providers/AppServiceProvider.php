<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\PengajuanSkorAwal;
use App\Observers\PengajuanSkorAwalObserver;


use App\Models\Transaksi;
use App\Observers\TransaksiObserver;



// Observers untuk modul pembelajaran - KONSULTASI ONLY
use App\Models\Consultation;
use App\Observers\ConsultationObserver;
use App\Models\Message;
use App\Observers\MessageObserver;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        PengajuanSkorAwal::observe(PengajuanSkorAwalObserver::class);
        Transaksi::observe(TransaksiObserver::class);

        //pembelajaran
        Consultation::observe(ConsultationObserver::class);
        Message::observe(MessageObserver::class);
    }
}
