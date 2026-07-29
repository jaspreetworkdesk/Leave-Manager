<?php

namespace App\Providers;
use App\Models\User;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

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
        ResetPassword::createUrlUsing(
            function (User $user, string $token): string {
                return config('app.frontend_url')
                    . '/reset-password?token='
                    . urlencode($token)
                    . '&email='
                    . urlencode($user->email);
            }
        );
    }
}
