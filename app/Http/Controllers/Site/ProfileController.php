<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function me(Request $request)
    {
        return view('site.profile.me');
    }

    public function followers(Request $request)
    {
        return view('site.profile.followers');
    }

    public function following(Request $request)
    {
        return view('site.profile.following');
    }
}
