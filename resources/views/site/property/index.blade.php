@extends('site.layouts.base')

@section('content')
    <h2>Properties</h2>
    <div style="margin:12px 0; display:flex; gap:8px; flex-wrap:wrap;">
        <input type="text" id="propSearch" placeholder="Search properties…" class="field" style="flex:1; padding:10px; border:1px solid var(--border); border-radius:10px">
        <select id="propType" class="field" style="padding:10px; border:1px solid var(--border); border-radius:10px;">
            <option value="">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="land">Land</option>
        </select>
    </div>
    <div id="properties-grid" class="grid three"></div>
    <div id="properties-empty" class="muted hide">No properties found.</div>
@endsection

@section('scripts')
    <script src="{{ asset('site/js/properties.js') }}"></script>
@endsection

