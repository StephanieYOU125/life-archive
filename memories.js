(()=>{
  const DB='life-archive-v1';
  const STORE='memories';
  const q=s=>document.querySelector(s);
  let db;
  let items=[];

  const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);

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
    const section=q('#v-memories');
    section?.scrollIntoView({behavior:'smooth',block:'start'});
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

  window.lifeArchiveMemories={getItems:()=>items.map(x=>({...x})),render};

  async function init(){
    if(!q('#v-memories')) return;
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
