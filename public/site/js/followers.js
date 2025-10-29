// Followers list for the current user
(function(){
  async function load(){
    const box = document.getElementById('followersList');
    box.textContent = 'Loading...';
    try{
      // fetch current user to get id
      const me = await Site.api.user.fetchDetails();
      if (!me.status) throw new Error(me.message||'Failed to fetch user');
      const raw = me.data || {};
      const u = raw.user || raw;
      const uid = u.id || u.user_id || raw.id || raw.user_id;
      const res = await fetch(APP.apiBase + '/user/fetchUserFollowers', {
        method:'POST', headers: { 'X-API-KEY':'retry123', authtoken: Site.getToken() },
        body: new FormData()
      });
      // Some endpoints expect user_id; try with it
      let data = await res.json();
      if (!data.status){
        const fd = new FormData(); fd.append('user_id', uid);
        const res2 = await fetch(APP.apiBase + '/user/fetchUserFollowers', { method:'POST', headers: { 'X-API-KEY':'retry123', authtoken: Site.getToken() }, body: fd });
        data = await res2.json();
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



