(function(){
  const q = document.getElementById('exploreQuery');
  const grid = document.getElementById('exploreGrid');
  const chips = document.getElementById('exploreChips');

  const defaultHashtags = ['#realestate','#villa','#apartment','#riyadh','#jeddah','#trend'];
  if (chips) chips.innerHTML = defaultHashtags.map(h=>`<button class="chip" data-q="${h}">${h}</button>`).join('');

  if (chips) chips.addEventListener('click',(e)=>{
    const c = e.target.closest('.chip'); if (!c) return;
    if (q) q.value = c.getAttribute('data-q');
    search();
  });

  function card(it){
    const href =
      it.type==='reel' ? `/site/reel/${it.id}` :
      it.type==='post' ? `/site/post/${it.id}` :
      it.type==='property' ? `/site/property/${it.id}` : '#';
    const thumb = it.thumbnail_url || it.avatar || it.image_url || '';
    const title = it.title || it.username || it.caption || '';
    return `
      <a class="card" href="${href}">
        ${thumb ? `<img src="${thumb}" alt="" style="width:100%;height:180px;object-fit:cover;border-radius:10px">` : ''}
        <div style="margin-top:6px;font-weight:600">${title}</div>
      </a>`;
  }

  async function search(){
    const text = (q && q.value||'').trim();
    grid.innerHTML = '<div class="muted">Searching…</div>';
    try{
      const res = await Site.apiFetch('/search?query=' + encodeURIComponent(text));
      const json = await res.json();
      const items = Array.isArray(json?.data) ? json.data : (Array.isArray(json)?json:[]);
      grid.innerHTML = items.length ? items.map(card).join('') : '<div class="muted">No results.</div>';
    }catch(_){ grid.innerHTML = '<div class="muted">No results.</div>'; }
  }

  if (q) q.addEventListener('input', (()=>{ let t; return ()=>{ clearTimeout(t); t=setTimeout(search,250); };})());
  document.addEventListener('DOMContentLoaded', search);
})();

