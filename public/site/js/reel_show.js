// Minimal single reel page
(function(){
  const root = document.getElementById('reelPlayer');
  if (!root) return;
  const id = parseInt(root.getAttribute('data-id'), 10);
  async function load(){
    root.innerHTML = 'Loading…';
    try{
      const res = await Site.api.post.fetchPostById(id);
      if (!res.status) throw new Error(res.message||'Failed');
      const p = res.data || {};
      const v = p.video_url || p.video || '';
      root.innerHTML = v ? `<video src="${v}" controls playsinline preload="metadata" style="width:100%;max-height:70vh"></video>` : '<div class="muted">No video</div>';
    }catch(e){ root.innerHTML = `<div class="muted">${e.message||'Failed to load'}</div>`; }
  }
  document.addEventListener('DOMContentLoaded', load);
})();

