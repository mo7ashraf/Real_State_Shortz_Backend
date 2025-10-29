// Reel detail: full-bleed video with overlay, actions, and property chip
(function(){
  const root = document.getElementById('reelView');
  if (!root) return;
  const id = parseInt(root.getAttribute('data-id'), 10);

  function propChipHTML(p){
    const meta = p.metadata || {};
    const propId = p.property_id || meta.property_id;
    const title = meta.property_title || 'Property';
    const where = [meta.city, meta.district].filter(Boolean).join(', ');
    if (!propId && !where && title==='Property') return '';
    const href = propId ? `/site/property/${propId}` : '#';
    return `<a class="prop-card" href="${href}"><div class="title">${title}</div><div class="meta">${where}</div></a>`;
  }

  async function load(){
    root.innerHTML = '<div class="muted">Loading…</div>';
    try{
      const res = await Site.api.post.fetchPostById(id);
      if (!res.status) throw new Error(res.message||'Failed');
      const p = res.data || {};
      const vsrc = p.video_url || p.video || '';
      const user = p.user || p.owner || {};

      const svg = (name)=>({
        heart:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.1 21s-6.4-4.3-9.1-7c-2.2-2.2-2.2-5.8 0-8.1 2.1-2.1 5.5-2.1 7.6 0l1.5 1.5 1.5-1.5c2.1-2.1 5.5-2.1 7.6 0 2.2 2.2 2.2 5.8 0 8.1-2.7 2.7-9.1 7-9.1 7z"/></svg>`,
        comment:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 6a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v7a4 4 0 0 0 4 4h6l4 3v-3h0a4 4 0 0 0 4-4V6z"/></svg>`,
        save:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"/></svg>`,
        share:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a3 3 0 1 0-2.8-4H15a3 3 0 0 0 .2 1l-7 3.5a3 3 0 0 0-5.2 2 3 3 0 0 0 5 2.2l7 3.5A3 3 0 0 0 15 18a3 3 0 1 0 .2 1h0A3 3 0 0 0 18 16a3 3 0 0 0-2.8 2l-7-3.5a3 3 0 0 0 0-1l7-3.5A3 3 0 0 0 18 8z"/></svg>`,
        home:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 8h-3v10h-5V15H11v6H6V11H3l9-8z"/></svg>`
      })[name]||'';
      root.innerHTML = `
        <section class="reel-card" data-id="${p.id||id}">
          <video class="reel-video" src="${vsrc}" playsinline controls preload="metadata"></video>
          <div class="reel-overlay"></div>
          <div class="reel-user">
            <img src="${user.profile_photo||user.avatar||''}" alt="avatar">
            <div class="name">@${user.username || user.fullname || 'user'}</div>
          </div>
          <div class="reel-actions">
            <div class="group"><button class="icon-btn" id="rd-like" aria-label="Like">${svg('heart')}</button></div>
            <div class="group"><button class="icon-btn" id="rd-comment" aria-label="Comments">${svg('comment')}</button></div>
            <div class="group"><button class="icon-btn" id="rd-save" aria-label="Save">${svg('save')}</button></div>
            <div class="group"><button class="icon-btn" id="rd-share" aria-label="Share">${svg('share')}</button></div>
            <div class="group"><button class="icon-btn" id="rd-prop" aria-label="Property">${svg('home')}</button></div>
            <div class="group"><button class="icon-btn" id="rd-mute" aria-label="Mute">🔇</button></div>
          </div>
        </section>
        <div class="reel-meta card">
          <div class="desc">${p.description||''}</div>
          <div class="loc muted">${(p.metadata ? [p.metadata.city, p.metadata.district].filter(Boolean).join(', ') : '')}</div>
        </div>`;

      // Wire actions
      const video = root.querySelector('.reel-video');
      const btnLike = document.getElementById('rd-like');
      const btnShare = document.getElementById('rd-share');
      const btnMute = document.getElementById('rd-mute');
      const btnProp = document.getElementById('rd-prop');
      const btnSave = document.getElementById('rd-save');
      const btnComment = document.getElementById('rd-comment');
      video?.addEventListener('play', ()=> (p.id && Site.api.post.incViews(p.id)));
      btnMute?.addEventListener('click', ()=>{ video.muted = !video.muted; btnMute.textContent = video.muted ? '🔇' : '🔊'; });
      btnLike?.addEventListener('click', async ()=>{ try{ await Site.api.post.like(p.id); btnLike.classList.add('active'); }catch(_){ } });
      btnShare?.addEventListener('click', async ()=>{
        try{ await Site.api.post.incShare(p.id); }catch(_){}
        const url = `${location.origin}/site/reel/${p.id}`;
        if (navigator.share){ try{ await navigator.share({ title: document.title, url }); }catch(_){}}
        else { try{ await navigator.clipboard.writeText(url);}catch(_){ } }
      });
      const propId = p.property_id || (p.property && p.property.id) || (p.metadata && (p.metadata.property_id || p.metadata.propertyId)) || (p.metadata && p.metadata.property && p.metadata.property.id) || null;
      if (propId) { btnProp?.addEventListener('click', ()=>{ location.href = `/site/property/${propId}`; }); }
      else { btnProp?.setAttribute('disabled','disabled'); btnProp.title = 'No property'; }
      let saved = !!p.is_saved; const setSave = ()=> btnSave?.classList.toggle('active', saved);
      setSave();
      btnSave?.addEventListener('click', async ()=>{
        try{ if (!saved){ await Site.api.post.save(p.id); saved=true; } else { await Site.api.post.unsave(p.id); saved=false; } }catch(_){ }
        setSave();
      });
      btnComment?.addEventListener('click', ()=>{ /* could open comments drawer like in feed */ });
    }catch(e){ root.innerHTML = `<div class="muted">${e.message||'Failed to load'}</div>`; }
  }
  document.addEventListener('DOMContentLoaded', load);
})();
