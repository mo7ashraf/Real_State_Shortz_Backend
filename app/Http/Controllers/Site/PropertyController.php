<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        return view('site.property.index');
    }

    public function show(Request $request, $id)
    {
        return view('site.property.show', ['propertyId' => (int) $id]);
    }

    public function create(Request $request)
    {
        return view('site.property.new');
    }
}
