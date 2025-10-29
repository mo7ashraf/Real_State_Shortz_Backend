/* Reels feed with overlay and actions */
(function(){
  const list = document.getElementById('reels-list');
  const empty = document.getElementById('reels-empty');

  async function load(){
    try{
      const json = await Site.api.post.fetchDiscover('reel', 20);
      if (!json.status){ throw new Error(json.message||'Failed'); }
      const items = json.data || [];
      if (!items.length){ empty.classList.remove('hide'); return; }
      const frag = document.createDocumentFragment();
      items.forEach(p => {
        const card = document.createElement('div');
        card.className = 'reel-card';

        // video
        const v = document.createElement('video');
        v.src = p.video_url || p.video || '';
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
        ava.src = user.profile_photo || user.avatar || '';
        const name = document.createElement('div'); name.className='name';
        name.textContent = user.username || user.fullname || 'User';
        hdr.appendChild(ava); hdr.appendChild(name);
        card.appendChild(hdr);

        // description/info bottom-left
        const info = document.createElement('div'); info.className='reel-info';
        const desc = document.createElement('div'); desc.className='desc';
        desc.textContent = (p.description||'');
        info.appendChild(desc);
        card.appendChild(info);

        // right action rail
        const actions = document.createElement('div'); actions.className='reel-actions';
        const btnLike = document.createElement('button'); btnLike.className='btn'; btnLike.innerHTML = '&hearts;';
        const btnComment = document.createElement('button'); btnComment.className='btn'; btnComment.innerHTML = '&#128172;';
        const btnSave = document.createElement('button'); btnSave.className='btn'; btnSave.innerHTML = '&#128190;';
        const btnShare = document.createElement('button'); btnShare.className='btn'; btnShare.textContent = 'Share';
        actions.append(btnLike, btnComment, btnSave, btnShare);
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
          else { try{ await navigator.clipboard.writeText(url);}catch(_){ }
        });
        btnComment.addEventListener('click', () => openComments(p.id));

        // property overlay (if linked)
        const propId = p.property_id || (p.metadata && p.metadata.property_id);
        const hasMeta = p.metadata && (p.metadata.property_title || p.metadata.city || p.metadata.district);
        if (propId || hasMeta){
          const pc = document.createElement('a'); pc.className='prop-card'; pc.href = propId ? (`/site/property/${propId}`) : '#';
          const title = (p.metadata && p.metadata.property_title) ? p.metadata.property_title : 'Property';
          const where = p.metadata ? [p.metadata.city, p.metadata.district].filter(Boolean).join(', ') : '';
          pc.innerHTML = `<div class="title">${title}</div><div class="meta">${where}</div>`;
          card.appendChild(pc);
        }

        frag.appendChild(card);
      });
      list.appendChild(frag);
    }catch(err){
      empty.classList.remove('hide');
      empty.textContent = 'Failed to load reels';
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

