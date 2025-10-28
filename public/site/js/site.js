// Basic helpers for the public site
(function(){
  function getToken(){
    const ls = localStorage.getItem('AUTHTOKEN');
    if (ls) return ls;
    const m = document.cookie.match(/(?:^|; )AUTHTOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  async function apiFetch(path, options){
    const url = path.startsWith('http') ? path : (path.startsWith('/api') ? path : (APP.apiBase + (path.startsWith('/')? '' : '/') + path));
    const opts = Object.assign({ method: 'GET', headers: {} }, options || {});
    opts.headers = Object.assign({ 'Accept': 'application/json' }, opts.headers);
    // Attach API key when calling protected endpoints (most reads work without it)
    if (!opts.headers['apikey']) {
      opts.headers['apikey'] = 'retry123';
    }
    const t = getToken();
    if (t && !opts.headers['authtoken']) opts.headers['authtoken'] = t;
    return fetch(url, opts);
  }

  function fmtNum(n){return new Intl.NumberFormat().format(n||0)}

  // Expose
  window.Site = { apiFetch, getToken, fmtNum };

  // Header auth UI
  function syncAuthUI(){
    const loggedIn = !!getToken();
    const loginLink = document.getElementById('loginLink');
    const logoutBtn = document.getElementById('logoutBtn');
    if (!loginLink || !logoutBtn) return;
    if (loggedIn){
      loginLink.classList.add('hide');
      logoutBtn.classList.remove('hide');
    } else {
      loginLink.classList.remove('hide');
      logoutBtn.classList.add('hide');
    }
  }
  document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'logoutBtn'){
      try{
        const t = getToken();
        if (t){
          await fetch(APP.apiBase + '/user/logOutUser', { method:'POST', headers:{ apikey:'retry123', authtoken: t } });
        }
      }catch(_){}
      finally{
        localStorage.removeItem('AUTHTOKEN');
        localStorage.removeItem('SITE_USER');
        // delete cookie
        document.cookie = 'AUTHTOKEN=; Path=/; Max-Age=0; SameSite=Lax';
        syncAuthUI();
        location.href = ROUTES.reels;
      }
    }
  });
  document.addEventListener('DOMContentLoaded', syncAuthUI);
})();
