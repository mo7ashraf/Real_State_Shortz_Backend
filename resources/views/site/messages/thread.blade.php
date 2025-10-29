@extends('site.layouts.base')

@section('content')
  <div id="chat" data-id="{{ $threadId }}" class="card" style="min-height:400px"></div>
  <form id="chatForm" class="card" style="margin-top:8px; display:flex; gap:8px">
    <input id="chatText" type="text" placeholder="Type a message…" style="flex:1">
    <button class="btn primary" type="submit">Send</button>
  </form>
@endsection

@section('scripts')
  <script src="{{ asset('site/js/messages_thread.js') }}"></script>
@endsection

