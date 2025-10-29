// Threads list (placeholder; expects /api/messages/threads if available)
(function(){
  const box = document.getElementById('threads');
  async function load(){
    try{
      const res = await Site.apiFetch('/messages/threads');
      const json = await Site.toJson(res);
      const rows = Array.isArray(json?.data) ? json.data : [];
      box.innerHTML = rows.map(t => `
        <a class="row" href="/site/messages/thread/${t.id}">
          <div><strong>${t.other_user?.username || 'User'}</strong></div>
          <div class="muted">${t.last_message?.text || ''}</div>
        </a>`).join('');
      if (!rows.length) box.innerHTML = '<div class="muted">No threads.</div>';
    }catch(_){ box.innerHTML='<div class="muted">No threads.</div>'; }
  }
  document.addEventListener('DOMContentLoaded', load);
})();


