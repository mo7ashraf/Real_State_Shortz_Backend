// Hashtag page: list reels or feed by hashtag
(function(){
  const grid = document.getElementById('hashtagGrid');
  const tabs = document.querySelectorAll('.tabs .tab');
  const tag = (window.HASHTAG_INIT && window.HASHTAG_INIT.tag) || '';
  let type = 'reel';

  tabs.forEach(t => t.addEventListener('click', (e)=>{
    e.preventDefault(); tabs.forEach(x=>x.classList.remove('active')); t.classList.add('active');
    type = t.dataset.type; load();
  }));

  async function load(){
    grid.innerHTML='Loading...';
    try{
      const types = type==='reel' ? 'reel' : 'image,video,text';
      const data = await Site.api.hashtag.fetchPosts(tag, types);
      if (!data.status) throw new Error(data.message||'Failed');
      const items = data.data || [];
      const frag = document.createDocumentFragment();
      items.forEach(p => {
        const a = document.createElement('a'); a.className='post-card'; a.href='#';
        if (p.thumbnail_url){ const img=document.createElement('img'); img.src=p.thumbnail_url; a.appendChild(img); }
        else if (p.video_url){ const v=document.createElement('video'); v.src=p.video_url; v.muted=true; v.controls=true; v.preload='metadata'; a.appendChild(v); }
        else { const d=document.createElement('div'); d.className='post-text'; d.textContent=p.description||''; a.appendChild(d); }
        frag.appendChild(a);
      });
      grid.innerHTML=''; grid.appendChild(frag);
    }catch(err){ grid.innerHTML = `<p class="muted">${err.message||'Failed to load'}</p>`; }
  }

  document.addEventListener('DOMContentLoaded', load);
})();

