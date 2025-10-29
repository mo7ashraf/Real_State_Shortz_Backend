/* Unified Posts feed: posts + reels + properties with premium cards */
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
          const res = await Site.api.post.addText(`Sample post #${i} - seeded from web`);
          if (!res.status){ throw new Error(res.message||'Failed to create'); }
        }
        msg.textContent = 'Seed complete.';
        grid.innerHTML=''; await load();
      }catch(e){ msg.textContent = e.message; }
      finally{ btnSeed.disabled = false; }
    });
  }

  function renderPropertyCard(p){
    const id = p.id || p.property_id;
    const imgObj = (p.images && p.images[0]) || {};
    const imgUrl = Site.absUrl(imgObj.image_url || imgObj.image_path || '') || Site.placeholder;
    const card = document.createElement('a'); card.className='card-shell card-property'; card.href = `/site/property/${id}`;
    const media = document.createElement('div'); media.className='card-media';
    { const img=document.createElement('img'); img.src=imgUrl || Site.placeholder; media.appendChild(img); }
    if (p.price_sar){ const badge=document.createElement('span'); badge.className='card-badge'; badge.textContent = `${Site.fmtNum(p.price_sar)} SAR`; media.appendChild(badge); }
    card.appendChild(media);
    const body=document.createElement('div'); body.className='card-body';
    const title=document.createElement('div'); title.className='card-title'; title.textContent=(p.title||'Property'); body.appendChild(title);
    const meta=document.createElement('div'); meta.className='card-meta';
    const loc=[p.city,p.district].filter(Boolean).join(', ');
    if (loc){ const span=document.createElement('span'); span.textContent=loc; meta.appendChild(span); }
    if (p.area_sqm){ const span=document.createElement('span'); span.textContent=`${Site.fmtNum(p.area_sqm)} sqm`; meta.appendChild(span); }
    if (p.bedrooms!=null){ const span=document.createElement('span'); span.textContent=`${p.bedrooms} bd`; meta.appendChild(span); }
    if (p.bathrooms!=null){ const span=document.createElement('span'); span.textContent=`${p.bathrooms} ba`; meta.appendChild(span); }
    body.appendChild(meta);
    card.appendChild(body);
    return card;
  }

  function renderPostCard(p, kind){
    const isReel = kind==='reel';
    const card=document.createElement('a'); card.className = `card-shell ${isReel?'card-reel card-post':'card-post'}`; card.href = isReel?`/site/reel/${p.id}`:`/site/post/${p.id}`;
    const media=document.createElement('div'); media.className='card-media';
    if (p.thumbnail_url){ const img=document.createElement('img'); img.src=Site.absUrl(p.thumbnail_url); media.appendChild(img);} else if (p.video_url){ const v=document.createElement('video'); v.src=Site.absUrl(p.video_url); v.muted=true; v.preload='metadata'; media.appendChild(v); }
    if (isReel){ const play=document.createElement('div'); play.className='play'; play.textContent='Play'; media.appendChild(play); }
    card.appendChild(media);
    const body=document.createElement('div'); body.className='card-body';
    const title=document.createElement('div'); title.className='card-title'; title.textContent=p.description||''; body.appendChild(title);
    const meta=document.createElement('div'); meta.className='card-meta'; if (p.user && p.user.username){ const span=document.createElement('span'); span.textContent='@'+p.user.username; meta.appendChild(span);} body.appendChild(meta);
    card.appendChild(body);
    return card;
  }

  async function load(){
    try{
      if (type === 'properties'){
        const data = await Site.api.properties.list({ per_page: 24 });
        const items = data.data || data || [];
        if (!items || !items.length){ empty.classList.remove('hide'); grid.innerHTML=''; return; }
        empty.classList.add('hide');
        const frag = document.createDocumentFragment();
        items.forEach(p => frag.appendChild(renderPropertyCard(p)));
        grid.innerHTML=''; grid.appendChild(frag);
        return;
      }

      if (type === 'all'){
        const [postsResp, propsResp] = await Promise.all([
          Site.api.post.fetchDiscover('image,video,text,reel', 24),
          Site.api.properties.list({ per_page: 24 })
        ]);
        if (!postsResp.status){ throw new Error(postsResp.message||'Failed'); }
        const postItems = Array.isArray(postsResp.data) ? postsResp.data : (Array.isArray(postsResp.data?.data) ? postsResp.data.data : []);
        const propItems = propsResp.data || propsResp || [];
        const feed = [];
        (postItems||[]).forEach(p => {
          const isReel = (String(p.post_type||'').toLowerCase()==='reel' || !!p.is_reel || (!!p.video_url && !p.thumbnail_url));
          feed.push({ kind: isReel?'reel':'post', created_at: p.created_at || null, id: p.id, raw: p });
        });
        (propItems||[]).forEach(p => { feed.push({ kind: 'property', created_at: p.created_at || null, id: p.id || p.property_id, raw: p }); });
        feed.sort((a,b)=>{ const da=a.created_at?new Date(a.created_at).getTime():(a.id||0); const db=b.created_at?new Date(b.created_at).getTime():(b.id||0); return db-da; });
        if (!feed.length){ empty.classList.remove('hide'); grid.innerHTML=''; return; }
        empty.classList.add('hide');
        const frag = document.createDocumentFragment();
        feed.forEach(item => {
          if (item.kind==='property') frag.appendChild(renderPropertyCard(item.raw));
          else frag.appendChild(renderPostCard(item.raw, item.kind));
        });
        grid.innerHTML=''; grid.appendChild(frag);
        return;
      }

      const json = await Site.api.post.fetchDiscover(type, 24);
      if (!json.status){ throw new Error(json.message||'Failed'); }
      const items = Array.isArray(json.data) ? json.data : (Array.isArray(json.data?.data) ? json.data.data : []);
      if (!items.length){
        empty.classList.remove('hide');
        if (btnSeed && !btnSeed.disabled) {
          msg.textContent = 'No posts yet - seeding a few sample posts...';
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
            }catch(_){ /* ignore */ }
          }
        }
        return;
      }
      empty.classList.add('hide');
      const frag = document.createDocumentFragment();
      items.forEach(p => {
        const isReel = (String(p.post_type||'').toLowerCase()==='reel' || !!p.is_reel || (!!p.video_url && !p.thumbnail_url)) || (type==='reel');
        frag.appendChild(renderPostCard(p, isReel?'reel':'post'));
      });
      grid.appendChild(frag);
    } catch(err){
      // Fallbacks
      try{
        if (type === 'properties'){
          const res = await Site.apiFetch(APP.apiBase + '/properties?per_page=24');
          const json = await Site.toJson(res);
          const items = json.data || json || [];
          if (!items.length){ empty.classList.remove('hide'); grid.innerHTML=''; return; }
          empty.classList.add('hide');
          const frag = document.createDocumentFragment();
          items.forEach(p => frag.appendChild(renderPropertyCard(p)));
          grid.innerHTML=''; grid.appendChild(frag);
          return;
        }
        if (type === 'all'){
          const [postsRes, propsRes] = await Promise.all([
            Site.apiFetch(APP.apiBase + '/posts?type=all&limit=24'),
            Site.apiFetch(APP.apiBase + '/properties?per_page=24')
          ]);
          const postsJson = await Site.toJson(postsRes);
          const propsJson = await Site.toJson(propsRes);
          const postItems = Array.isArray(postsJson?.data) ? postsJson.data : (Array.isArray(postsJson) ? postsJson : []);
          const propItems = propsJson.data || propsJson || [];
          const feed = [];
          (postItems||[]).forEach(p => { const isReel=(String(p.post_type||'').toLowerCase()==='reel'); feed.push({ kind: isReel?'reel':'post', created_at: p.created_at||null, id:p.id, raw:p }); });
          (propItems||[]).forEach(p => feed.push({ kind: 'property', created_at: p.created_at||null, id: p.id||p.property_id, raw:p }));
          feed.sort((a,b)=>{ const da=a.created_at?new Date(a.created_at).getTime():(a.id||0); const db=b.created_at?new Date(b.created_at).getTime():(b.id||0); return db-da; });
          if (!feed.length){ empty.classList.remove('hide'); grid.innerHTML=''; return; }
          empty.classList.add('hide');
          const frag = document.createDocumentFragment();
          feed.forEach(item => { if (item.kind==='property') frag.appendChild(renderPropertyCard(item.raw)); else frag.appendChild(renderPostCard(item.raw, item.kind)); });
          grid.innerHTML=''; grid.appendChild(frag);
          return;
        }
        const resp = await Site.apiFetch(APP.apiBase + `/posts?type=${encodeURIComponent(type)}&limit=24`);
        const j = await Site.toJson(resp);
        const items = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : []);
        if (!items.length){ empty.classList.remove('hide'); grid.innerHTML=''; return; }
        empty.classList.add('hide');
        const frag = document.createDocumentFragment();
        items.forEach(p => { const isReel=(String(p.post_type||'').toLowerCase()==='reel') || (type==='reel'); frag.appendChild(renderPostCard(p, isReel?'reel':'post')); });
        grid.innerHTML=''; grid.appendChild(frag);
      }catch(_){ empty.classList.remove('hide'); empty.textContent = (err && err.message) ? err.message : 'Failed to load posts'; }
    }
  }

  document.addEventListener('DOMContentLoaded', load);
  // Stories rail
  document.addEventListener('DOMContentLoaded', async ()=>{
    const rail = document.getElementById('storiesRail'); if (!rail) return;
    try{
      const fd = new FormData();
      const res = await fetch(APP.apiBase + '/post/fetchStory', { method:'POST', headers: { 'X-API-KEY':'retry123', authtoken: Site.getToken() }, body: fd });
      const json = await Site.toJson(res);
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

  // Auto play/pause videos in feed
  (function(){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        const v = e.target;
        if (e.isIntersecting){ try{ v.play(); }catch(_){ } }
        else { try{ v.pause(); }catch(_){ } }
      });
    }, { threshold: 0.6 });
    const scan = ()=>{ grid.querySelectorAll('video').forEach(v=> io.observe(v)); };
    document.addEventListener('DOMContentLoaded', scan);
    const mo = new MutationObserver(()=> scan());
    mo.observe(grid, { childList:true, subtree:true });
  })();
})();
