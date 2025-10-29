@extends('site.layouts.base')

@section('content')
<h2>Login</h2>
<p class="muted">Login to continue.</p>

<form id="siteLoginForm" class="card" style="max-width:480px">
  <div class="field">
    <label>Email or Username</label>
    <input type="text" name="identity" placeholder="email or username" required>
  </div>
  <div class="field">
    <label>Password</label>
    <div style="display:flex; gap:8px; align-items:center">
      <input id="password" type="password" name="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" required style="flex:1">
      <button id="togglePass" class="btn" type="button" aria-label="Show password">Show</button>
    </div>
  </div>
  <div class="actions">
    <button class="btn primary" type="submit">Login</button>
  </div>
  <div id="loginError" class="error hide"></div>
  <div id="loginOk" class="ok hide"></div>
</form>
@endsection

@section('scripts')
<script>
  (function(){
    const form = document.getElementById('siteLoginForm');
    const pass = document.getElementById('password');
    const toggle = document.getElementById('togglePass');
    toggle.addEventListener('click', ()=> {
      const isPwd = pass.getAttribute('type') === 'password';
      pass.setAttribute('type', isPwd ? 'text' : 'password');
      toggle.textContent = isPwd ? 'Hide' : 'Show';
      toggle.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        const res = await fetch(APP.apiBase + '/user/webLogin', {
          method: 'POST',
          headers: { 'apikey': 'retry123' },
          body: fd,
          credentials: 'same-origin'
        });
        const json = await res.json();
        if (!json.status) {
          throw new Error(json.message || 'Login failed');
        }
        const user = json.data || {};
        if (user.token){
          // Store only in localStorage; rely on server Set-Cookie for AUTHTOKEN
          localStorage.setItem('AUTHTOKEN', String(user.token));
          document.cookie = 'AUTHTOKEN=' + encodeURIComponent(String(user.token)) + '; Path=/; SameSite=Lax';
        }
        localStorage.setItem('SITE_USER', JSON.stringify(user));
        document.getElementById('loginOk').classList.remove('hide');
        document.getElementById('loginOk').textContent = 'Login successful! Redirecting...';
        // Immediate redirect with fallback
        const target = (window.ROUTES && window.ROUTES.reels) ? window.ROUTES.reels : '/site/reels';
        // Force navigation by replacing location to avoid back to login
        window.location.replace(target);
      } catch (err) {
        const el = document.getElementById('loginError');
        el.classList.remove('hide');
        el.textContent = err.message;
      }
    });
  })();
</script>
@endsection

