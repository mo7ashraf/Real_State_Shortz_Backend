@extends('site.layouts.base')

@section('content')
<h2>Posts</h2>
<div style="margin:8px 0 16px; display:flex; gap:8px; align-items:center; flex-wrap:wrap">
  <button id="btnCreateSample" class="btn primary">Create Sample Post</button>
  <button id="btnSeedPosts" class="btn">Seed 5 Sample Posts</button>
  <a href="{{ route('site.reel.new') }}" class="btn">Upload Reel</a>
  <span id="sampleMsg" class="muted" style="margin-left:8px"></span>
  </div>
<div id="storiesRail" class="card" style="overflow:auto; white-space:nowrap; padding:8px 6px; margin-bottom:12px"></div>
<div class="tabs">
  <a href="#" data-type="all" class="tab active">All</a>
  <a href="#" data-type="image" class="tab">Images</a>
  <a href="#" data-type="video" class="tab">Videos</a>
  <a href="#" data-type="text" class="tab">Text</a>
  <a href="#" data-type="reel" class="tab">Reels</a>
  </div>
<div id="posts-grid" class="grid three"></div>
<div id="posts-empty" class="muted hide">No posts found.</div>
@endsection

@section('scripts')
<script src="{{ asset('site/js/posts.js') }}"></script>
@endsection
