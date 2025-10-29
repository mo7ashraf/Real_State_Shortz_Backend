/* Minimal Posts grid */
(function(){
  const grid = document.getElementById('posts-grid');
  const empty = document.getElementById('posts-empty');
  const tabs = document.querySelectorAll('.tabs .tab');
  let type = 'all';

  tabs.forEach(t => t.addEventListener('click', (e) => {
    e.preventDefault();
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    type = t.dataset.type;
    grid.innerHTML='';
    load();
  }));

  const btn = document.getElementById('btnCreateSample');
  const btnSeed = document.getElementById('btnSeedPosts');
  const msg = document.getElementById('sampleMsg');
  if (btn){
    btn.addEventListener('click', async ()=>{
      btn.disabled = true; msg.textContent = 'Creating...';
      try{
        const res = await Site.api.post.addText('Hello from web sample post');
        if (!res.status){ throw new Error(res.message||'Failed to create'); }
        msg.textContent = 'Sample post created.';
        grid.innerHTML=''; await load();
      }catch(e){ msg.textContent = e.message; }
      finally{ btn.disabled = false; }
    });
  }
  if (btnSeed){
    btnSeed.addEventListener('click', async ()=>{
      btnSeed.disabled = true; msg.textContent = 'Seeding 5 posts...';
      try{
        for (let i=1; i<=5; i++){
          const res = await Site.api.post.addText(`Sample post #${i} — seeded from web`);
          if (!res.status){ throw new Error(res.message||'Failed to create'); }
        }
        msg.textContent = 'Seed complete.';
        grid.innerHTML=''; await load();
      }catch(e){ msg.textContent = e.message; }
      finally{ btnSeed.disabled = false; }
    });
  }

  async function load(){
    try{
      if (type === 'properties'){
        const data = await Site.api.properties.list({ per_page: 24 });
        const items = data.data || data || [];
        if (!items || !items.length){ empty.classList.remove('hide'); grid.innerHTML=''; return; }
        empty.classList.add('hide');
        const frag = document.createDocumentFragment();
        items.forEach(p => {
          const a = document.createElement('a'); a.className='post-card'; a.href = `/site/property/${p.id}`;
          const imgUrl = (p.images && p.images[0]) ? (p.images[0].image_url||p.images[0].image_path) : '';
          if (imgUrl){ const img=document.createElement('img'); img.src=imgUrl; a.appendChild(img); }
          const d=document.createElement('div'); d.className='post-text'; d.textContent = (p.title || 'Property'); a.appendChild(d);
          frag.appendChild(a);
        });
        grid.innerHTML=''; grid.appendChild(frag);
        return;
      }

      const types = type === 'all' ? 'image,video,text' : type;
      const json = await Site.api.post.fetchDiscover(types, 24);
      if (!json.status){ throw new Error(json.message||'Failed'); }
      const items = Array.isArray(json.data) ? json.data : (Array.isArray(json.data?.data) ? json.data.data : []);
      if (!items.length){
        empty.classList.remove('hide');
        if (btnSeed && !btnSeed.disabled) {
          msg.textContent = 'No posts yet — seeding a few sample posts...';
          const flag = localStorage.getItem('AUTOSEEDED_POSTS');
          if (!flag){
            try{
              for (let i=1; i<=3; i++){
                const r = await Site.api.post.addText(`Auto-seeded post #${i}`);
                if (!r.status) throw new Error(r.message||'Failed');
              }
              localStorage.setItem('AUTOSEEDED_POSTS', '1');
              grid.innerHTML=''; msg.textContent='Seeded 3 sample posts.'; await load();
              return;
            }catch(_){ /* ignore and leave empty */ }
          }
        }
        return;
      }
      empty.classList.add('hide');
      const frag = document.createDocumentFragment();
      items.forEach(p => {
        const card = document.createElement('a');
        card.className = 'post-card';
        card.href = '#';
        if (p.thumbnail_url){
          const img = document.createElement('img');
          img.src = p.thumbnail_url; img.alt = 'thumb';
          card.appendChild(img);
        } else if (p.video_url) {
          const v = document.createElement('video'); v.src = p.video_url; v.muted=true; v.controls=true; v.preload='metadata';
          card.appendChild(v);
        } else {
          const div = document.createElement('div');
          div.className='post-text';
          div.textContent = (p.description||'');
          card.appendChild(div);
        }
        frag.appendChild(card);
      });
      grid.appendChild(frag);
    } catch(err){
      empty.classList.remove('hide');
      empty.textContent = 'Failed to load posts';
    }
  }

  document.addEventListener('DOMContentLoaded', load);
  // Stories rail
  document.addEventListener('DOMContentLoaded', async ()=>{
    const rail = document.getElementById('storiesRail'); if (!rail) return;
    try{
      const fd = new FormData();
      const res = await fetch(APP.apiBase + '/post/fetchStory', { method:'POST', headers: { 'X-API-KEY':'retry123', , authtoken: Site.getToken() }, body: fd });
      const json = await res.json();
      if (!json.status) { rail.textContent = ''; return; }
      const list = json.data || [];
      rail.innerHTML = '';
      list.forEach(s => {
        const d = document.createElement('div'); d.style.display='inline-block'; d.style.margin='0 8px'; d.style.textAlign='center';
        const img = document.createElement('img'); img.src = s.thumbnail_url || s.image || ''; img.style.width='48px'; img.style.height='48px'; img.style.borderRadius='50%'; img.style.objectFit='cover'; img.alt='story';
        const cap = document.createElement('div'); cap.className='small muted'; cap.textContent = s.username || '';
        d.appendChild(img); d.appendChild(cap); rail.appendChild(d);
      });
    }catch(_){ rail.textContent=''; }
  });
})();



