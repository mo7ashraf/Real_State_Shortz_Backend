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
  const msg = document.getElementById('sampleMsg');
  if (btn){
    btn.addEventListener('click', async ()=>{
      btn.disabled = true; msg.textContent = 'Creating…';
      try{
        const res = await Site.api.post.addText('Hello from web sample post');
        if (!res.status){ throw new Error(res.message||'Failed to create'); }
        msg.textContent = 'Sample post created.';
        grid.innerHTML=''; await load();
      }catch(e){ msg.textContent = e.message; }
      finally{ btn.disabled = false; }
    });
  }

  async function load(){
    try{
      const types = type === 'all' ? 'image,video,text' : type;
      const json = await Site.api.post.fetchDiscover(types, 24);
      if (!json.status){ throw new Error(json.message||'Failed'); }
      const items = json.data || [];
      if (!items.length){ empty.classList.remove('hide'); return; }
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
})();
