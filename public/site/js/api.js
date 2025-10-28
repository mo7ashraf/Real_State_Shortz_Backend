// Lightweight API client mapping mobile endpoints to web fetches
(function(){
  const BASE = (window.APP && APP.apiBase) || '/api';
  const HEADERS = () => {
    const t = Site.getToken ? Site.getToken() : '';
    return { apikey: 'retry123', APIKEY: 'retry123', authtoken: t, AUTHTOKEN: t };
  };

  async function post(path, body){
    const res = await fetch(BASE + (path.startsWith('/')?'': '/') + path, {
      method: 'POST',
      headers: Object.assign({ Accept: 'application/json' }, HEADERS()),
      body: body instanceof FormData ? body : toFormData(body||{})
    });
    return res.json();
  }
  function toFormData(obj){ const fd = new FormData(); Object.entries(obj).forEach(([k,v])=> fd.append(k, v)); return fd; }

  const api = {
    user: {
      webLogin: (identity, password) => post('user/webLogin', { identity, password }),
      logOutUser: () => post('user/logOutUser')
    },
    post: {
      fetchDiscover: (types='reel', limit=20) => post('post/fetchPostsDiscover', { types, limit }),
      fetchFollowing: (types='reel', limit=20) => post('post/fetchPostsFollowing', { types, limit }),
      fetchNearBy: (lat, lon, types='reel') => post('post/fetchPostsNearBy', { place_lat: lat, place_lon: lon, types }),
      fetchPostById: (postId) => post('post/fetchPostById', { post_id: postId }),
      like: (postId) => post('post/likePost', { post_id: postId }),
      dislike: (postId) => post('post/disLikePost', { post_id: postId }),
      save: (postId) => post('post/savePost', { post_id: postId }),
      unsave: (postId) => post('post/unSavePost', { post_id: postId }),
      incViews: (postId) => post('post/increaseViewsCount', { post_id: postId }),
      incShare: (postId) => post('post/increaseShareCount', { post_id: postId }),
      search: (query, types='all') => post('post/searchPosts', { search: query, types })
    },
    comment: {
      fetch: (postId) => post('post/fetchPostComments', { post_id: postId }),
      add: (postId, comment) => post('post/addPostComment', { post_id: postId, comment }),
      like: (commentId) => post('post/likeComment', { comment_id: commentId }),
      dislike: (commentId) => post('post/disLikeComment', { comment_id: commentId }),
      del: (commentId) => post('post/deleteComment', { comment_id: commentId })
    },
    explore: {
      fetch: () => post('post/fetchExplorePageData', {})
    },
    hashtag: {
      fetchPosts: (hashtag, types='all') => post('post/fetchPostsByHashtag', { hashtag, types }),
      search: (query) => post('post/searchHashtags', { search: query })
    },
    user: {
      webLogin: (identity, password) => post('user/webLogin', { identity, password }),
      logOutUser: () => post('user/logOutUser'),
      searchUsers: (query) => post('user/searchUsers', { search: query })
    },
    properties: {
      list: async (params={}) => {
        const url = new URL((BASE.startsWith('http')? BASE: location.origin+BASE) + '/properties');
        Object.entries(params).forEach(([k,v])=> v!=null && v!=='' && url.searchParams.set(k, v));
        const res = await fetch(url, { headers: { Accept:'application/json' }});
        return res.json();
      }
    }
  };

  window.Site = window.Site || {};
  window.Site.api = api;
})();
