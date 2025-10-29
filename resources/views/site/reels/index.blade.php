@extends('site.layouts.base')

@section('content')
<div id="reelsRoot" class="reels-container"></div>
@endsection

@section('scripts')
<script src="{{ asset('site/js/reels.js') }}"></script>
@endsection
