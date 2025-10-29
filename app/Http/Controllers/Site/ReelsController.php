<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReelsController extends Controller
{
    public function index(Request $request)
    {
        return view('site.reels.index');
    }

    public function create(Request $request)
    {
        return view('site.reels.new');
    }

    public function show(Request $request, $id)
    {
        return view('site.reels.show', ['reelId' => (int) $id]);
    }
}
