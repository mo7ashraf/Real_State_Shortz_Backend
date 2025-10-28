@extends('site.layouts.base')

@section('content')
<h2>Reels</h2>
<div id="reels-list" class="reels-list"></div>
<div id="reels-empty" class="muted hide">No reels yet.</div>
@endsection

@section('scripts')
<script src="{{ asset('site/js/reels.js') }}"></script>
@endsection

