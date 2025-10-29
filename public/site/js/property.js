/* Property details page (polished): hero gallery, stat bar, CTAs */
(function(){
  const root = document.getElementById('property');
  const postsGrid = document.getElementById('property-posts');
  if (!root) return;
  const id = parseInt(root.getAttribute('data-id'), 10);

  async function loadProperty(){
    const res = await fetch(APP.apiBase + '/properties/' + id, { headers: { Accept:'application/json' } });
    const json = await Site.toJson(res);
    const prop = json?.data || json?.property || json || {};
    if (json?.images && !prop.images) { prop.images = json.images; }
    renderProperty(prop);
  }

  async function loadPosts(){
    if (!postsGrid) return;
    try{
      const res = await fetch(APP.apiBase + `/properties/${id}/posts`, { headers: { Accept:'application/json' } });
      const items = await Site.toJson(res);
      const arr = Array.isArray(items?.data) ? items.data : (Array.isArray(items) ? items : []);
      const frag = document.createDocumentFragment();
      arr.forEach(p => {
        const card = document.createElement('a'); card.className='post-card'; card.href = p.post_type==='reel'?`/site/reel/${p.id}`:`/site/post/${p.id}`;
        if (p.thumbnail_url){ const img=document.createElement('img'); img.src=p.thumbnail_url; card.appendChild(img); }
        else if (p.video_url){ const v=document.createElement('video'); v.src=p.video_url; v.controls=true; v.muted=true; v.preload='metadata'; card.appendChild(v); }
        postsGrid.appendChild(card);
      });
      postsGrid.appendChild(frag);
    }catch(_){ /* noop */ }
  }

  function renderProperty(p){
    root.innerHTML = '';
    const title = document.createElement('h2'); title.textContent = p.title || 'Property'; root.appendChild(title);

    // Hero gallery
    if (Array.isArray(p.images) && p.images.length){
      const hero = document.createElement('div'); hero.className='prop-hero-media';
      const first = p.images[0]; const firstUrl = first.image_url || first.image_path || '';
      if (firstUrl){ const img=document.createElement('img'); img.src=firstUrl; img.alt='hero'; hero.appendChild(img); }
      root.appendChild(hero);
      if (p.images.length > 1){
        const thumbs = document.createElement('div'); thumbs.className='prop-gallery';
        p.images.slice(1,7).forEach(img=>{ const el=document.createElement('img'); el.src=img.image_url||img.image_path||''; el.alt='image'; thumbs.appendChild(el); });
        root.appendChild(thumbs);
      }
    }

    // Stat bar
    const stat = document.createElement('div'); stat.className='prop-statbar card';
    const loc = [p.city, p.district].filter(Boolean).join(', ');
    stat.innerHTML = `
      <div class="item"><strong>${Site.fmtNum(p.price_sar || 0)} SAR</strong></div>
      <div class="item">${p.bedrooms||0} bd</div>
      <div class="item">${p.bathrooms||0} ba</div>
      <div class="item">${Site.fmtNum(p.area_sqm||0)} sqm</div>
      <div class="item">${loc}</div>`;
    root.appendChild(stat);

    // CTAs
    const ctas = document.createElement('div'); ctas.className='cta-row';
    ctas.innerHTML = `
      <button class="btn primary" id="cta-contact">Contact</button>
      <button class="btn" id="cta-save">Save</button>
      <button class="btn" id="cta-share">Share</button>`;
    root.appendChild(ctas);
    document.getElementById('cta-contact')?.addEventListener('click', ()=> location.href='/site/messages');
    const saveBtn = document.getElementById('cta-save');
    const pid = p.id || p.property_id;
    // Local saved set
    const getSaved = ()=> { try{ return JSON.parse(localStorage.getItem('SAVED_PROPERTIES')||'[]'); }catch(_){ return []; } };
    const setSaved = (arr)=> localStorage.setItem('SAVED_PROPERTIES', JSON.stringify(arr));
    const isSaved = ()=> getSaved().includes(pid);
    const setBtn = ()=> { if (saveBtn) saveBtn.textContent = isSaved() ? 'Saved' : 'Save'; };
    setBtn();
    saveBtn?.addEventListener('click', async ()=>{
      if (!pid) return;
      try{
        if (!isSaved()){
          const r = await (Site.api?.properties?.save ? Site.api.properties.save(pid) : Promise.resolve({status:false}));
          // Fallback to local
          const arr = getSaved(); if (!arr.includes(pid)) arr.push(pid); setSaved(arr);
        } else {
          const r = await (Site.api?.properties?.unsave ? Site.api.properties.unsave(pid) : Promise.resolve({status:false}));
          const arr = getSaved().filter(x=>x!==pid); setSaved(arr);
        }
      }catch(_){ /* ignore */ }
      setBtn();
    });
    document.getElementById('cta-share')?.addEventListener('click', async ()=>{
      const url = `${location.origin}/site/property/${p.id||p.property_id||''}`;
      if (navigator.share){ try{ await navigator.share({ title: p.title||'Property', url }); }catch(_){}}
      else { try{ await navigator.clipboard.writeText(url);}catch(_){ } }
    });

    // Owner block
    const owner = p.owner || p.user || null;
    if (owner){
      const oc = document.createElement('div'); oc.className='card'; oc.style.margin='8px 0';
      const name = owner.username || owner.fullname || ('User #' + (owner.id||''));
      oc.innerHTML = `<div style="display:flex;align-items:center;gap:10px">
        <img src="${owner.profile_photo||owner.avatar||''}" alt="avatar" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid #eee"/>
        <div style="flex:1"><strong>${name}</strong></div>
        <a class="btn" href="/site/me">View Profile</a>
      </div>`;
      root.appendChild(oc);
    }

    if (p.description){ const d=document.createElement('p'); d.textContent=p.description; root.appendChild(d); }
    if (p.latitude && p.longitude){ const a=document.createElement('a'); a.className='btn'; a.textContent='Open in Maps'; a.target='_blank'; a.href=`https://www.google.com/maps?q=${encodeURIComponent(p.latitude+','+p.longitude)}`; root.appendChild(a); }
  }

  document.addEventListener('DOMContentLoaded', ()=>{ loadProperty(); loadPosts(); });
})();
