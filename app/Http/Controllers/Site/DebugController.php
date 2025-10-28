<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GlobalFunction;

class DebugController extends Controller
{
    public function auth(Request $request)
    {
        $raw = $request->cookie('AUTHTOKEN');
        $decoded = $raw ? urldecode($raw) : null;
        $tokenForLookup = $decoded;
        if ($decoded && strlen($decoded) > 0 && $decoded[0] === '{') {
            try { $obj = json_decode($decoded, true, 512, JSON_THROW_ON_ERROR); if (isset($obj['auth_token'])) { $tokenForLookup = $obj['auth_token']; } } catch (\Throwable $e) {}
        }
        $user = $tokenForLookup ? GlobalFunction::getUserFromAuthToken($tokenForLookup) : null;
        return response()->json([
            'cookie_raw' => $raw,
            'cookie_decoded' => $decoded,
            'token_used' => $tokenForLookup,
            'user_id' => $user?->id,
            'has_user' => (bool) $user,
        ]);
    }
}
