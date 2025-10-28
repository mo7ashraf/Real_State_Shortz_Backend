@extends('site.layouts.base')

@section('content')
<h2>Search</h2>
<form id="searchForm" class="card" style="margin:12px 0; max-width:720px">
  <input type="text" id="searchQuery" value="{{ $query }}" placeholder="Search..." style="width:100%; padding:10px; border:1px solid var(--border); border-radius:10px">
</form>

<div class="tabs">
  <a href="#" class="tab" data-tab="posts">Posts</a>
  <a href="#" class="tab" data-tab="reels">Reels</a>
  <a href="#" class="tab" data-tab="properties">Properties</a>
  <a href="#" class="tab" data-tab="users">Users</a>
  <a href="#" class="tab" data-tab="hashtags">Hashtags</a>
</div>

<div id="searchResults"></div>
@endsection

@section('scripts')
<script>window.SEARCH_INIT={ tab:'{{ $tab }}', query:'{{ $query }}' };</script>
<script src="{{ asset('site/js/search.js') }}"></script>
@endsection

