// Properties listing page
(function(){
  const grid = document.getElementById('properties-grid');
  const empty = document.getElementById('properties-empty');
  const searchInput = document.getElementById('propSearch');
  const typeSelect = document.getElementById('propType');
  const listingSelect = document.getElementById('listingType');
  const sortSelect = document.getElementById('sortBy');
  const countEl = document.getElementById('propCount');

  function cardHTML(p){
    const id = p.id || p.property_id || '';
    const imgObj = (p.images && p.images[0]) || {};
    const thumb = imgObj.image_url || imgObj.image_path || '';
    const price = p.price_sar ? (Site.fmtNum(p.price_sar) + ' SAR') : '';
    const loc = [p.city, p.district].filter(Boolean).join(', ');
    const area = p.area_sqm ? (Site.fmtNum(p.area_sqm) + ' sqm') : '';
    const beds = p.bedrooms != null ? `${p.bedrooms} bd` : '';
    const baths = p.bathrooms != null ? `${p.bathrooms} ba` : '';
    return `
      <a class="prop-card" href="/site/property/${id}">
        <div class="thumb">
          ${thumb ? `<img src="${thumb}" alt="property">` : ''}
          ${price ? `<span class="badge-price">${price}</span>` : ''}
          <button class="fav" type="button" aria-label="Save">â¤</button>
        </div>
        <div class="prop-body">
          <div class="prop-title">${p.title || 'Property'}</div>
          <div class="prop-loc">${loc || ''}</div>
          <div class="prop-meta">
            ${area ? `<span class="item">${area}</span>` : ''}
            ${beds ? `<span class="item">${beds}</span>` : ''}
            ${baths ? `<span class="item">${baths}</span>` : ''}
          </div>
        </div>
      </a>`;
  }

  function clientSort(list){
    const key = (sortSelect && sortSelect.value) || 'new';
    const arr = Array.from(list || []);
    const byNum = (k, dir=1) => (a,b)=> ((Number(a[k]||0)-Number(b[k]||0))*dir);
    if (key==='price_asc') return arr.sort(byNum('price_sar', 1));
    if (key==='price_desc') return arr.sort(byNum('price_sar', -1));
    if (key==='area_asc') return arr.sort(byNum('area_sqm', 1));
    if (key==='area_desc') return arr.sort(byNum('area_sqm', -1));
    return arr; // 'new' as-is
  }

  async function load(){
    if (!grid || !empty) return;
    grid.innerHTML = '';
    empty.classList.add('hide');

    const params = new URLSearchParams();
    const q = (searchInput && searchInput.value || '').trim();
    const type = typeSelect && typeSelect.value;
    const listType = listingSelect && listingSelect.value;
    if (q) params.append('search', q);
    if (type) params.append('property_type', type);
    if (listType) params.append('listing_type', listType);
    params.append('per_page', '50');

    try{
      const res = await Site.apiFetch('/properties?' + params.toString());
      const json = await Site.toJson(res);
      let items = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : (json?.items || []));
      items = clientSort(items);
      if (countEl) countEl.textContent = `${items.length} results`;
      if (!items.length){ empty.classList.remove('hide'); return; }
      grid.innerHTML = items.map(cardHTML).join('');
      wireFavs();
    }catch(err){ empty.classList.remove('hide'); }
  }

  // Favs via localStorage fallback
  function getSaved(){ try{ return JSON.parse(localStorage.getItem('SAVED_PROPERTIES')||'[]'); }catch(_){ return []; } }
  function setSaved(arr){ localStorage.setItem('SAVED_PROPERTIES', JSON.stringify(arr)); }
  function isSaved(id){ return getSaved().includes(id); }
  function wireFavs(){
    grid.querySelectorAll('.prop-card').forEach(card => {
      const href = card.getAttribute('href')||''; const m = href.match(/\/site\/property\/(\d+)/);
      const id = m ? parseInt(m[1],10) : null; if (!id) return;
      const fav = card.querySelector('.fav'); if (!fav) return;
      fav.textContent = isSaved(id) ? '★' : '☆';
      fav.addEventListener('click', (e)=>{
        e.preventDefault(); e.stopPropagation();
        const saved = getSaved();
        if (isSaved(id)) setSaved(saved.filter(x=>x!==id)); else { saved.push(id); setSaved(saved); }
        fav.textContent = isSaved(id) ? '★' : '☆';
      });
    });
  }

  function debounce(fn, delay){ let t; return function(){ clearTimeout(t); const a=arguments; t=setTimeout(()=>fn.apply(null,a), delay); }; }

  document.addEventListener('DOMContentLoaded', load);
  if (searchInput) searchInput.addEventListener('input', debounce(load, 300));
  if (typeSelect) typeSelect.addEventListener('change', load);
  if (listingSelect) listingSelect.addEventListener('change', load);
  if (sortSelect) sortSelect.addEventListener('change', load);
})();

