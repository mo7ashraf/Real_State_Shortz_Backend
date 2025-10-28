<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GlobalFunction;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $token = $request->cookie('AUTHTOKEN');
        if ($token) { $token = urldecode($token); }
        if ($token) {
            $user = GlobalFunction::getUserFromAuthToken($token);
            if ($user) { return redirect()->route('site.reels'); }
        }
        return view('site.auth.login');
    }
}
