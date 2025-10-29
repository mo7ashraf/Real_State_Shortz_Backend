<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MessagesController extends Controller
{
    public function index(Request $request)
    {
        return view('site.messages.index');
    }

    public function thread(Request $request, $id)
    {
        return view('site.messages.thread', ['threadId' => (int) $id]);
    }
}

