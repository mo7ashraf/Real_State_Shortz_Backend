<?php

namespace App\Http\Middleware;

use App\Models\UserAuthTokens;
use App\Models\Users;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuthorizeUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Accept token from headers or cookie
        $authToken = $request->header('authtoken') ?? $request->header('AUTHTOKEN');
        // If multiple values were provided for the same header (case-insensitive),
        // Laravel may concatenate them into a comma-separated string. Take the first.
        if (is_string($authToken) && strpos($authToken, ',') !== false) {
            $authToken = trim(explode(',', $authToken)[0]);
        }
        if (!$authToken) {
            $cookie = $request->cookie('AUTHTOKEN');
            if ($cookie) {
                $decoded = $cookie;
                if (is_string($cookie) && strlen($cookie) > 0 && $cookie[0] === '{') {
                    try { $obj = json_decode($cookie, true, 512, JSON_THROW_ON_ERROR); if (isset($obj['auth_token'])) { $decoded = $obj['auth_token']; } } catch (\Throwable $e) {}
                }
                $authToken = $decoded;
            }
        }

        if ($authToken) {
            $token = UserAuthTokens::where('auth_token', (string)$authToken)->first();
            if ($token) {
                return $next($request);
            }
            return new JsonResponse(['status'=>false,'meassage'=>'Unauthorized Access','reason'=>'Invalid Token!'], 401);
        }

        return new JsonResponse(['status'=>false,'meassage'=>'Unauthorized Access','reason'=>'Token Not Provided'], 401);
    }
}
