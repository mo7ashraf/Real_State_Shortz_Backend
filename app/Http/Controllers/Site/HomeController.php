<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $token = $request->cookie('AUTHTOKEN');
        if ($token) { $token = urldecode($token); }
        if ($token && strlen($token) > 0 && $token[0] === '{') {
            try { $obj = json_decode($token, true, 512, JSON_THROW_ON_ERROR); if (isset($obj['auth_token'])) { $token = $obj['auth_token']; } } catch (\Throwable $e) {}
        }
        if ($token && strlen($token) > 10) {
            return redirect()->route('site.reels');
        }
        return redirect()->route('site.login');
    }
}
