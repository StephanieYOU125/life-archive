const CACHE_NAME='life-archive-pwa-v8';
const APP_SHELL=['./','./index.html','./app.html?v=10','./manifest.webmanifest','./app-icon.svg','./firebase-cloud-sync.js','./mobile-auth.js','./sidebar-active.css'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});

async function injectModules(response, requestUrl){
  if(!response || !response.ok) return response;
  const url=new URL(requestUrl);
  const path=url.pathname;
  const isHome=path==='/' || path.endsWith('/index.html') || path.endsWith('/life-archive/');
  const isPhoto=path.endsWith('/app.html') || path.endsWith('/life-archive/app.html');
  if(!isHome && !isPhoto) return response;
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html')) return response;
  let html=await response.text();
  if(!html.includes('sidebar-active.css')){
    html=html.replace('</head>','<link rel="stylesheet" href="./sidebar-active.css"></head>');
  }
  if(isHome && !html.includes('firebase-cloud-sync.js')){
    html=html.replace('</body>','<script type="module" src="./firebase-cloud-sync.js"></script></body>');
  }
  if(!html.includes('mobile-auth.js')){
    html=html.replace('</body>','<script type="module" src="./mobile-auth.js"></script></body>');
  }
  const headers=new Headers(response.headers);
  headers.set('content-type','text/html; charset=utf-8');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

function latestRequest(request){
  const url=new URL(request.url);
  if(url.pathname.endsWith('/app.html') && !url.searchParams.has('v')){
    url.searchParams.set('v','10');
    return new Request(url.toString(),request);
  }
  return request;
}

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith((async()=>{
    const request=latestRequest(e.request);
    try{
      const network=await fetch(request,{cache:'no-store'});
      const served=await injectModules(network.clone(),request.url);
      if(network&&network.ok){
        const cacheCopy=served.clone();
        caches.open(CACHE_NAME).then(c=>c.put(request,cacheCopy));
      }
      return served;
    }catch(err){
      const cached=await caches.match(request);
      if(cached) return injectModules(cached.clone(),request.url);
      const fallback=await caches.match('./index.html');
      return fallback ? injectModules(fallback.clone(),request.url) : Response.error();
    }
  })());
});
