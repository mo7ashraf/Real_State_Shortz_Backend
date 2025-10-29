<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PostsController extends Controller
{
    public function index(Request $request)
    {
        return view('site.posts.index');
    }

    public function show(Request $request, $id)
    {
        return view('site.post.show', ['postId' => (int) $id]);
    }
}
