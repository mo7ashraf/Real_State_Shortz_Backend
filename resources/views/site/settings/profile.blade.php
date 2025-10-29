@extends('site.layouts.base')

@section('content')
<h2>Edit Profile</h2>
<form id="editProfile" class="card" style="max-width:720px">
  <div class="field">
    <label>Full Name</label>
    <input type="text" id="fullName" name="fullname" placeholder="Your name">
  </div>
  <div class="field">
    <label>Username</label>
    <input type="text" id="username" name="username" placeholder="username">
  </div>
  <div class="field">
    <label>Bio</label>
    <input type="text" id="bio" name="bio" placeholder="About you">
  </div>
  <div class="actions">
    <button class="btn primary" type="submit">Save</button>
    <span id="saveMsg" class="muted" style="margin-left:8px"></span>
  </div>
</form>
@endsection

@section('scripts')
<script>
(function(){
  async function init(){
    try{
      const me = await Site.api.user.fetchDetails();
      if (me.status && me.data){
        document.getElementById('fullName').value = me.data.fullname||'';
        document.getElementById('username').value = me.data.username||'';
        document.getElementById('bio').value = me.data.bio||'';
      }
    }catch(_){}
  }
  async function save(e){
    e.preventDefault();
    const fd = new FormData();
    fd.append('fullname', document.getElementById('fullName').value.trim());
    fd.append('username', document.getElementById('username').value.trim());
    fd.append('bio', document.getElementById('bio').value.trim());
    const msg = document.getElementById('saveMsg');
    msg.textContent = 'Saving…';
    try{
      const res = await fetch(APP.apiBase + '/user/updateUserDetails', { method:'POST', headers:{ 'Accept':'application/json', apikey:'retry123', authtoken: Site.getToken() }, body: fd });
      const json = await (window.Site && Site.toJson ? Site.toJson(res) : res.json());
      if (!json.status){ throw new Error(json.message||'Failed'); }
      msg.textContent = 'Saved.';
    }catch(err){ msg.textContent = err.message; }
  }
  document.addEventListener('DOMContentLoaded', init);
  document.getElementById('editProfile').addEventListener('submit', save);
})();
</script>
@endsection
