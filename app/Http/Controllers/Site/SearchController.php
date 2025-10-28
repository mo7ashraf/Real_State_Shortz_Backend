<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        return view('site.search.index', [
            'tab' => $request->query('tab', 'posts'),
            'query' => $request->query('query', ''),
        ]);
    }
}

