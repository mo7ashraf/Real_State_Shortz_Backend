// Post detail with comments thread
(function(){
  const id = window.POST_ID;
  async function load(){
    const box = document.getElementById('postBox');
    const loading = document.getElementById('postLoading');
    const content = document.getElementById('postContent');
    try{
      const res = await Site.api.post.fetchPostById(id);
      if (!res.status) throw new Error(res.message||'Failed to load post');
      const p = res.data || res.post || {};
      loading.classList.add('hide'); content.classList.remove('hide');
      const m = document.getElementById('postMedia'); m.innerHTML='';
      if (p.thumbnail_url){ const img=document.createElement('img'); img.src=p.thumbnail_url; img.style.width='100%'; img.style.height='auto'; m.appendChild(img); }
      else if (p.video_url){ const v=document.createElement('video'); v.src=p.video_url; v.controls=true; v.style.width='100%'; v.preload='metadata'; m.appendChild(v); }
      document.getElementById('postDesc').textContent = p.description || '';
      await loadComments();
    }catch(e){ box.textContent = e.message; }
  }
  async function loadComments(){
    const list = document.getElementById('commentsList');
    list.textContent = 'Loading…';
    try{
      const res = await Site.api.comment.fetch(id);
      if (!res.status) throw new Error(res.message||'Failed');
      const comments = res.data || [];
      const frag = document.createDocumentFragment();
      comments.forEach(c => { const row=document.createElement('div'); row.style.padding='8px 0'; row.innerHTML = `<strong>${(c.user?.username||'User')}</strong><div>${(c.comment||'')}</div>`; frag.appendChild(row); });
      list.innerHTML=''; list.appendChild(frag);
    }catch(e){ list.textContent = e.message; }
  }
  async function sendComment(){
    const inp = document.getElementById('commentInput');
    const text = inp.value.trim(); if (!text) return;
    try{ await Site.api.comment.add(id, text); inp.value=''; await loadComments(); }catch(_){ /* noop */ }
  }
  document.addEventListener('DOMContentLoaded', load);
  document.getElementById('commentSend').addEventListener('click', sendComment);
  document.getElementById('commentInput').addEventListener('keypress', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendComment(); }});
})();

