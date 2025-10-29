// Thread view (placeholder; expects /api/messages endpoints)
(function(){
  const root = document.getElementById('chat');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatText');
  if (!root) return;
  const id = parseInt(root.getAttribute('data-id'),10);

  async function load(){
    try{
      const res = await Site.apiFetch(`/messages/thread/${id}`);
      const json = await Site.toJson(res);
      const msgs = Array.isArray(json?.data) ? json.data : [];
      root.innerHTML = msgs.map(m => `
        <div class="msg ${m.mine?'me':'them'}">
          <div class="bubble">${m.text||''}</div>
          <div class="when muted">${new Date(m.created_at||Date.now()).toLocaleTimeString()}</div>
        </div>`).join('');
      root.scrollTop = root.scrollHeight;
    }catch(_){ root.innerHTML='<div class="muted">Cannot load messages.</div>'; }
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const text = input.value.trim(); if (!text) return; input.value='';
    try{
      await Site.apiFetch('/messages/send', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ thread_id:id, text }) });
      load();
    }catch(_){ }
  });

  document.addEventListener('DOMContentLoaded', ()=>{ load(); setInterval(load, 4500); });
})();


