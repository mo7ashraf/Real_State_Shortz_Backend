// Create property form -> POST /api/properties (multipart)
(function(){
  const form = document.getElementById('propForm');
  const msg = document.getElementById('propMsg');
  const btn = document.getElementById('btnPublish');
  if (!form) return;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    btn.disabled = true; msg.textContent = 'Publishing...';
    try{
      const fd = new FormData(form);
      // attach auth headers via fetch directly
      const res = await fetch(APP.apiBase + '/properties', {
        method:'POST',
        headers: { 'X-API-KEY':'retry123', , authtoken: Site.getToken() },
        body: fd
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed');
      const p = json.data || json;
      msg.textContent = 'Created! Redirecting...';
      setTimeout(()=>{ location.href = '/site/property/' + (p.id || p.property_id || ''); }, 600);
    }catch(err){ msg.textContent = err.message || 'Failed to create'; }
    finally{ btn.disabled = false; }
  });
})();



