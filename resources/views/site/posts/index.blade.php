@extends('site.layouts.base')

@section('content')
<h2>Posts</h2>
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

