// Following list for the current user
(function(){
  async function load(){
    const box = document.getElementById('followingList');
    box.textContent = 'Loading...';
    try{
      const me = await Site.api.user.fetchDetails();
      if (!me.status) throw new Error(me.message||'Failed user');
      const uid = me.data?.id;
      let res = await fetch(APP.apiBase + '/user/fetchUserFollowings', { method:'POST', headers:{ apikey:'retry123', authtoken: Site.getToken() }, body: new FormData() });
      let data = await res.json();
      if (!data.status){
        const fd = new FormData(); fd.append('user_id', uid);
        res = await fetch(APP.apiBase + '/user/fetchUserFollowings', { method:'POST', headers:{ apikey:'retry123', authtoken: Site.getToken() }, body: fd });
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

