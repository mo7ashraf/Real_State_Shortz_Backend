@extends('site.layouts.base')

@section('content')
<h2>Following</h2>
<div id="followingList" class="card"></div>
@endsection

@section('scripts')
<script src="{{ asset('site/js/following.js') }}"></script>
@endsection

