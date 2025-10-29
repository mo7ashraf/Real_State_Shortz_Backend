// Minimal reel upload to /api/post/addPost_Reel
(function(){
  const form = document.getElementById('reelForm');
  const msg = document.getElementById('reelMsg');
  const btn = document.getElementById('btnUploadReel');
  if (!form) return;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    btn.disabled = true; msg.textContent = 'Uploading...';
    try{
      const fd = new FormData(form);
      const res = await fetch(APP.apiBase + '/post/addPost_Reel', {
        method: 'POST',
        headers: { 'X-API-KEY':'retry123', authtoken: Site.getToken() },
        body: fd
      });
      const json = await Site.toJson(res);
      if (!json.status) throw new Error(json.message || 'Upload failed');
      msg.textContent = 'Reel uploaded. Redirecting to Reels...';
      setTimeout(()=> location.href = '/site/reels', 700);
    }catch(err){ msg.textContent = err.message || 'Upload failed'; }
    finally{ btn.disabled = false; }
  });
})();




