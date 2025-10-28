/* Property details page */
(function(){
  const root = document.getElementById('property');
  const postsGrid = document.getElementById('property-posts');
  const id = parseInt(root.getAttribute('data-id'), 10);

  async function loadProperty(){
    const res = await fetch(APP.apiBase + '/properties/' + id);
    const prop = await res.json();
    renderProperty(prop);
  }

  async function loadPosts(){
    try{
      const res = await fetch(APP.apiBase + `/properties/${id}/posts`);
      const items = await res.json();
      items.forEach(p => {
        const card = document.createElement('a');
        card.className = 'post-card';
        card.href = '#';
        if (p.thumbnail_url){
          const img = document.createElement('img');
          img.src = p.thumbnail_url; img.alt = 'thumb';
          card.appendChild(img);
        } else if (p.video_url){
          const v = document.createElement('video'); v.src = p.video_url; v.controls=true; v.muted=true; v.preload='metadata';
          card.appendChild(v);
        }
        postsGrid.appendChild(card);
      });
    }catch(err){ /* noop */ }
  }

  function renderProperty(p){
    root.innerHTML = '';
    const title = document.createElement('h2');
    title.textContent = p.title || 'Property';
    root.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'prop-meta';
    meta.innerHTML = `
      <div><strong>Type:</strong> ${p.property_type||'-'} • <strong>Listing:</strong> ${p.listing_type||'-'}</div>
      <div><strong>Price:</strong> ${Site.fmtNum(p.price_sar)} SAR • <strong>Area:</strong> ${Site.fmtNum(p.area_sqm)} sqm</div>
      <div><strong>Beds/Baths:</strong> ${p.bedrooms||0}/${p.bathrooms||0}</div>
      <div><strong>Location:</strong> ${[p.city,p.district].filter(Boolean).join(', ')}</div>
    `;
    root.appendChild(meta);

    if (p.images && p.images.length){
      const gallery = document.createElement('div');
      gallery.className = 'prop-gallery';
      p.images.forEach(img => {
        const el = document.createElement('img');
        el.src = img.image_url || img.image_path; el.alt = 'image';
        gallery.appendChild(el);
      });
      root.appendChild(gallery);
    }

    if (p.description){
      const d = document.createElement('p');
      d.textContent = p.description;
      root.appendChild(d);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadProperty();
    loadPosts();
  });
})();

