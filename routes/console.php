<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jalankan setiap tengah malam untuk menandai key yang sudah kadaluarsa
Schedule::command('keys:mark-expired')->dailyAt('00:05');
