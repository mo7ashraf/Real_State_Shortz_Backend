<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HashtagController extends Controller
{
    public function index(Request $request, $tag)
    {
        return view('site.hashtag.index', ['tag' => $tag]);
    }
}

