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
        $user = $decoded ? GlobalFunction::getUserFromAuthToken($decoded) : null;
        return response()->json([
            'cookie_raw' => $raw,
            'cookie_decoded' => $decoded,
            'user_id' => $user?->id,
            'has_user' => (bool) $user,
        ]);
    }
}

