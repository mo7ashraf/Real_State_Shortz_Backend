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
        if ($token && strlen($token) > 10) {
            return redirect()->route('site.reels');
        }
        return redirect()->route('site.login');
    }
}
