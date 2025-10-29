@extends('site.layouts.base')

@section('content')
<h2>Create Property</h2>
<p class="muted">Publish a new property with images. Required fields are marked.</p>

<form id="propForm" class="card" enctype="multipart/form-data" style="max-width:820px">
  <div class="grid two">
    <div class="field">
      <label>Title*</label>
      <input type="text" name="title" required>
    </div>
    <div class="field">
      <label>Listing Type</label>
      <input type="text" name="listing_type" placeholder="rent | sale">
    </div>
    <div class="field">
      <label>Property Type</label>
      <input type="text" name="property_type" placeholder="apartment | villa | land">
    </div>
    <div class="field">
      <label>Price (SAR)</label>
      <input type="number" step="1" name="price_sar">
    </div>
    <div class="field">
      <label>Area (sqm)</label>
      <input type="number" step="1" name="area_sqm">
    </div>
    <div class="field">
      <label>Bedrooms</label>
      <input type="number" step="1" name="bedrooms">
    </div>
    <div class="field">
      <label>Bathrooms</label>
      <input type="number" step="1" name="bathrooms">
    </div>
    <div class="field">
      <label>City</label>
      <input type="text" name="city">
    </div>
    <div class="field">
      <label>District</label>
      <input type="text" name="district">
    </div>
    <div class="field" style="grid-column:1/-1">
      <label>Address</label>
      <input type="text" name="address">
    </div>
    <div class="field" style="grid-column:1/-1">
      <label>Description</label>
      <input type="text" name="description" placeholder="Short description">
    </div>
    <div class="field" style="grid-column:1/-1">
      <label>Images*</label>
      <input type="file" name="images[]" multiple accept="image/*" required>
    </div>
  </div>
  <div class="actions">
    <button id="btnPublish" class="btn primary" type="submit">Publish</button>
    <span id="propMsg" class="muted" style="margin-left:8px"></span>
  </div>
</form>
@endsection

@section('scripts')
<script src="{{ asset('site/js/property_new.js') }}"></script>
@endsection

