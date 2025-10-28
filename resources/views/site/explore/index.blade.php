@extends('site.layouts.base')

@section('content')
<h2>Explore</h2>
<form id="exploreSearch" class="card" style="margin:12px 0; max-width:720px">
  <input type="text" id="exploreQuery" placeholder="Search posts, reels, users, hashtags, properties" style="width:100%; padding:10px; border:1px solid var(--border); border-radius:10px">
</form>

<h4 class="muted">Trending Hashtags</h4>
<div id="exploreChips" class="chips" style="margin:8px 0 16px"></div>

<div id="exploreGrid" class="grid three"></div>
@endsection

@section('scripts')
<script src="{{ asset('site/js/explore.js') }}"></script>
@endsection
