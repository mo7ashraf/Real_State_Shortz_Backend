@extends('site.layouts.base')

@section('content')
<div class="post-detail two-col">
  <div>
    <div id="postBox" class="card-shell">
      <div id="postLoading" class="muted" style="padding:12px">Loading…</div>
      <div id="postContent" class="hide">
        <div id="postMedia" class="card-media"></div>
        <div class="card-body">
          <div id="postDesc" class="card-title"></div>
          <div id="postMeta" class="card-meta"></div>
        </div>
      </div>
    </div>
  </div>
  <aside class="sticky-side">
    <div class="card">
      <div style="padding:8px 12px; border-bottom:1px solid var(--border)"><strong>Comments</strong></div>
      <div id="commentsList" style="padding:8px 12px"></div>
      <div style="display:flex; gap:8px; padding:8px 12px; border-top:1px solid var(--border)">
        <input id="commentInput" placeholder="Add a comment…" style="flex:1; padding:8px; border:1px solid var(--border); border-radius:8px" />
        <button id="commentSend" class="btn">Send</button>
      </div>
    </div>
  </aside>
</div>
@endsection

@section('scripts')
<script>window.POST_ID={{ $postId }};</script>
<script src="{{ asset('site/js/post_show.js') }}"></script>
@endsection

