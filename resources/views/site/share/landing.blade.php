@extends('site.layouts.base')

@section('content')
  <div class="card" style="text-align:center; padding:24px">
    <h2>Open in App</h2>
    <p class="muted">If the app is installed, it will open automatically. Otherwise, continue on web.</p>
    <div style="margin:12px 0">
      <a class="btn primary" id="openApp">Open</a>
      <a class="btn" id="openWeb">Continue on Web</a>
    </div>
  </div>
@endsection

@section('scripts')
<script>
(function(){
  const type = @json($type); const id = @json($id);
  const scheme = '{{ config('app.name','sharealaqarea') }}'.toLowerCase();
  const deep = `${scheme}://${type}/${id}`;
  const web  = type==='reel' ? `/site/reel/${id}` : (type==='post'? `/site/post/${id}` : `/site/property/${id}`);

  document.getElementById('openApp').addEventListener('click', ()=> { location.href = deep; setTimeout(()=>{ location.href = web; }, 1200); });
  document.getElementById('openWeb').addEventListener('click', ()=> { location.href = web; });
  setTimeout(()=>{ location.href = deep; setTimeout(()=>{}, 800); }, 200);
})();
</script>
@endsection

