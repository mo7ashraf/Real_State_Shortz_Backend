@extends('layouts.app')
@section('content')
<div class="container">
  <h3>Create Property</h3>
  <form method="POST" action="{{ route('admin.properties.store') }}" enctype="multipart/form-data">
    @csrf
    <input type="hidden" name="user_id" value="{{ auth()->id() ?? 1 }}">
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">Title*</label>
        <input class="form-control" name="title" required>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Property Type*</label>
        <select class="form-control" name="property_type" required>
          <option>apartment</option><option>villa</option><option>land</option>
          <option>shop</option><option>office</option><option>other</option>
        </select>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Listing Type*</label>
        <select class="form-control" name="listing_type" required>
          <option>sale</option><option>rent</option>
        </select>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Price (SAR)</label>
        <input class="form-control" name="price_sar" type="number" step="0.01">
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Area (sqm)</label>
        <input class="form-control" name="area_sqm" type="number" step="0.01">
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">Bedrooms</label>
        <input class="form-control" name="bedrooms" type="number" min="0">
      </div>
      <div class="col-md-3 mb-3">
        <label class="form-label">Bathrooms</label>
        <input class="form-control" name="bathrooms" type="number" min="0">
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">City</label>
        <input class="form-control" name="city">
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">District</label>
        <input class="form-control" name="district">
      </div>
      <div class="col-md-12 mb-3">
        <label class="form-label">Address</label>
        <input class="form-control" name="address">
      </div>
      <div class="col-md-12 mb-3">
        <label class="form-label">Description</label>
        <textarea class="form-control" name="description" rows="3"></textarea>
      </div>
      <div class="col-md-12 mb-3">
        <label class="form-label">Images (first is cover)</label>
        <input class="form-control" type="file" name="images[]" accept="image/*" multiple>
      </div>
      <div class="col-md-12">
        <button class="btn btn-primary">Save Property</button>
      </div>
    </div>
  </form>
</div>
@endsection
