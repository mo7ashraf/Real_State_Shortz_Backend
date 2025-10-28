@extends('site.layouts.base')

@section('content')
<h2>#{{ $tag }}</h2>
<div class="tabs">
  <a href="#" class="tab active" data-type="reel">Reels</a>
  <a href="#" class="tab" data-type="feed">Feed</a>
  </div>
<div id="hashtagGrid" class="grid three"></div>
@endsection

@section('scripts')
<script>window.HASHTAG_INIT={ tag:'{{ $tag }}' };</script>
<script src="{{ asset('site/js/hashtag.js') }}"></script>
@endsection

