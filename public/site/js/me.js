// Load current user details and render basic profile
(function(){
  async function load(){
    const box = document.getElementById('meBox');
    const loading = document.getElementById('meLoading');
    const content = document.getElementById('meContent');
    const error = document.getElementById('meError');
    try{
      const res = await Site.api.user.fetchDetails();
      if (!res.status){ throw new Error(res.message || 'Failed to fetch user'); }
      const raw = res.data || {};
      // Normalize user object across variants
      const u = raw.user || raw;
      const uid = u.id || u.user_id || raw.id || raw.user_id;
      if (uid){
        try{
          const norm = Object.assign({}, u, { id: uid });
          localStorage.setItem('SITE_USER', JSON.stringify(norm));
          window.Site = Object.assign(window.Site||{}, { currentUser: norm });
        }catch(_){ /* ignore */ }
      }
      loading.classList.add('hide'); content.classList.remove('hide');
      document.getElementById('meFullname').textContent = u.fullname || 'User';
      document.getElementById('meUsername').textContent = '@' + (u.username || '');
      if (u.is_verify){ document.getElementById('meVerified').style.display='inline-block'; }
      document.getElementById('meBio').textContent = u.bio || '';
      if (u.profile_photo){ document.getElementById('meAvatar').src = (u.profile_photo.startsWith('http') ? u.profile_photo : (location.origin + '/' + u.profile_photo.replace(/^\/+/, ''))); }
    }catch(e){
      loading.classList.add('hide'); error.classList.remove('hide'); error.textContent = e.message;
    }
  }
  document.addEventListener('DOMContentLoaded', load);
})();
