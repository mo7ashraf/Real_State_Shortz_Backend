// Tabs for /site/me: Reels, Posts, Properties
(function(){
  const container = document.getElementById('meTabContent');
  const tabs = document.querySelectorAll('.tabs .tab');
  let current = 'reels';

  tabs.forEach(t => {
    if (t.getAttribute('href') === '#'){
      t.addEventListener('click', (e)=>{ e.preventDefault(); tabs.forEach(x=>x.classList.remove('active')); t.classList.add('active'); current=t.dataset.tab; load(); });
    }
  });

  async function load(){
    container.innerHTML='Loading...';
    try{
      const me = await Site.api.user.fetchDetails();
      if (!me.status) throw new Error(me.message||'Failed to load user');
      const raw = me.data || {};
      const u = raw.user || raw;
      const uid = u.id || u.user_id || raw.id || raw.user_id;
      if (!uid) throw new Error('The user id field is required.');
      if (current==='reels'){
        const data = await Site.api.post.fetchUserPosts(uid, 'reel');
        if (!data.status) throw new Error(data.message||'Failed');
        renderPosts(data.data||[]);
      } else if (current==='posts'){
        const data = await Site.api.post.fetchUserPosts(uid, 'all');
        if (!data.status) throw new Error(data.message||'Failed');
        renderPosts(data.data||[]);
      } else if (current==='properties'){
        const data = await Site.api.properties.listByUser(uid, { per_page: 24 });
        renderProperties((data.data||data)||[]);
      }
    }catch(e){ container.innerHTML = `<p class="muted">${e.message}</p>`; }
  }

  function renderPosts(items){
    const frag = document.createDocumentFragment();
    (items||[]).forEach(p => {
      const a=document.createElement('a'); a.className='post-card'; a.href=`/site/post/${p.id||''}`;
      if (p.thumbnail_url){ const img=document.createElement('img'); img.src=p.thumbnail_url; a.appendChild(img); }
      else if (p.video_url){ const v=document.createElement('video'); v.src=p.video_url; v.muted=true; v.preload='metadata'; v.controls=true; a.appendChild(v); }
      else { const d=document.createElement('div'); d.className='post-text'; d.textContent=p.description||''; a.appendChild(d); }
      frag.appendChild(a);
    });
    container.innerHTML=''; container.appendChild(frag);
  }
  function renderProperties(list){
    const frag = document.createDocumentFragment();
    (list||[]).forEach(p => {
      const a=document.createElement('a'); a.className='post-card'; a.href=`/site/property/${p.id}`;
      if (p.images && p.images[0]){ const img=document.createElement('img'); img.src=(p.images[0].image_url||p.images[0].image_path); a.appendChild(img); }
      const d=document.createElement('div'); d.className='post-text'; d.textContent=p.title||'Property'; a.appendChild(d);
      frag.appendChild(a);
    });
    container.innerHTML=''; container.appendChild(frag);
  }

  document.addEventListener('DOMContentLoaded', load);
})();
