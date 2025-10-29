<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    public function landing(Request $request, $type, $id)
    {
        return view('site.share.landing', ['type' => $type, 'id' => (int) $id]);
    }
}

