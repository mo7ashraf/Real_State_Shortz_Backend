@extends('site.layouts.base')

@section('content')
  <div id="reelView" data-id="{{ $reelId }}" class="reel-detail"></div>
@endsection

@section('scripts')
  <script src="{{ asset('site/js/reel_show.js') }}"></script>
@endsection
