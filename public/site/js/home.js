// Simple mixed home feed (placeholder; uses /api/feed if available)
(function(){
  const grid = document.getElementById('homeFeed');
  const empty = document.getElementById('homeEmpty');
  const loading = document.getElementById('homeLoading');
  const tabs = document.querySelectorAll('.tabs .tab');

  let page = 1, done = false, busy = false, type = 'all';

  tabs.forEach(t => t.addEventListener('click', (e)=>{
    e.preventDefault();
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    type = t.getAttribute('data-filter');
    page = 1; done = false; grid.innerHTML=''; empty.classList.add('hide');
    load();
  }));

  function cardHTML(it){
    const href = it.type === 'reel' ? `/site/reel/${it.id}` : (it.post_id ? `/site/post/${it.post_id}` : '#');
    const thumb = it.thumbnail_url || it.cover_url || it.image_url || '';
    const title = it.title || it.caption || it.username || ' ';
    return `
      <a class="card" href="${href}">
        ${thumb ? `<img src="${thumb}" alt="" style="width:100%;height:220px;object-fit:cover;border-radius:10px">` : ''}
        <div style="padding-top:8px;font-weight:600">${title}</div>
      </a>`;
  }

  async function load(){
    if (busy || done) return; busy = true; loading.style.display='block';
    const params = new URLSearchParams({ page: String(page), limit:'20' });
    if (type && type!=='all') params.set('type', type);
    try {
      const res = await Site.apiFetch('/feed?' + params.toString());
      const json = await Site.toJson(res);
      const items = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      if (!items.length) { if (page===1) empty.classList.remove('hide'); done = true; return; }
      grid.insertAdjacentHTML('beforeend', items.map(cardHTML).join(''));
      page++;
    } catch(_) { if (page===1) empty.classList.remove('hide'); done = true; }
    finally { busy=false; loading.style.display='none'; }
  }

  const io = new IntersectionObserver((entries)=>{ if (entries.some(e=>e.isIntersecting)) load(); });
  io.observe(loading);

  document.addEventListener('DOMContentLoaded', load);
})();


