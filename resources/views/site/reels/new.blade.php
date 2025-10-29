@extends('site.layouts.base')

@section('content')
<h2>Upload Reel</h2>
<p class="muted">Pick a short video (mp4) and an optional caption. It will appear in Reels if upload succeeds.</p>

<form id="reelForm" class="card" enctype="multipart/form-data" style="max-width:680px">
  <div class="field">
    <label>Video (mp4)*</label>
    <input type="file" name="video" id="reelVideo" accept="video/mp4,video/*" required>
  </div>
  <div class="field">
    <label>Caption</label>
    <input type="text" name="description" placeholder="Write a caption...">
  </div>
  <div class="actions">
    <button id="btnUploadReel" class="btn primary" type="submit">Upload</button>
    <span id="reelMsg" class="muted" style="margin-left:8px"></span>
  </div>
</form>
@endsection

@section('scripts')
<script src="{{ asset('site/js/reel_new.js') }}"></script>
@endsection

