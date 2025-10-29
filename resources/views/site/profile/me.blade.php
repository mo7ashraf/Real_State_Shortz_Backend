@extends('site.layouts.base')

@section('content')
<h2>My Profile</h2>
<div id="meBox" class="card" style="max-width:720px">
  <div id="meLoading">Loading...</div>
  <div id="meContent" class="hide">
    <div style="display:flex; gap:12px; align-items:center">
      <img id="meAvatar" src="" alt="avatar" style="width:64px; height:64px; border-radius:50%; object-fit:cover; border:1px solid var(--border)">
      <div>
        <div><strong id="meFullname"></strong> <span id="meVerified" class="badge-primary" style="display:none; padding:2px 8px; margin-left:6px">Verified</span></div>
        <div class="muted" id="meUsername"></div>
      </div>
    </div>
    <div style="margin-top:10px" id="meBio" class="muted"></div>
  </div>
  <div id="meError" class="error hide" style="color:#b91c1c"></div>
  </div>

  <div id="meCounts" class="card" style="margin-top:12px; display:flex; gap:18px; flex-wrap:wrap; align-items:center">
    <div style="text-align:center">
      <div id="countReels" style="font-weight:800">0</div>
      <div class="muted small">Reels</div>
    </div>
    <div style="text-align:center">
      <div id="countPosts" style="font-weight:800">0</div>
      <div class="muted small">Posts</div>
    </div>
    <div style="text-align:center">
      <div id="countProps" style="font-weight:800">0</div>
      <div class="muted small">Properties</div>
    </div>
    <a href="{{ route('site.me.followers') }}" class="muted" style="text-align:center; text-decoration:none">
      <div id="countFollowers" style="font-weight:800; color:#111">0</div>
      <div class="muted small">Followers</div>
    </a>
    <a href="{{ route('site.me.following') }}" class="muted" style="text-align:center; text-decoration:none">
      <div id="countFollowing" style="font-weight:800; color:#111">0</div>
      <div class="muted small">Following</div>
    </a>
  </div>

  <div class="tabs" style="margin-top:12px">
    <a href="#" class="tab active" data-tab="reels">Reels</a>
    <a href="#" class="tab" data-tab="posts">Posts</a>
    <a href="#" class="tab" data-tab="properties">Properties</a>
    <a href="{{ route('site.me.followers') }}" class="tab">Followers</a>
  <a href="{{ route('site.me.following') }}" class="tab">Following</a>
  <a href="{{ route('site.settings.profile') }}" class="tab">Edit Profile</a>
</div>
<div id="meTabContent" class="grid three"></div>
@endsection

@section('scripts')
<script src="{{ asset('site/js/me.js') }}"></script>
<script src="{{ asset('site/js/me_tabs.js') }}"></script>
@endsection
