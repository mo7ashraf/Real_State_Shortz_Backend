<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function profile(Request $request)
    {
        return view('site.settings.profile');
    }
}

