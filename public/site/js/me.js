// Load current user details and render basic profile
(function(){
  async function load(){
    const box = document.getElementById('meBox');
    const loading = document.getElementById('meLoading');
    const content = document.getElementById('meContent');
    const error = document.getElementById('meError');
    try{
      const res = await Site.api.user.fetchMe();
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

      // Populate counts if available on user object
      const followers = u.followers_count || u.total_followers || u.followers || 0;
      const following = u.following_count || u.total_following || u.following || 0;
      if (document.getElementById('countFollowers')) document.getElementById('countFollowers').textContent = followers;
      if (document.getElementById('countFollowing')) document.getElementById('countFollowing').textContent = following;

      // Quick fetches to approximate counts for tabs (best effort)
      try{
        const [reels, posts, props] = await Promise.all([
          Site.api.post.fetchUserPosts(uid, 'reel', 24),
          Site.api.post.fetchUserPosts(uid, 'all', 24),
          Site.api.properties.listByUser(uid, { per_page: 24 })
        ]);
        if (reels?.status && Array.isArray(reels.data)) document.getElementById('countReels').textContent = reels.data.length;
        if (posts?.status && Array.isArray(posts.data)) document.getElementById('countPosts').textContent = posts.data.length;
        const listProps = props?.data || props || [];
        if (Array.isArray(listProps)) document.getElementById('countProps').textContent = listProps.length;
      }catch(_){ /* silent */ }
    }catch(e){
      loading.classList.add('hide'); error.classList.remove('hide'); error.textContent = e.message;
    }
  }
  document.addEventListener('DOMContentLoaded', load);
})();
