<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }} · Site</title>
    <link rel="icon" type="image/png" href="{{ asset('assets/img/brand/icon_1024_white_bg.png') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/brand.css') }}">
    <link rel="stylesheet" href="{{ asset('site/css/site.css') }}">
</head>
<body>
<header class="site-header">
    <div class="container flex between center">
        <a class="brand" href="{{ route('site.home') }}">
            <img src="{{ asset('assets/img/brand/icon_1024_white_bg.png') }}" alt="Logo" height="40">
        </a>
        <nav class="nav">
            <a href="{{ route('site.reels') }}">Reels</a>
            <a href="{{ route('site.posts') }}">Posts</a>
            <a href="{{ route('site.live') }}">Live</a>
            <a href="{{ route('site.explore') }}">Explore</a>
            <a href="{{ route('site.properties') }}">Properties</a>
            <a id="messagesLink" href="{{ route('site.messages') }}">Messages</a>
            <a href="{{ route('site.me') }}">Profile</a>
        </nav>
        <div class="auth">
            <a id="loginLink" href="{{ route('site.login') }}">Login</a>
            <button id="logoutBtn" class="btn btn-link hide" type="button">Logout</button>
        </div>
    </div>
</header>

<main class="container">
    @yield('content')
  </main>

<script>
  window.APP = { apiBase: '{{ url('/api') }}' };
  window.ROUTES = {
    reels: '{{ route('site.reels') }}',
    posts: '{{ route('site.posts') }}',
    login: '{{ route('site.login') }}',
    setToken: '{{ route('site.set-token') }}'
  };
  </script>
<script src="{{ asset('site/js/api.js') }}"></script>
<script src="{{ asset('site/js/site.js') }}"></script>
@yield('scripts')
</body>
</html>
