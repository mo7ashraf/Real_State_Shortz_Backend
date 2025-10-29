@extends('site.layouts.base')

@section('content')
  <div class="home-rail card" id="storiesRail" style="overflow:auto; white-space:nowrap; padding:8px 6px; margin-bottom:12px"></div>

  <div class="tabs">
    <a href="#" class="tab active" data-filter="all">For You</a>
    <a href="#" class="tab" data-filter="reel">Reels</a>
    <a href="#" class="tab" data-filter="image">Images</a>
    <a href="#" class="tab" data-filter="video">Videos</a>
    <a href="#" class="tab" data-filter="text">Text</a>
  </div>

  <div id="homeFeed" class="grid two"></div>
  <div id="homeEmpty" class="muted hide">No items.</div>
  <div id="homeLoading" class="muted" style="text-align:center; margin:16px 0">Loading…</div>
@endsection

@section('scripts')
  <script src="{{ asset('site/js/home.js') }}"></script>
@endsection

