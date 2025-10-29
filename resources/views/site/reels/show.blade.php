@extends('site.layouts.base')

@section('content')
  <h2>Reel</h2>
  <div id="reelPlayer" data-id="{{ $reelId }}" class="card"></div>
@endsection

@section('scripts')
  <script src="{{ asset('site/js/reel_show.js') }}"></script>
@endsection

