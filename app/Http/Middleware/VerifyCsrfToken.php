<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Admin web-only endpoints that are called via AJAX from the same origin
        'loginForm',
        '/loginForm',
        'forgotPasswordForm',
        '/forgotPasswordForm',
    ];
}
