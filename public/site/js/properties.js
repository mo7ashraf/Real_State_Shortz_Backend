// Properties listing page
(function(){
  const grid = document.getElementById('properties-grid');
  const empty = document.getElementById('properties-empty');
  const searchInput = document.getElementById('propSearch');
  const typeSelect = document.getElementById('propType');

  async function loadProperties(){
    if (!grid || !empty) return;
    // Build query parameters
    const params = new URLSearchParams();
    const q = searchInput && searchInput.value.trim();
    const type = typeSelect && typeSelect.value;
    if (q) params.append('search', q);
    if (type) params.append('property_type', type);
    try {
      const res = await Site.apiFetch('/properties?' + params.toString());
      const json = await res.json();
      const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      grid.innerHTML = '';
      if (!items || !items.length) {
        empty.classList.remove('hide');
        return;
      }
      empty.classList.add('hide');
      items.forEach(p => {
        const card = document.createElement('a');
        card.className = 'prop-card';
        card.href = '/site/property/' + (p.id || p.property_id || '');
        // Thumbnail
        let thumb = '';
        if (p.images && p.images.length) {
          const imgObj = p.images[0];
          thumb = imgObj.image_url || imgObj.image_path || '';
        }
        if (thumb) {
          const img = document.createElement('img');
          img.src = thumb;
          img.alt = 'property';
          card.appendChild(img);
        }
        const title = document.createElement('div');
        title.className = 'prop-title';
        title.textContent = p.title || 'Property';
        card.appendChild(title);
        const meta = document.createElement('div');
        meta.className = 'prop-meta';
        const price = p.price_sar ? Site.fmtNum(p.price_sar) + ' SAR' : '';
        const area = p.area_sqm ? Site.fmtNum(p.area_sqm) + ' sqm' : '';
        meta.textContent = [price, area].filter(Boolean).join(' • ');
        card.appendChild(meta);
        grid.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      grid.innerHTML = '';
      empty.classList.remove('hide');
    }
  }

  function debounce(fn, delay){
    let t;
    return function(){
      clearTimeout(t);
      const args = arguments;
      t = setTimeout(()=>fn.apply(null, args), delay);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadProperties();
  });
  if (searchInput) searchInput.addEventListener('input', debounce(loadProperties, 500));
  if (typeSelect) typeSelect.addEventListener('change', loadProperties);
})();

