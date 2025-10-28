@extends('site.layouts.base')

@section('content')
<h2>Followers</h2>
<div id="followersList" class="card"></div>
@endsection

@section('scripts')
<script src="{{ asset('site/js/followers.js') }}"></script>
@endsection

