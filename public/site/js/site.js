// Basic helpers for the public site
(function(){
  function normalizeToken(val){
    if (!val) return '';
    try{
      const s = String(val);
      if (s.trim().startsWith('{')){
        const obj = JSON.parse(s);
        if (obj && obj.auth_token) return obj.auth_token;
      }
      return s;
    }catch(_) { return String(val); }
  }
  function getToken(){
    const ls = localStorage.getItem('AUTHTOKEN');
    if (ls) return normalizeToken(ls);
    const m = document.cookie.match(/(?:^|; )AUTHTOKEN=([^;]+)/);
    return m ? normalizeToken(decodeURIComponent(m[1])) : '';
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
  function absUrl(u){
    if (!u) return '';
    try{
      const s = String(u).trim();
      if (/^https?:\/\//i.test(s)) return s;       // absolute http(s)
      if (s.startsWith('data:')) return s;          // data URI
      // Map legacy relative paths to uploads base (S3) or site root
      const base = (window.APP && APP.uploadBase) ? String(APP.uploadBase).replace(/\/+$/, '') : '';
      const join = (rest)=> base ? (base + '/' + String(rest||'').replace(/^\/+/, '')) : ('/uploads/' + String(rest||'').replace(/^\/+/, ''));
      const p = s.replace(/^\.\//, '').replace(/^\/+/, '');
      const lower = p.toLowerCase();
      if (lower.startsWith('aqarshare/uploads/')) return join(p.substring('aqarshare/uploads/'.length));
      if (s.toLowerCase().startsWith('/aqarshare/uploads/')) return join(s.substring('/aqarshare/uploads/'.length));
      if (lower.startsWith('public/uploads/'))    return join(p.substring('public/uploads/'.length));
      if (s.toLowerCase().startsWith('/public/uploads/')) return join(s.substring('/public/uploads/'.length));
      if (lower.startsWith('uploads/'))           return join(p.substring('uploads/'.length));
      if (s.startsWith('/uploads/'))              return join(s.substring('/uploads/'.length));
      // Otherwise keep root-absolute so paths don't inherit /site prefix
      return s.startsWith('/') ? s : ('/' + p);
    }catch(_){ return u; }
  }

  async function toJson(res){
    const text = await res.text();
    const clean = text.replace(/^\uFEFF/, '').trim();
    try { return JSON.parse(clean); } catch (e) { throw new Error('Invalid JSON'); }
  }

  // Expose (preserve existing properties like Site.api)
  const PLACEHOLDER_IMG = '/assets/img/brand/bg_share_alaqarea_like_ref.png';
  window.Site = Object.assign(window.Site || {}, { apiFetch, getToken, fmtNum, toJson, absUrl, placeholder: PLACEHOLDER_IMG });

  // Normalize any legacy media URLs in DOM (img, video, source, anchor)
  function normalizeElement(el){
    try{
      if (!el || !el.getAttribute) return;
      const tag = (el.tagName||'').toUpperCase();
      const setAttr = (name)=>{
        const val = el.getAttribute(name);
        if (!val) return;
        const fixed = absUrl(val);
        if (fixed && fixed !== val) el.setAttribute(name, fixed);
      };
      if (tag === 'IMG' || tag === 'VIDEO' || tag === 'AUDIO' || tag === 'SOURCE' || tag === 'TRACK'){
        setAttr('src');
      }
      if (tag === 'IMG' || tag === 'SOURCE'){
        const ss = el.getAttribute('srcset');
        if (ss){
          const fixed = ss.split(',').map(part=>{
            const p = part.trim();
            const space = p.indexOf(' ');
            if (space === -1) return absUrl(p);
            const url = p.slice(0, space); const desc = p.slice(space+1);
            return absUrl(url) + ' ' + desc;
          }).join(', ');
          if (fixed !== ss) el.setAttribute('srcset', fixed);
        }
      }
      if (tag === 'VIDEO') setAttr('poster');
      if (tag === 'A') setAttr('href');
    }catch(_){ }
  }

  function normalizeMediaSources(root){
    const scope = root || document;
    scope.querySelectorAll('img,video,source,track,a').forEach(normalizeElement);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    normalizeMediaSources(document);
    const mo = new MutationObserver((mutations)=>{
      mutations.forEach(m=>{
        if (m.type === 'childList'){
          m.addedNodes.forEach(node=>{ if (node.nodeType===1) normalizeMediaSources(node); });
        } else if (m.type === 'attributes'){
          normalizeElement(m.target);
        }
      });
    });
    mo.observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['src','srcset','poster','href'] });
  });

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

  // Hide Messages menu if API missing
  async function hideMessagesIfUnavailable(){
    const link = document.getElementById('messagesLink');
    if (!link) return;
    try{
      const res = await fetch(APP.apiBase + '/messages/threads', { method:'GET' });
      if (!res.ok) link.classList.add('hide');
    }catch(_){ link.classList.add('hide'); }
  }
  document.addEventListener('DOMContentLoaded', hideMessagesIfUnavailable);
})();
