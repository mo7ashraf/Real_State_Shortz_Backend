@extends('site.layouts.base')

@section('content')
<div id="property" data-id="{{ $propertyId }}">
  <div class="skeleton">
    <div class="skeleton-title"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line short"></div>
  </div>
</div>

<h3>Related Posts</h3>
<div id="property-posts" class="grid three"></div>
@endsection

@section('scripts')
<script src="{{ asset('site/js/property.js') }}"></script>
@endsection

