@extends('site.layouts.base')

@section('content')
  <div class="prop-hero">
    <div>
      <h2 class="prop-title-page">Explore Properties</h2>
      <div class="muted small" id="propCount">Loading…</div>
    </div>
  </div>

  <div class="filters-bar">
    <input id="propSearch" type="text" placeholder="Search title, city, district" class="input">
    <select id="propType" class="select">
      <option value="">All Types</option>
      <option value="apartment">Apartment</option>
      <option value="villa">Villa</option>
      <option value="land">Land</option>
    </select>
    <select id="listingType" class="select">
      <option value="">Any Listing</option>
      <option value="sale">For Sale</option>
      <option value="rent">For Rent</option>
    </select>
    <select id="sortBy" class="select">
      <option value="new">Newest</option>
      <option value="price_asc">Price ↑</option>
      <option value="price_desc">Price ↓</option>
      <option value="area_asc">Area ↑</option>
      <option value="area_desc">Area ↓</option>
    </select>
  </div>

  <div id="properties-grid" class="prop-grid"></div>
  <div id="properties-empty" class="muted hide">No properties found.</div>
@endsection

@section('scripts')
    <script src="{{ asset('site/js/properties.js') }}"></script>
@endsection
