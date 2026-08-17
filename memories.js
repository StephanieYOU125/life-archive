(()=>{
  const DB='life-archive-v1';
  const STORE='memories';
  const q=s=>document.querySelector(s);
  let db;
  let items=[];

  const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);

  function showView(view){
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
    q('#v-'+view)?.classList.add('active');
    document.querySelectorAll('#nav button[data-v]').forEach(x=>x.classList.toggle('active',x.dataset.v===view));
    const crumb=q('#crumb');
    if(crumb){
      const labels={compass:'全書定位',dashboard:'從哪裡開始',triage:'初稿整理台',outline:'章節地圖',visual:'圖像化寫作',memories:'照片回憶',editor:'章節編輯器',materials:'素材庫',references:'引用與借鏡',diagnosis:'修稿檢查',source:'原始文字',export:'備份與匯出'};
      crumb.textContent=labels[view]||'';
    }
    q('#side')?.classList.remove('open');
    if(view==='memories') render();
  }

  function ensureUI(){
    const nav=q('#nav');
    if(nav){
      nav.innerHTML=`
        <button data-v="compass">◎ 全書定位</button>
        <button class="active" data-v="dashboard">⌂ 從哪裡開始</button>
        <button data-v="triage">▦ 初稿整理台</button>
        <button data-v="outline">☷ 章節地圖</button>
        <button data-v="visual">✦ 圖像化寫作</button>
        <button class="photo-entry" data-v="memories"><span>▧</span>照片回憶</button>
        <button data-v="editor">✎ 章節編輯器</button>
        <button data-v="materials">◇ 素材庫</button>
        <button data-v="references">❝ 引用與借鏡</button>
        <button data-v="diagnosis">⚑ 修稿檢查</button>
        <button data-v="source">≡ 原始文字</button>
        <button data-v="export">⇩ 備份與匯出</button>`;
      nav.querySelectorAll('button[data-v]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.v)));
    }

    if(!q('#v-memories')){
      const section=document.createElement('section');
      section.className='view';
      section.id='v-memories';
      section.innerHTML=`
        <div class="heading">
          <div>
            <span class="eyebrow">PHOTO → MEMORY → STORY</span>
            <h1>照片回憶</h1>
            <p>從照片找回當時發生的事情。照片只保存在這台裝置的瀏覽器，不會上傳到 GitHub。</p>
          </div>
          <div class="mem-top-actions"><button class="btn" id="memExport">匯出照片 JSON</button></div>
        </div>
        <div class="mem-local-note"><strong>本機照片模式</strong><br>程式碼在 GitHub；私人照片存在瀏覽器 IndexedDB。換裝置或清除瀏覽器網站資料前，請先匯出照片 JSON 備份。</div>
        <div class="mem-drop">
          <strong>＋ 新增回憶</strong>
          <p class="muted">可以從電腦或手機選照片，也可以先建立一筆純文字回憶。</p>
          <div class="mem-add-actions">
            <label class="btn primary">📷 拍照<input id="memCamera" class="mem-hidden" type="file" accept="image/*" capture="environment"></label>
            <label class="btn">🖼 從相簿選擇<input id="memFiles" class="mem-hidden" type="file" accept="image/*" multiple></label>
            <button class="btn" id="memTextMemory">✎ 純文字回憶</button>
          </div>
        </div>
        <div id="memGrid" class="mem-grid"></div>`;
      q('main.main')?.appendChild(section);
    }

    document.querySelectorAll('a[href="app.html"],a[href="./app.html"],a[href="/app.html"]').forEach(link=>{
      const button=document.createElement('button');
      button.className=link.className||'btn';
      button.type='button';
      button.innerHTML=link.innerHTML;
      button.style.cssText=link.style.cssText;
      button.addEventListener('click',()=>showView('memories'));
      link.replaceWith(button);
    });
  }

  function blankMemory(extra={}){
    const now=new Date().toISOString();
    return {id:uid(),image:'',name:'',title:'',when:'',stage:'其他',place:'',feeling:'',tags:'',chapterIds:'',story:'',created:now,updated:now,...extra};
  }

  function open(){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB,1);
      req.onupgradeneeded=()=>{
        if(!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE,{keyPath:'id'});
      };
      req.onsuccess=()=>{db=req.result;resolve()};
      req.onerror=()=>reject(req.error);
    });
  }

  function getAll(){
    return new Promise((resolve,reject)=>{
      const req=db.transaction(STORE).objectStore(STORE).getAll();
      req.onsuccess=()=>resolve(req.result||[]);
      req.onerror=()=>reject(req.error);
    });
  }

  function put(item){
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put(item);
      tx.oncomplete=()=>{
        window.dispatchEvent(new CustomEvent('lifearchive:memory-saved',{detail:item}));
        resolve();
      };
      tx.onerror=()=>reject(tx.error);
    });
  }

  function del(id){
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete=()=>{
        window.dispatchEvent(new CustomEvent('lifearchive:memory-deleted',{detail:{id}}));
        resolve();
      };
      tx.onerror=()=>reject(tx.error);
    });
  }

  function esc(value){
    return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function stages(value){
    return ['童年','國中','高中','警大','警察工作','研究所','旅行','海外生活','運動／挑戰','其他']
      .map(x=>`<option${x===value?' selected':''}>${x}</option>`).join('');
  }

  function photoHtml(item){
    return item.image
      ? `<img src="${item.image}" alt="${esc(item.title||'回憶照片')}">`
      : '<div class="mem-photo-empty"><strong>✎</strong>純文字回憶<br><small>之後也可以再補照片</small></div>';
  }

  function render(){
    const grid=q('#memGrid');
    if(!grid) return;
    grid.innerHTML=items.length
      ? items.slice().sort((a,b)=>(b.created||'').localeCompare(a.created||'')).map(item=>`
        <article class="mem-card" data-memory-id="${item.id}">
          <div class="mem-photo">${photoHtml(item)}</div>
          <div class="mem-body">
            <input class="mem-title" data-memory-field="title" value="${esc(item.title)}" placeholder="替這段回憶取名字">
            <div class="mem-row">
              <label>時間<input data-memory-field="when" value="${esc(item.when)}" placeholder="例如：2015 夏天"></label>
              <label>人生階段<select data-memory-field="stage">${stages(item.stage||'其他')}</select></label>
            </div>
            <div class="mem-row">
              <label>地點<input data-memory-field="place" value="${esc(item.place)}"></label>
              <label>感受<input data-memory-field="feeling" value="${esc(item.feeling||'')}" placeholder="例如：期待、害怕、安心"></label>
            </div>
            <label>標籤<input data-memory-field="tags" value="${esc(item.tags||'')}" placeholder="例如：日本, 旅行, 成長"></label>
            <label>關聯章節<input data-memory-field="chapterIds" value="${esc(item.chapterIds||'')}" placeholder="例如：c12, c19"></label>
            <label>那時候，我在做什麼？<textarea data-memory-field="story">${esc(item.story)}</textarea></label>
            <div class="mem-card-actions"><span class="mem-save-state" data-memory-save>✓ 已自動儲存</span><button class="btn mem-danger" data-memory-delete>刪除</button></div>
          </div>
        </article>`).join('')
      : '<div class="mem-empty">目前還沒有回憶。按上方「＋ 新增回憶」開始第一筆。</div>';

    grid.querySelectorAll('[data-memory-field]').forEach(input=>{
      input.oninput=input.onchange=()=>{
        const card=input.closest('[data-memory-id]');
        const item=items.find(x=>x.id===card.dataset.memoryId);
        if(!item) return;
        item[input.dataset.memoryField]=input.value;
        item.updated=new Date().toISOString();
        const state=card.querySelector('[data-memory-save]');
        if(state) state.textContent='儲存中…';
        put(item).then(()=>{if(state) state.textContent='✓ 已自動儲存'});
      };
    });

    grid.querySelectorAll('[data-memory-delete]').forEach(button=>{
      button.onclick=async()=>{
        const id=button.closest('[data-memory-id]').dataset.memoryId;
        if(confirm('刪除這筆回憶？')){
          await del(id);
          items=items.filter(x=>x.id!==id);
          render();
        }
      };
    });
  }

  function dataUrl(file){
    return new Promise((resolve,reject)=>{
      const image=new Image();
      const url=URL.createObjectURL(file);
      image.onload=()=>{
        const scale=Math.min(1,1600/Math.max(image.width,image.height));
        const canvas=document.createElement('canvas');
        canvas.width=image.width*scale;
        canvas.height=image.height*scale;
        canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg',.86));
      };
      image.onerror=reject;
      image.src=url;
    });
  }

  async function addFiles(fileList){
    for(const file of [...fileList]){
      if(!file.type.startsWith('image/')) continue;
      const item=blankMemory({image:await dataUrl(file),name:file.name});
      await put(item);
      items.push(item);
    }
    render();
    q('#v-memories')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function bind(){
    const files=q('#memFiles');
    const camera=q('#memCamera');
    const text=q('#memTextMemory');
    const exportButton=q('#memExport');
    if(files) files.onchange=e=>{addFiles(e.target.files);e.target.value=''};
    if(camera) camera.onchange=e=>{addFiles(e.target.files);e.target.value=''};
    if(text) text.onclick=async()=>{
      const item=blankMemory();
      await put(item);
      items.push(item);
      render();
      requestAnimationFrame(()=>{
        const card=q(`[data-memory-id="${item.id}"]`);
        card?.scrollIntoView({behavior:'smooth',block:'center'});
        card?.querySelector('[data-memory-field="title"]')?.focus();
      });
    };
    if(exportButton) exportButton.onclick=()=>{
      const url=URL.createObjectURL(new Blob([JSON.stringify({format:'life-archive',version:3,memories:items},null,2)],{type:'application/json'}));
      const a=document.createElement('a');
      a.href=url;
      a.download='life-archive-photos-'+new Date().toISOString().slice(0,10)+'.json';
      a.click();
      setTimeout(()=>URL.revokeObjectURL(url),500);
    };
  }

  window.addEventListener('lifearchive:cloud-import',async event=>{
    const incoming=event.detail||[];
    for(const cloud of incoming){
      const local=items.find(x=>x.id===cloud.id);
      if(local){
        Object.assign(local,cloud,{image:local.image,name:local.name});
        await put(local);
      }else{
        const item={...blankMemory(),...cloud,image:'',name:cloud.imageName||''};
        await put(item);
        items.push(item);
      }
    }
    render();
  });

  window.lifeArchiveMemories={getItems:()=>items.map(x=>({...x})),render,showView};

  async function init(){
    ensureUI();
    bind();
    try{
      await open();
      items=await getAll();
      render();
    }catch(error){
      console.error(error);
      const grid=q('#memGrid');
      if(grid) grid.innerHTML='<div class="mem-empty">照片回憶資料庫開啟失敗，請重新整理後再試。</div>';
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
