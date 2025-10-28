// Explore page: fetch trending hashtags and quick search
(function(){
  const chips = document.getElementById('exploreChips');
  const grid = document.getElementById('exploreGrid');
  const form = document.getElementById('exploreSearch');
  const q = document.getElementById('exploreQuery');

  async function load(){
    try{
      const res = await Site.api.explore.fetch();
      if (!res.status) return;
      const data = res.data || {};
      const hashtags = (data.highPostHashtags || data.hashtags || []).slice(0, 20);
      chips.innerHTML='';
      hashtags.forEach(h => {
        const a = document.createElement('a'); a.href = `/site/t/${encodeURIComponent(h.hashtag||h)}`; a.className='chip'; a.textContent = `#${h.hashtag||h}`;
        chips.appendChild(a);
      });
    }catch(_){ /* ignore */ }
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const query = q.value.trim(); if (!query) return;
    window.location.href = `/site/search?tab=posts&query=${encodeURIComponent(query)}`;
  });

  document.addEventListener('DOMContentLoaded', load);
})();

