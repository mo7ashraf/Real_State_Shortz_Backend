@extends('site.layouts.base')

@section('content')
<h2>Post</h2>
<div id="postBox" class="card" style="max-width:720px">
  <div id="postLoading">Loading…</div>
  <div id="postContent" class="hide">
    <div id="postMedia"></div>
    <div class="muted" id="postDesc" style="margin-top:8px"></div>
  </div>
</div>

<div id="comments" class="card" style="max-width:720px; margin-top:12px">
  <div style="padding:8px 12px; border-bottom:1px solid var(--border)"><strong>Comments</strong></div>
  <div id="commentsList" style="padding:8px 12px"></div>
  <div style="display:flex; gap:8px; padding:8px 12px; border-top:1px solid var(--border)">
    <input id="commentInput" placeholder="Add a comment…" style="flex:1; padding:8px; border:1px solid var(--border); border-radius:8px" />
    <button id="commentSend" class="btn">Send</button>
  </div>
</div>
@endsection

@section('scripts')
<script>window.POST_ID={{ $postId }};</script>
<script src="{{ asset('site/js/post_show.js') }}"></script>
@endsection

