const CACHE_NAME='life-archive-pwa-v3';
const APP_SHELL=['./','./index.html','./app.html','./manifest.webmanifest','./app-icon.svg','./firebase-cloud-sync.js'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});

async function withCloudModule(response, requestUrl){
  if(!response || !response.ok) return response;
  const url=new URL(requestUrl);
  const isHome=url.pathname.endsWith('/life-archive/') || url.pathname.endsWith('/life-archive/index.html');
  if(!isHome) return response;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html')) return response;
  let html=await response.text();
  if(!html.includes('firebase-cloud-sync.js')){
    html=html.replace('</body>','<script type="module" src="./firebase-cloud-sync.js"></script></body>');
  }
  const headers=new Headers(response.headers);
  headers.set('content-type','text/html; charset=utf-8');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith((async()=>{
    try{
      const network=await fetch(e.request);
      const served=await withCloudModule(network.clone(),e.request.url);
      if(network&&network.ok){
        const cacheCopy=served.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request,cacheCopy));
      }
      return served;
    }catch(err){
      const cached=await caches.match(e.request);
      if(cached) return withCloudModule(cached.clone(),e.request.url);
      const fallback=await caches.match('./index.html');
      return fallback ? withCloudModule(fallback.clone(),e.request.url) : Response.error();
    }
  })());
});
