const CACHE_NAME='life-archive-pwa-v19';
const APP_SHELL=['./','./index.html','./manifest.webmanifest','./app-icon.svg','./firebase-cloud-sync.js','./mobile-auth.js','./sidebar-active.css','./book-positioning.js','./book-positioning-ui.js','./submission-materials-migration.js','./materials-editor.js','./timeline.js',
  './timeline-cloud-sync.js','./workflow-sidebar.js','./memories.css','./memories.js'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});

function hostingAuthDomain(url){
  return url.hostname.endsWith('.web.app') || url.hostname.endsWith('.firebaseapp.com')
    ? url.hostname
    : null;
}

async function prepareResponse(response, requestUrl){
  if(!response || !response.ok) return response;
  const url=new URL(requestUrl);
  const path=url.pathname;
  const type=response.headers.get('content-type')||'';
  let body=null;

  const isHome=path==='/' || path.endsWith('/index.html') || path.endsWith('/life-archive/');
  const isCloudModule=path.endsWith('/firebase-cloud-sync.js');

  if(isHome && type.includes('text/html')){
    body=await response.text();
    if(!body.includes('sidebar-active.css')) body=body.replace('</head>','<link rel="stylesheet" href="./sidebar-active.css"></head>');
    if(!body.includes('memories.css')) body=body.replace('</head>','<link rel="stylesheet" href="./memories.css"></head>');
    if(!body.includes('workflow-sidebar.js')) body=body.replace('</body>','<script src="./workflow-sidebar.js"></script></body>');
    if(!body.includes('firebase-cloud-sync.js')) body=body.replace('</body>','<script type="module" src="./firebase-cloud-sync.js"></script></body>');
    if(!body.includes('book-positioning.js')) body=body.replace('</body>','<script type="module" src="./book-positioning.js"></script></body>');
    if(!body.includes('book-positioning-ui.js')) body=body.replace('</body>','<script type="module" src="./book-positioning-ui.js"></script></body>');
    if(!body.includes('memories.js')) body=body.replace('</body>','<script src="./memories.js"></script></body>');
    if(!body.includes('mobile-auth.js')) body=body.replace('</body>','<script type="module" src="./mobile-auth.js"></script></body>');
  } else if(isCloudModule && (type.includes('javascript') || type.includes('text/plain') || type==='')) {
    body=await response.text();
  } else {
    return response;
  }

  const authDomain=hostingAuthDomain(url);
  if(authDomain){
    body=body
      .replaceAll('authDomain: "life-archive-2d4a6.firebaseapp.com"',`authDomain: "${authDomain}"`)
      .replaceAll('authDomain:"life-archive-2d4a6.firebaseapp.com"',`authDomain:"${authDomain}"`);
  }

  const headers=new Headers(response.headers);
  if(type.includes('text/html')) headers.set('content-type','text/html; charset=utf-8');
  return new Response(body,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const originalUrl=new URL(e.request.url);
  if(originalUrl.pathname.startsWith('/__/')) return;

  if(originalUrl.pathname.endsWith('/app.html')){
    const homeUrl=new URL('./index.html',originalUrl);
    e.respondWith(fetch(homeUrl,{cache:'no-store'}).then(r=>prepareResponse(r,homeUrl.toString())).catch(async()=>{
      const cached=await caches.match('./index.html');
      return cached ? prepareResponse(cached.clone(),homeUrl.toString()) : Response.error();
    }));
    return;
  }

  e.respondWith((async()=>{
    const request=e.request;
    try{
      const network=await fetch(request,{cache:'no-store'});
      const served=await prepareResponse(network.clone(),request.url);
      if(network&&network.ok){
        const cacheCopy=served.clone();
        caches.open(CACHE_NAME).then(c=>c.put(request,cacheCopy));
      }
      return served;
    }catch(err){
      const cached=await caches.match(request);
      if(cached) return prepareResponse(cached.clone(),request.url);
      const fallback=await caches.match('./index.html');
      return fallback ? prepareResponse(fallback.clone(),request.url) : Response.error();
    }
  })());
});
