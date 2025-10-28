<?php

namespace App\Http\Middleware;

use App\Models\GlobalFunction;
use App\Models\Admin;
use App\Models\Users;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SiteAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('AUTHTOKEN') ?: $request->header('authtoken') ?: $request->header('AUTHTOKEN');
        if ($token) { $token = urldecode($token); }
        // Accept JSON cookie containing { auth_token: "..." }
        if ($token && strlen($token) > 0 && $token[0] === '{') {
            try { $obj = json_decode($token, true, 512, JSON_THROW_ON_ERROR); if (isset($obj['auth_token'])) { $token = $obj['auth_token']; } } catch (\Throwable $e) {}
        }
        if ($token) {
            $user = GlobalFunction::getUserFromAuthToken($token);
            if ($user) {
                view()->share('siteUser', $user);
                return $next($request);
            }
        }

        if ($request->expectsJson()) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
        }
        return redirect()->route('site.login');
    }
}
