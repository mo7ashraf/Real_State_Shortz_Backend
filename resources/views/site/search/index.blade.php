@extends('site.layouts.base')

@section('content')
<h2>Search</h2>
<form id="searchForm" class="card" style="margin:12px 0; max-width:820px; display:flex; gap:8px; align-items:center">
  <input type="text" id="searchQuery" value="{{ $query }}" placeholder="Search..." style="flex:1; padding:10px; border:1px solid var(--border); border-radius:10px">
  <button id="openFilters" class="btn" type="button">Filters</button>
  <button class="btn primary" type="submit">Search</button>
  <input type="hidden" id="filterState" value="{}">
  
</form>

<div class="tabs">
  <a href="#" class="tab" data-tab="posts">Posts</a>
  <a href="#" class="tab" data-tab="reels">Reels</a>
  <a href="#" class="tab" data-tab="properties">Properties</a>
  <a href="#" class="tab" data-tab="users">Users</a>
  <a href="#" class="tab" data-tab="hashtags">Hashtags</a>
</div>

<div id="searchResults"></div>

<!-- Filter drawer -->
<div id="filterDrawer" class="card hide" style="position:fixed; right:16px; bottom:16px; width:360px; max-width:90vw; background:#fff; border:1px solid var(--border); border-radius:12px; box-shadow: var(--shadow-card); z-index:1000;">
  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding:10px 12px">
    <strong>Property Filters</strong>
    <button id="closeFilters" class="btn" type="button">Close</button>
  </div>
  <div style="padding:12px">
    <div class="field"><label>Listing Type</label><input type="text" id="f_listing_type" placeholder="rent | sale"></div>
    <div class="field"><label>Property Type</label><input type="text" id="f_property_type" placeholder="apartment | villa | land"></div>
    <div class="grid two">
      <div class="field"><label>Min Price</label><input type="number" id="f_min_price"></div>
      <div class="field"><label>Max Price</label><input type="number" id="f_max_price"></div>
      <div class="field"><label>Min Area</label><input type="number" id="f_min_area"></div>
      <div class="field"><label>Max Area</label><input type="number" id="f_max_area"></div>
      <div class="field"><label>Beds</label><input type="number" id="f_beds"></div>
      <div class="field"><label>Baths</label><input type="number" id="f_baths"></div>
    </div>
    <div class="grid two">
      <div class="field"><label>City</label><input type="text" id="f_city"></div>
      <div class="field"><label>District</label><input type="text" id="f_district"></div>
    </div>
    <div class="actions">
      <button id="applyFilters" class="btn primary" type="button">Apply</button>
      <button id="clearFilters" class="btn" type="button">Clear</button>
    </div>
  </div>
</div>
@endsection

@section('scripts')
<script>window.SEARCH_INIT={ tab:'{{ $tab }}', query:'{{ $query }}' };</script>
<script src="{{ asset('site/js/search.js') }}"></script>
@endsection
