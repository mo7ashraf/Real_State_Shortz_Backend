/* Reels feed with overlay and actions (robust to different containers) */
(function(){
  const root = document.getElementById('reelsRoot');
  let list = document.getElementById('reels-list');
  let empty = document.getElementById('reels-empty');

  // Build missing containers if the page only provides #reelsRoot
  if (!list) {
    list = document.createElement('div');
    list.id = 'reels-list';
    list.className = 'reels-list';
    if (root) { root.innerHTML = ''; root.appendChild(list); }
    else { document.body.appendChild(list); }
  }
  if (!empty) {
    empty = document.createElement('div');
    empty.id = 'reels-empty';
    empty.className = 'muted hide';
    empty.textContent = 'No reels yet.';
    if (root) { root.appendChild(empty); }
    else if (list && list.parentNode) { list.parentNode.insertBefore(empty, list.nextSibling); }
  }

  async function load(){
    try{
      const json = await Site.api.post.fetchDiscover('reel', 20);
      if (!json.status){ throw new Error(json.message||'Failed'); }
      const items = Array.isArray(json.data) ? json.data : (Array.isArray(json.data?.data) ? json.data.data : []);
      if (!items.length){ if (empty) empty.classList.remove('hide'); return; }
      const frag = document.createDocumentFragment();
      items.forEach(p => {
        const card = document.createElement('div');
        card.className = 'reel-card';

        // video
        const v = document.createElement('video');
        v.src = Site.absUrl(p.video_url || p.video || '');
        v.controls = true;
        v.preload = 'metadata';
        v.playsInline = true;
        v.muted = true;
        v.className = 'reel-video';
        v.addEventListener('play', ()=> p.id && Site.api.post.incViews(p.id));
        card.appendChild(v);

        // overlay layers
        const overlay = document.createElement('div'); overlay.className='reel-overlay'; card.appendChild(overlay);

        // user header
        const user = p.user || p.owner || {};
        const hdr = document.createElement('div'); hdr.className = 'reel-user';
        const ava = document.createElement('img'); ava.alt='avatar';
        ava.src = Site.absUrl(user.profile_photo || user.avatar || '');
        const name = document.createElement('div'); name.className='name';
        name.textContent = user.username || user.fullname || 'User';
        hdr.appendChild(ava); hdr.appendChild(name);
        card.appendChild(hdr);

        // bottom-left action row (overlay)
        const actions = document.createElement('div'); actions.className='reel-actions';
        const svg = (name)=>({
          heart:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.1 21s-6.4-4.3-9.1-7c-2.2-2.2-2.2-5.8 0-8.1 2.1-2.1 5.5-2.1 7.6 0l1.5 1.5 1.5-1.5c2.1-2.1 5.5-2.1 7.6 0 2.2 2.2 2.2 5.8 0 8.1-2.7 2.7-9.1 7-9.1 7z"/></svg>`,
          comment:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 6a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v7a4 4 0 0 0 4 4h6l4 3v-3h0a4 4 0 0 0 4-4V6z"/></svg>`,
          save:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"/></svg>`,
          share:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a3 3 0 1 0-2.8-4H15a3 3 0 0 0 .2 1l-7 3.5a3 3 0 0 0-5.2 2 3 3 0 0 0 5 2.2l7 3.5A3 3 0 0 0 15 18a3 3 0 1 0 .2 1h0A3 3 0 0 0 18 16a3 3 0 0 0-2.8 2l-7-3.5a3 3 0 0 0 0-1l7-3.5A3 3 0 0 0 18 8z"/></svg>`,
          home:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 8h-3v10h-5V15H11v6H6V11H3l9-8z"/></svg>`
        })[name]||'';
        const group = (btn, count)=>{
          const wrap=document.createElement('div'); wrap.className='group'; wrap.appendChild(btn); if(count){ const c=document.createElement('div'); c.className='count'; c.textContent=count; wrap.appendChild(c);} return wrap; };
        const btnLike = document.createElement('button'); btnLike.className='icon-btn'; btnLike.setAttribute('aria-label','Like'); btnLike.innerHTML = svg('heart');
        const btnComment = document.createElement('button'); btnComment.className='icon-btn'; btnComment.setAttribute('aria-label','Comments'); btnComment.innerHTML = svg('comment');
        const btnSave = document.createElement('button'); btnSave.className='icon-btn'; btnSave.setAttribute('aria-label','Save'); btnSave.innerHTML = svg('save');
        const btnShare = document.createElement('button'); btnShare.className='icon-btn'; btnShare.setAttribute('aria-label','Share'); btnShare.innerHTML = svg('share');
        const btnProp = document.createElement('button'); btnProp.className='icon-btn'; btnProp.setAttribute('aria-label','Property'); btnProp.innerHTML = svg('home');
        const likes = p.like_count || p.likes || p.total_likes || '';
        const comments = p.comments_count || p.total_comments || '';
        actions.append(
          group(btnLike, likes && String(likes)),
          group(btnComment, comments && String(comments)),
          group(btnSave, ''),
          group(btnShare, ''),
          group(btnProp, '')
        );
        card.appendChild(actions);

        // state (best-effort)
        let liked = !!p.is_liked; let saved = !!p.is_saved;
        if (liked) btnLike.classList.add('active');
        if (saved) btnSave.classList.add('active');

        btnLike.addEventListener('click', async () => {
          try{ if (!liked){ await Site.api.post.like(p.id); liked=true; btnLike.classList.add('active'); } else { await Site.api.post.dislike(p.id); liked=false; btnLike.classList.remove('active'); } }catch(_){ }
        });
        btnSave.addEventListener('click', async () => {
          try{ if (!saved){ await Site.api.post.save(p.id); saved=true; btnSave.classList.add('active'); } else { await Site.api.post.unsave(p.id); saved=false; btnSave.classList.remove('active'); } }catch(_){ }
        });
        btnShare.addEventListener('click', async () => {
          try{ await Site.api.post.incShare(p.id); }catch(_){ }
          const url = location.origin+`/site/reel/${p.id}`;
          if (navigator.share){ try{ await navigator.share({ title: document.title, url }); }catch(_){}}
          else { try{ await navigator.clipboard.writeText(url);}catch(_){ } }
        });
        btnComment.addEventListener('click', () => openComments(p.id));

        // property navigate (robust id detection)
        const propId = p.property_id || (p.property && p.property.id) || (p.metadata && (p.metadata.property_id || p.metadata.propertyId)) || (p.metadata && p.metadata.property && p.metadata.property.id) || null;
        const hasMeta = p.metadata && (p.metadata.property_title || p.metadata.city || p.metadata.district);
        if (propId){ btnProp.addEventListener('click', ()=> { location.href = `/site/property/${propId}`; }); }
        else { btnProp.setAttribute('disabled','disabled'); btnProp.title = hasMeta ? 'No property link' : 'No property'; }

        // Meta below the video (desc then address)
        const meta = document.createElement('div'); meta.className='reel-meta card';
        const desc = document.createElement('div'); desc.className='desc'; desc.textContent = (p.description||''); meta.appendChild(desc);
        const where = p.metadata ? [p.metadata.city, p.metadata.district].filter(Boolean).join(', ') : '';
        const loc = document.createElement('div'); loc.className='loc muted'; loc.textContent = where; meta.appendChild(loc);
        card.appendChild(meta);

        frag.appendChild(card);
      });
      list.appendChild(frag);
    }catch(err){
      // Fallback to public posts endpoint if discover fails (missing auth, etc.)
      try{
        const res = await Site.apiFetch('/posts?type=reel&limit=20');
        const json = await Site.toJson(res);
        const items = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
        if (!items.length){ if (empty){ empty.classList.remove('hide'); empty.textContent = 'No reels yet.'; } return; }
        const frag = document.createDocumentFragment();
        items.forEach(p => {
          const card = document.createElement('div');
          card.className = 'reel-card';
          const v = document.createElement('video');
          v.src = Site.absUrl(p.video_url || p.video || '');
          v.controls = true; v.preload='metadata'; v.playsInline=true; v.muted=true; v.className='reel-video';
          card.appendChild(v);
          const info = document.createElement('div'); info.className='reel-info';
          const desc = document.createElement('div'); desc.className='desc'; desc.textContent = (p.description||'');
          info.appendChild(desc); card.appendChild(info);
          frag.appendChild(card);
        });
        list.appendChild(frag);
        if (empty) empty.classList.add('hide');
      }catch(_){ if (empty){ empty.classList.remove('hide'); empty.textContent = (err && err.message) ? err.message : 'Failed to load reels'; } }
    }
  }

  async function openComments(postId){
    let drawer = document.getElementById('comment-drawer');
    if (!drawer){
      drawer = document.createElement('div'); drawer.id='comment-drawer'; drawer.className='comment-drawer';
      drawer.innerHTML = `
        <div class="hdr"><strong>Comments</strong><button id="cd-close" class="btn">Close</button></div>
        <div class="list" id="cd-list"></div>
        <div class="composer"><input id="cd-input" placeholder="Add a comment..."/><button id="cd-send">Send</button></div>
      `;
      document.body.appendChild(drawer);
      drawer.querySelector('#cd-close').addEventListener('click', ()=> drawer.classList.remove('open'));
      drawer.querySelector('#cd-send').addEventListener('click', async ()=> {
        const text = drawer.querySelector('#cd-input').value.trim(); if (!text) return;
        try{ await Site.api.comment.add(postId, text); drawer.querySelector('#cd-input').value=''; await loadComments(postId); }catch(_){ }
      });
      drawer.querySelector('#cd-input').addEventListener('keypress', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); drawer.querySelector('#cd-send').click(); }});
    }
    await loadComments(postId);
    drawer.classList.add('open');
  }

  async function loadComments(postId){
    const drawer = document.getElementById('comment-drawer');
    const listEl = drawer.querySelector('#cd-list');
    listEl.innerHTML = 'Loading...';
    try{
      const res = await Site.api.comment.fetch(postId);
      if (!res.status){ listEl.textContent = res.message || 'Failed'; return; }
      const comments = res.data || [];
      const frag = document.createDocumentFragment();
      comments.forEach(c => {
        const item = document.createElement('div'); item.className='item';
        item.innerHTML = `<div><strong>${(c.user?.username||'User')}</strong></div><div>${(c.comment||'')}</div>`;
        frag.appendChild(item);
      });
      listEl.innerHTML=''; listEl.appendChild(frag);
    }catch(_){ listEl.textContent = 'Failed to load comments'; }
  }

  document.addEventListener('DOMContentLoaded', load);
})();
