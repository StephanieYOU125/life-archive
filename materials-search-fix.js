(()=>{
  const STORAGE_KEY='life-archive-writing-studio-v1';
  let composing=false;
  let timer=null;
  let suppressCommittedInput=false;
  let decorating=false;

  function uid(){
    return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
  }

  function readState(){
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}
    catch{return {}}
  }

  function writeState(state){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    const saved=document.getElementById('saved');
    if(saved)saved.textContent='已自動儲存在本機';
  }

  function createBlankMaterial(){
    const state=readState();
    const materials=Array.isArray(state.materials)?state.materials:[];
    const item={
      id:uid(),
      title:'',
      content:'',
      story60:'',
      research15:'',
      insight25:'',
      time:'',
      timePrecision:'待確認',
      experienceCategory:'其他',
      tags:'',
      stage:'靈感箱',
      chapterId:'',
      timelineId:'',
      evidence:'',
      feelings:'',
      reflection:'',
      source:'手動新增'
    };
    materials.push(item);
    state.materials=materials;
    writeState(state);
    return item;
  }

  function selectorForId(id){
    const value=String(id);
    const escaped=globalThis.CSS?.escape?CSS.escape(value):value.replace(/["\\]/g,'\\$&');
    return `[data-material-id="${escaped}"]`;
  }

  function focusMaterial(item){
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        const editor=document.querySelector(selectorForId(item.id));
        const title=editor?.querySelector('[data-material-field="title"]');
        title?.focus();
        editor?.scrollIntoView({behavior:'smooth',block:'center'});
      });
    });
  }

  function openNewestMaterial(item){
    try{
      if(typeof syncFromStorage==='function'&&typeof renderEditor==='function'){
        if(typeof searchTerm!=='undefined')searchTerm='';
        if(typeof stageFilter!=='undefined')stageFilter='全部';
        if(typeof tagFilter!=='undefined')tagFilter='全部';
        if(typeof categoryFilter!=='undefined')categoryFilter='全部';
        if(typeof expandedId!=='undefined')expandedId=item.id;
        syncFromStorage();
        renderEditor();
        focusMaterial(item);
        return;
      }
    }catch(err){console.warn('material editor refresh fallback',err)}

    const materialsNav=document.querySelector('#nav [data-v="materials"]');
    if(materialsNav)materialsNav.click();
    setTimeout(()=>{
      const row=document.querySelector(selectorForId(item.id));
      if(!row)return;
      if(!row.classList.contains('open'))row.querySelector('[data-expand]')?.click();
      focusMaterial(item);
    },120);
  }

  document.addEventListener('click',event=>{
    const button=event.target?.closest?.('#addMaterial');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const item=createBlankMaterial();
    openNewestMaterial(item);
  },true);

  function timelineItems(){
    try{
      const rows=JSON.parse(localStorage.getItem('life-archive-timeline-v1')||'[]');
      return Array.isArray(rows)?rows:[];
    }catch{return []}
  }

  function searchTerms(value){
    return String(value||'').trim().toLowerCase().split(/\s+/).filter(Boolean);
  }

  function syncMainSearch(value){
    try{if(typeof searchTerm!=='undefined')searchTerm=String(value||'')}catch{}
  }

  function applySearch(value){
    syncMainSearch(value);
    const terms=searchTerms(value);
    const state=readState();
    const materials=Array.isArray(state.materials)?state.materials:[];
    const chapters=Array.isArray(state.chapters)?state.chapters:[];
    const timeline=timelineItems();
    const matched=new Set();

    for(const item of materials){
      const chapter=chapters.find(c=>String(c.id)===String(item.chapterId));
      const t=timeline.find(x=>String(x.id)===String(item.timelineId));
      const timelineTitle=t?[t.time,t.identity].filter(Boolean).join(' · '):'';
      const haystack=[
        item.title,item.content,item.story60,item.research15,item.insight25,
        item.evidence,item.feelings,item.reflection,item.time,item.tags,
        item.experienceCategory,item.stage,chapter?.title||'',timelineTitle
      ].join(' ').toLowerCase();
      if(!terms.length||terms.every(term=>haystack.includes(term)))matched.add(String(item.id));
    }

    const list=document.getElementById('materialList');
    if(!list)return;
    list.querySelectorAll('[data-material-id]').forEach(row=>{
      row.hidden=!matched.has(String(row.dataset.materialId||''));
    });

    let empty=list.querySelector('[data-search-empty="1"]');
    const visible=[...list.querySelectorAll('[data-material-id]')].some(row=>!row.hidden);
    if(!visible&&terms.length){
      if(!empty){
        empty=document.createElement('div');
        empty.className='empty';
        empty.dataset.searchEmpty='1';
        empty.textContent='沒有符合條件的素材。';
        list.appendChild(empty);
      }
    }else empty?.remove();
  }

  function installFilteredMaterialsOverride(){
    try{
      if(typeof filteredMaterials!=='function'||typeof materialState==='undefined')return;
      filteredMaterials=function(){
        let rows=materialState.filter(x=>!deletedIds.has(x.id));
        const terms=searchTerms(searchTerm);
        if(terms.length){
          rows=rows.filter(x=>{
            const haystack=[
              x.title,x.content,x.story60,x.research15,x.insight25,
              x.evidence,x.feelings,x.reflection,x.time,x.tags,
              x.experienceCategory,chapterTitle(x),timelineTitle(x),x.stage
            ].join(' ').toLowerCase();
            return terms.every(term=>haystack.includes(term));
          });
        }
        if(stageFilter!=='全部')rows=rows.filter(x=>x.stage===stageFilter);
        if(tagFilter!=='全部')rows=rows.filter(x=>tagsOf(x).includes(tagFilter));
        if(categoryFilter!=='全部')rows=rows.filter(x=>x.experienceCategory===categoryFilter);
        rows=[...rows];
        if(sortMode==='time-asc')rows.sort((a,b)=>timeKey(a.time)-timeKey(b.time));
        if(sortMode==='time-desc')rows.sort((a,b)=>timeKey(b.time)-timeKey(a.time));
        if(sortMode==='status')rows.sort((a,b)=>STAGES.indexOf(a.stage)-STAGES.indexOf(b.stage));
        if(sortMode==='title')rows.sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'zh-Hant'));
        return rows;
      };
    }catch(err){console.warn('material search override fallback',err)}
  }
  installFilteredMaterialsOverride();

  function schedule(value){
    syncMainSearch(value);
    clearTimeout(timer);
    timer=setTimeout(()=>applySearch(value),120);
  }

  document.addEventListener('compositionstart',event=>{
    if(event.target?.id==='materialSearch')composing=true;
  },true);

  document.addEventListener('compositionend',event=>{
    if(event.target?.id!=='materialSearch')return;
    composing=false;
    suppressCommittedInput=true;
    event.stopImmediatePropagation();
    schedule(event.target.value);
    setTimeout(()=>{suppressCommittedInput=false},80);
  },true);

  document.addEventListener('input',event=>{
    if(event.target?.id!=='materialSearch')return;
    if(composing || event.isComposing)return;
    event.stopImmediatePropagation();
    schedule(event.target.value);
    if(suppressCommittedInput)suppressCommittedInput=false;
  },true);

  document.addEventListener('search',event=>{
    if(event.target?.id!=='materialSearch')return;
    event.stopImmediatePropagation();
    schedule(event.target.value);
  },true);

  function ensureFrameworkStyles(){
    if(document.getElementById('materialWritingFrameworkStyles'))return;
    const style=document.createElement('style');
    style.id='materialWritingFrameworkStyles';
    style.textContent=`
      .material-writing-framework{margin:18px 0 8px;border:1px solid var(--line,#ded5c9);border-radius:18px;background:#fffdf9;overflow:hidden}
      .material-writing-head{padding:16px 18px;border-bottom:1px solid var(--line,#ded5c9);background:linear-gradient(135deg,#faf4ef,#f5eee8)}
      .material-writing-head strong{font-family:Georgia,"Noto Serif TC",serif;font-size:17px;display:block;margin-bottom:4px}
      .material-writing-head small{color:var(--muted,#817970);line-height:1.55}
      .writing-ratio-bar{display:grid;grid-template-columns:60fr 15fr 25fr;height:8px;background:#eee;margin-top:12px;border-radius:99px;overflow:hidden}
      .writing-ratio-bar i:nth-child(1){background:#6f4c45}.writing-ratio-bar i:nth-child(2){background:#a98266}.writing-ratio-bar i:nth-child(3){background:#7b3945}
      .writing-block{padding:18px;border-bottom:1px solid var(--line,#ded5c9)}
      .writing-block:last-child{border-bottom:0}
      .writing-block-top{display:flex;gap:12px;align-items:flex-start;margin-bottom:10px}
      .writing-percent{min-width:54px;height:30px;border-radius:99px;display:grid;place-items:center;font-size:12px;font-weight:800;background:#f1e2e5;color:#7b3945}
      .writing-block h4{margin:0 0 3px;font-size:15px}.writing-block p{margin:0;color:var(--muted,#817970);font-size:12px;line-height:1.55}
      .writing-block textarea{width:100%;min-height:150px;border:1px solid var(--line,#ded5c9);background:white;border-radius:12px;padding:13px;resize:vertical;line-height:1.75;font:inherit;color:inherit}
      .writing-block[data-kind="story"] textarea{min-height:220px}
      .writing-block[data-kind="research"] textarea{min-height:125px}
      .writing-block[data-kind="insight"] textarea{min-height:175px}
      .writing-block textarea:focus{outline:2px solid rgba(123,57,69,.14);border-color:#a77b83}
      .material-legacy-details{margin:10px 0 4px;border-top:1px dashed var(--line,#ded5c9);padding-top:10px}
      .material-legacy-details summary{cursor:pointer;color:var(--muted,#817970);font-size:12px;font-weight:700}
      .material-legacy-details .material-story-grid{margin-top:12px}
      .framework-save-note{display:block;margin-top:8px;color:var(--muted,#817970);font-size:11px;text-align:right}
      @media(max-width:700px){.writing-block-top{display:block}.writing-percent{margin-bottom:8px}.material-writing-head,.writing-block{padding:15px}.writing-ratio-bar{grid-template-columns:60fr 15fr 25fr}}
    `;
    document.head.appendChild(style);
  }

  function materialById(id){
    const state=readState();
    const materials=Array.isArray(state.materials)?state.materials:[];
    return materials.find(x=>String(x.id)===String(id));
  }

  function migrateMaterial(item){
    if(!item)return item;
    let changed=false;
    if(item.story60==null || item.story60===''){
      const base=String(item.content||'').trim();
      if(base){item.story60=base;changed=true}else if(item.story60==null){item.story60='';changed=true}
    }
    if(item.research15==null){item.research15='';changed=true}
    if(item.insight25==null || item.insight25===''){
      const base=String(item.reflection||'').trim();
      if(base){item.insight25=base;changed=true}else if(item.insight25==null){item.insight25='';changed=true}
    }
    return {item,changed};
  }

  function saveFrameworkField(id,field,value){
    const state=readState();
    const materials=Array.isArray(state.materials)?state.materials:[];
    const item=materials.find(x=>String(x.id)===String(id));
    if(!item)return;
    item[field]=value;
    if(field==='story60')item.content=value;
    if(field==='insight25')item.reflection=value;
    state.materials=materials;
    writeState(state);
  }

  function frameworkHtml(item){
    const escHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    return `<section class="material-writing-framework" data-framework="1">
      <div class="material-writing-head">
        <strong>寫作配方｜60・15・25</strong>
        <small>先讓故事成立，再用研究解釋，最後把經驗轉成讀者能帶走的方法。</small>
        <div class="writing-ratio-bar" aria-label="60% 人生故事、15% 心理學與決策科學、25% 重新理解與讀者工具"><i></i><i></i><i></i></div>
      </div>
      <div class="writing-block" data-kind="story">
        <div class="writing-block-top"><span class="writing-percent">60%</span><div><h4>人生故事</h4><p>先寫看得見的場景：發生什麼、當時怎麼想、做了什麼、結果如何。不要急著說大道理。</p></div></div>
        <textarea data-framework-field="story60" placeholder="例：那一天發生了什麼？我當時在怕什麼、期待什麼？有哪些具體畫面、對話或轉折？">${escHtml(item.story60||'')}</textarea>
      </div>
      <div class="writing-block" data-kind="research">
        <div class="writing-block-top"><span class="writing-percent">15%</span><div><h4>心理學／決策科學</h4><p>用一個研究概念幫忙解釋故事即可。記下理論名稱、研究發現、來源，以及它和故事的關係。</p></div></div>
        <textarea data-framework-field="research15" placeholder="例：Self-efficacy／Mastery Experience。研究告訴我什麼？這個概念如何解釋我的經驗？來源待確認也可以先記。">${escHtml(item.research15||'')}</textarea>
      </div>
      <div class="writing-block" data-kind="insight">
        <div class="writing-block-top"><span class="writing-percent">25%</span><div><h4>重新理解＋讀者工具</h4><p>回到現在：我如何重新理解這件事？讀者下一次遇到類似問題，可以問自己什麼、做什麼？</p></div></div>
        <textarea data-framework-field="insight25" placeholder="例：以前我以為害怕＝不適合，現在我會先問：我是真的做不到，還是只是沒有做過？再整理成 2–5 個讀者可操作的問題。">${escHtml(item.insight25||'')}</textarea>
        <small class="framework-save-note">✓ 自動儲存；60／15／25 是寫作比例提示，不必逐字精算。</small>
      </div>
    </section>`;
  }

  function decorateEditorRow(row){
    if(!row || row.querySelector('[data-framework="1"]'))return;
    const fields=row.querySelector('.material-editor-fields');
    if(!fields)return;
    const id=row.dataset.materialId;
    const state=readState();
    const materials=Array.isArray(state.materials)?state.materials:[];
    const source=materials.find(x=>String(x.id)===String(id));
    if(!source)return;
    const migrated=migrateMaterial(source);
    if(migrated.changed){state.materials=materials;writeState(state)}

    const titleField=fields.querySelector('.material-title-field');
    const tagsField=titleField?.nextElementSibling;
    const anchor=tagsField||titleField||fields.querySelector('.material-mini-grid');
    const holder=document.createElement('div');
    holder.innerHTML=frameworkHtml(source);
    const framework=holder.firstElementChild;
    anchor?.insertAdjacentElement('afterend',framework);

    const legacyContent=fields.querySelector('[data-material-field="content"]')?.closest('.material-field');
    const legacyGrid=fields.querySelector('.material-story-grid');
    if(legacyContent || legacyGrid){
      const details=document.createElement('details');
      details.className='material-legacy-details';
      const summary=document.createElement('summary');
      summary.textContent='補充資料：證據／當時感受／舊欄位';
      details.appendChild(summary);
      if(legacyContent)details.appendChild(legacyContent);
      if(legacyGrid)details.appendChild(legacyGrid);
      framework.insertAdjacentElement('afterend',details);
    }
  }

  function decorateMaterialEditors(){
    if(decorating)return;
    decorating=true;
    ensureFrameworkStyles();
    document.querySelectorAll('#materialList [data-material-id]').forEach(decorateEditorRow);
    decorating=false;
  }

  document.addEventListener('input',event=>{
    const textarea=event.target?.closest?.('[data-framework-field]');
    if(!textarea)return;
    const row=textarea.closest('[data-material-id]');
    if(!row)return;
    saveFrameworkField(row.dataset.materialId,textarea.dataset.frameworkField,textarea.value);
  },true);

  const observer=new MutationObserver(()=>requestAnimationFrame(decorateMaterialEditors));
  function startFramework(){
    const list=document.getElementById('materialList');
    if(!list){setTimeout(startFramework,120);return}
    observer.observe(list,{childList:true,subtree:true});
    decorateMaterialEditors();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startFramework);
  else startFramework();
})();