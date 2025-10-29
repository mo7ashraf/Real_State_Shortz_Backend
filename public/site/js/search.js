// Full search with tabs
(function(){
  const results = document.getElementById('searchResults');
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchQuery');
  const tabs = document.querySelectorAll('.tabs .tab');
  const openFiltersBtn = document.getElementById('openFilters');
  const drawer = document.getElementById('filterDrawer');
  const closeFiltersBtn = document.getElementById('closeFilters');
  const applyBtn = document.getElementById('applyFilters');
  const clearBtn = document.getElementById('clearFilters');
  const stateEl = document.getElementById('filterState');
  let currentTab = (window.SEARCH_INIT && window.SEARCH_INIT.tab) || 'posts';
  if (window.SEARCH_INIT && window.SEARCH_INIT.query) input.value = window.SEARCH_INIT.query;

  function setActive(tab){ tabs.forEach(t=> t.classList.toggle('active', t.dataset.tab===tab)); currentTab=tab; }
  tabs.forEach(t => t.addEventListener('click', (e)=>{ e.preventDefault(); setActive(t.dataset.tab); load(); }));

  form.addEventListener('submit', (e)=>{ e.preventDefault(); load(); });

  function readFilters(){
    try{ return JSON.parse(stateEl.value || '{}'); }catch(_){ return {}; }
  }
  function writeFilters(obj){ stateEl.value = JSON.stringify(obj||{}); }
  function setDrawerVisible(v){ if (!drawer) return; drawer.classList.toggle('hide', !v); }
  if (openFiltersBtn){ openFiltersBtn.addEventListener('click', ()=> setDrawerVisible(true)); }
  if (closeFiltersBtn){ closeFiltersBtn.addEventListener('click', ()=> setDrawerVisible(false)); }
  if (clearBtn){ clearBtn.addEventListener('click', ()=> { writeFilters({}); setDrawerVisible(false); if (currentTab==='properties') load(); }); }
  if (applyBtn){ applyBtn.addEventListener('click', ()=>{
    const next = {
      listing_type: document.getElementById('f_listing_type').value.trim(),
      property_type: document.getElementById('f_property_type').value.trim(),
      min_price: document.getElementById('f_min_price').value,
      max_price: document.getElementById('f_max_price').value,
      min_area: document.getElementById('f_min_area').value,
      max_area: document.getElementById('f_max_area').value,
      beds: document.getElementById('f_beds').value,
      baths: document.getElementById('f_baths').value,
      city: document.getElementById('f_city').value.trim(),
      district: document.getElementById('f_district').value.trim()
    };
    writeFilters(next);
    setDrawerVisible(false);
    if (currentTab==='properties') load();
  }); }

  async function load(){
    const q = input.value.trim(); if (!q){ results.innerHTML='<p class="muted">Type to search...</p>'; return; }
    results.innerHTML = 'Loading...';
    try{
      if (currentTab==='posts' || currentTab==='reels'){
        const types = currentTab==='reels' ? 'reel' : 'image,video,text';
        const data = await Site.api.post.search(q, types);
        if (!data.status) throw new Error(data.message||'Failed');
        const items = data.data || [];
        results.innerHTML='';
        const grid = document.createElement('div'); grid.className='grid three';
        items.forEach(p => {
          const a = document.createElement('a'); a.className='post-card'; a.href='#';
          if (p.thumbnail_url){ const img=document.createElement('img'); img.src=p.thumbnail_url; a.appendChild(img); }
          else if (p.video_url){ const v=document.createElement('video'); v.src=p.video_url; v.preload='metadata'; v.muted=true; v.controls=true; a.appendChild(v); }
          else { const d=document.createElement('div'); d.className='post-text'; d.textContent=p.description||''; a.appendChild(d); }
          grid.appendChild(a);
        });
        results.appendChild(grid);
      } else if (currentTab==='users'){
        const data = await Site.api.user.searchUsers(q);
        if (!data.status) throw new Error(data.message||'Failed');
        const users = data.data || [];
        const list = document.createElement('div'); list.className='card';
        users.forEach(u => {
          const row = document.createElement('div'); row.style.padding='8px 0'; row.textContent = (u.username || u.fullname || 'User'); list.appendChild(row);
        });
        results.innerHTML=''; results.appendChild(list);
      } else if (currentTab==='hashtags'){
        const data = await Site.api.hashtag.search(q);
        const tags = (data.data || []).map(x=> x.hashtag || x) ;
        const list = document.createElement('div');
        tags.forEach(h => { const a=document.createElement('a'); a.href=`/site/t/${encodeURIComponent(h)}`; a.className='chip'; a.textContent=`#${h}`; list.appendChild(a); });
        results.innerHTML=''; results.appendChild(list);
      } else if (currentTab==='properties'){
        const filters = readFilters();
        const params = Object.assign({ q: q, per_page: 24 }, filters);
        const data = await Site.api.properties.list(params);
        const items = data.data || data; // paginator or array
        const grid = document.createElement('div'); grid.className='grid three';
        (items || []).forEach(p => {
          const card = document.createElement('a'); card.className='post-card'; card.href=`/site/property/${p.id}`;
          if (p.images && p.images[0]){ const img=document.createElement('img'); img.src=(p.images[0].image_url||p.images[0].image_path); card.appendChild(img); }
          const d = document.createElement('div'); d.className='post-text'; d.textContent = (p.title||'Property'); card.appendChild(d);
          grid.appendChild(card);
        });
        results.innerHTML=''; results.appendChild(grid);
      }
    }catch(err){ results.innerHTML = `<p class="muted">${err.message||'Failed to load'}</p>`; }
  }

  document.addEventListener('DOMContentLoaded', ()=>{ setActive(currentTab); load(); });
})();
