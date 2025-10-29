@extends('site.layouts.base')

@section('content')
  <h2>Messages</h2>
  <div id="threads" class="card"></div>
@endsection

@section('scripts')
  <script src="{{ asset('site/js/messages.js') }}"></script>
@endsection

