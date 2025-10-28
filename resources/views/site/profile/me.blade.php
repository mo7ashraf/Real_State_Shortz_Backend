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
@endsection

@section('scripts')
<script src="{{ asset('site/js/me.js') }}"></script>
@endsection
