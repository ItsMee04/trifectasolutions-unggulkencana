<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

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
        // Mengambil tag terbaru dari git (misal: v1.0.1)
        $version = cache()->remember('app_version', 3600, function () {
            return exec('git describe --tags --abbrev=0') ?: 'v1.0.0';
        });

        // Share ke semua view (Jika menggunakan Inertia)
        // Inertia::share('app_version', $version);

        // Atau simpan di Config agar bisa dipanggil API
        config(['app.version' => $version]);
    }
}
