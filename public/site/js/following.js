// Following list for the current user
(function(){
  async function load(){
    const box = document.getElementById('followingList');
    box.textContent = 'Loading...';
    try{
      const me = await Site.api.user.fetchMe();
      if (!me.status) throw new Error(me.message||'Failed user');
      const raw = me.data || {};
      const u = raw.user || raw;
      const uid = u.id || u.user_id || raw.id || raw.user_id;
      const fd0 = new FormData(); fd0.append('user_id', uid); fd0.append('limit', '24');
      let res = await fetch(APP.apiBase + '/user/fetchUserFollowings', { method:'POST', headers: { 'X-API-KEY':'retry123', authtoken: Site.getToken() }, body: fd0 });
      let data = await res.json();
      if (!data.status){
        const fd = new FormData(); fd.append('user_id', uid); fd.append('limit', '24');
        res = await fetch(APP.apiBase + '/user/fetchUserFollowings', { method:'POST', headers: { 'X-API-KEY':'retry123', authtoken: Site.getToken() }, body: fd });
        data = await res.json();
      }
      if (!data.status) throw new Error(data.message||'Failed');
      const list = data.data || [];
      const frag = document.createDocumentFragment();
      list.forEach(u => { const row=document.createElement('div'); row.style.padding='8px 12px'; row.textContent=(u.username||u.fullname||'User'); frag.appendChild(row); });
      box.innerHTML=''; box.appendChild(frag);
    }catch(e){ box.textContent = e.message; }
  }
  document.addEventListener('DOMContentLoaded', load);
})();




