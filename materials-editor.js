const STORAGE_KEY='life-archive-writing-studio-v1';
const STAGES=['靈感箱','發展中','可寫作','已放入章節'];
const TIME_PRECISIONS=['精確日期','年月','年份','約略時間','待確認'];
const EXPERIENCE_CATEGORIES=['童年','國小','國中','高中','大學','研究所','工作','旅行','交換','運動','娛樂','挑戰','其他'];
const nativeSetItem=Storage.prototype.setItem;

let materialState=[];
let deletedIds=new Set();
let rendering=false;
let saveTimer=null;
let searchTimer=null;
let searchComposing=false;
let suppressCommittedInput=false;
let viewMode=localStorage.getItem('life-archive-material-view')||'compact';
let searchTerm='';
let stageFilter='全部';
let tagFilter='全部';
let categoryFilter='全部';
let sortMode='time-asc';
let expandedId=null;

function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
function readState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch{return {}}}
function cloneMaterials(list){return Array.isArray(list)?list.map(x=>({...x})):[]}
function normalizeMaterial(item={}){
  const story60=item.story60 ?? item.content ?? '';
  const research15=item.research15 ?? '';
  const insight25=item.insight25 ?? item.reflection ?? '';
  return {
    ...item,
    time:item.time||'',
    timePrecision:item.timePrecision||'待確認',
    tags:item.tags||'',
    chapterId:item.chapterId||'',
    timelineId:item.timelineId||'',
    stage:item.stage||'靈感箱',
    experienceCategory:item.experienceCategory||'其他',
    evidence:item.evidence||'',
    feelings:item.feelings||'',
    reflection:item.reflection||insight25,
    content:item.content||story60,
    story60,
    research15,
    insight25
  };
}
function syncFromStorage(){
  const incoming=cloneMaterials(readState().materials).map(normalizeMaterial);
  if(!materialState.length){materialState=incoming;return}
  const current=new Map(materialState.map(x=>[x.id,x]));
  for(const item of incoming){if(!deletedIds.has(item.id)&&!current.has(item.id))materialState.push(item)}
}
function persist(){
  const state=readState();
  state.materials=materialState.filter(x=>!deletedIds.has(x.id)).map(x=>({...x}));
  nativeSetItem.call(localStorage,STORAGE_KEY,JSON.stringify(state));
  const saved=document.getElementById('saved');if(saved)saved.textContent='已自動儲存在本機';
}
Storage.prototype.setItem=function(key,value){
  if(key!==STORAGE_KEY)return nativeSetItem.call(this,key,value);
  try{
    const incoming=JSON.parse(value||'{}')||{};
    const editorMap=new Map(materialState.map(x=>[x.id,x]));
    for(const raw of cloneMaterials(incoming.materials)){
      const item=normalizeMaterial(raw);
      if(deletedIds.has(item.id))continue;
      if(!editorMap.has(item.id)){materialState.push(item);editorMap.set(item.id,item)}
    }
    incoming.materials=materialState.filter(x=>!deletedIds.has(x.id)).map(x=>({...x}));
    return nativeSetItem.call(this,key,JSON.stringify(incoming));
  }catch{return nativeSetItem.call(this,key,value)}
};

function esc(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function tagsOf(item){return String(item.tags||'').split(/[,，#\s]+/).map(x=>x.trim()).filter(Boolean)}
function searchTerms(value){return String(value||'').trim().toLowerCase().split(/\s+/).filter(Boolean)}
function timeKey(value){
  const s=String(value||'').trim();
  const m=s.match(/(19|20)\d{2}(?:[\/\-.年](\d{1,2}))?(?:[\/\-.月](\d{1,2}))?/);
  if(!m)return 99999999;
  return Number(m[0].slice(0,4))*10000+(Number(m[2]||1)*100)+Number(m[3]||1);
}
function chapterOptions(value){
  const chapters=Array.isArray(readState().chapters)?readState().chapters:[];
  return `<option value="">未指定篇章</option>`+chapters.map(c=>`<option value="${esc(c.id)}"${c.id===value?' selected':''}>${esc(c.title||'未命名章節')}</option>`).join('');
}
function timelineItems(){try{const t=JSON.parse(localStorage.getItem('life-archive-timeline-v1')||'[]');return Array.isArray(t)?t:[]}catch{return []}}
function timelineOptions(value){return `<option value="">未連結時間軸</option>`+timelineItems().map(t=>`<option value="${esc(t.id)}"${t.id===value?' selected':''}>${esc([t.time,t.identity].filter(Boolean).join(' · ')||'未命名事件')}</option>`).join('')}
function timelineTitle(item){const t=timelineItems().find(x=>x.id===item.timelineId);return t?[t.time,t.identity].filter(Boolean).join(' · '):''}
function stageOptions(value){return STAGES.map(s=>`<option${s===value?' selected':''}>${s}</option>`).join('')}
function precisionOptions(value){return TIME_PRECISIONS.map(s=>`<option${s===value?' selected':''}>${s}</option>`).join('')}
function categoryOptions(value){return EXPERIENCE_CATEGORIES.map(s=>`<option${s===value?' selected':''}>${s}</option>`).join('')}
function chapterTitle(item){const c=(readState().chapters||[]).find(x=>x.id===item.chapterId);return c?.title||'未指定篇章'}
function summary(text){const t=String(text||'').replace(/\s+/g,' ').trim();return t.length>105?t.slice(0,105)+'…':t}
function seq(index){return String(index+1).padStart(3,'0')}

function filteredMaterials(){
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
}
function allTags(){return [...new Set(materialState.flatMap(tagsOf))].sort((a,b)=>a.localeCompare(b,'zh-Hant'))}

function toolbarHtml(){
  return `<div class="materials-toolbar">
    <input id="materialSearch" class="materials-search" value="${esc(searchTerm)}" placeholder="搜尋素材、經歷分類、證據、感受、理解、標籤、時間……">
    <select id="materialCategoryFilter"><option>全部</option>${EXPERIENCE_CATEGORIES.map(s=>`<option${s===categoryFilter?' selected':''}>${s}</option>`).join('')}</select>
    <select id="materialStageFilter"><option>全部</option>${STAGES.map(s=>`<option${s===stageFilter?' selected':''}>${s}</option>`).join('')}</select>
    <select id="materialTagFilter"><option>全部</option>${allTags().map(s=>`<option${s===tagFilter?' selected':''}>${esc(s)}</option>`).join('')}</select>
    <select id="materialSort"><option value="time-asc"${sortMode==='time-asc'?' selected':''}>時間 ↑（早 → 晚）</option><option value="time-desc"${sortMode==='time-desc'?' selected':''}>時間 ↓（晚 → 早）</option><option value="status"${sortMode==='status'?' selected':''}>依狀態</option><option value="title"${sortMode==='title'?' selected':''}>依標題</option></select>
    <div class="materials-view-toggle"><button type="button" data-view="compact" class="${viewMode==='compact'?'active':''}">▤ 精簡</button><button type="button" data-view="cards" class="${viewMode==='cards'?'active':''}">▦ 卡片</button></div>
  </div>`;
}

function frameworkHtml(item){
  return `<section class="material-writing-framework" data-framework="1">
    <div class="material-writing-head">
      <strong>寫作配方｜60・15・25</strong>
      <small>先讓故事成立，再用研究解釋，最後把經驗轉成讀者能帶走的方法。</small>
      <div class="writing-ratio-bar" aria-label="60% 人生故事、15% 心理學與決策科學、25% 重新理解與讀者工具"><i></i><i></i><i></i></div>
    </div>
    <div class="writing-block" data-kind="story">
      <div class="writing-block-top"><span class="writing-percent">60%</span><div><h4>人生故事</h4><p>先寫看得見的場景：發生什麼、當時怎麼想、做了什麼、結果如何。不要急著說大道理。</p></div></div>
      <textarea data-framework-field="story60" placeholder="例：那一天發生了什麼？我當時在怕什麼、期待什麼？有哪些具體畫面、對話或轉折？">${esc(item.story60||'')}</textarea>
    </div>
    <div class="writing-block" data-kind="research">
      <div class="writing-block-top"><span class="writing-percent">15%</span><div><h4>心理學／決策科學</h4><p>用一個研究概念幫忙解釋故事即可。記下理論名稱、研究發現、來源，以及它和故事的關係。</p></div></div>
      <textarea data-framework-field="research15" placeholder="例：Self-efficacy／Mastery Experience。研究告訴我什麼？這個概念如何解釋我的經驗？來源待確認也可以先記。">${esc(item.research15||'')}</textarea>
    </div>
    <div class="writing-block" data-kind="insight">
      <div class="writing-block-top"><span class="writing-percent">25%</span><div><h4>重新理解＋讀者工具</h4><p>回到現在：我如何重新理解這件事？讀者下一次遇到類似問題，可以問自己什麼、做什麼？</p></div></div>
      <textarea data-framework-field="insight25" placeholder="例：以前我以為害怕＝不適合，現在我會先問：我是真的做不到，還是只是沒有做過？">${esc(item.insight25||'')}</textarea>
      <small class="framework-save-note">✓ 自動儲存；60／15／25 是寫作比例提示，不必逐字精算。</small>
    </div>
  </section>`;
}
function tagPills(item){const tags=tagsOf(item);return tags.length?`<div class="material-tags">${tags.map(t=>`<span>#${esc(t)}</span>`).join('')}</div>`:'<span class="material-no-tags">尚無標籤</span>'}
function compactRow(item,index){
  const open=expandedId===item.id;
  return `<article class="material-compact-row ${open?'open':''}" data-material-id="${esc(item.id)}">
    <button type="button" class="material-compact-main" data-expand>
      <span class="material-seq">${seq(index)}</span>
      <span class="material-time">${esc(item.time||'時間待補')}</span>
      <span class="material-category">${esc(item.experienceCategory||'其他')}</span>
      <span class="material-compact-title"><strong>${esc(item.title||'未命名素材')}</strong><small>${esc(summary(item.story60||item.content))}</small></span>
      <span class="material-compact-tags">${tagsOf(item).slice(0,2).map(t=>`<i>#${esc(t)}</i>`).join('')||'<i>未標籤</i>'}</span>
      <span class="material-stage stage-${esc(item.stage)}">${esc(item.stage)}</span>
      <span class="material-chevron">${open?'⌃':'⌄'}</span>
    </button>
    ${open?editorFields(item):''}
  </article>`;
}
function card(item,index){return `<article class="material-editor-card" data-material-id="${esc(item.id)}"><div class="material-card-summary"><div><div class="material-card-meta"><span class="material-seq">${seq(index)}</span><span class="material-time">${esc(item.time||'時間待補')}</span><span class="material-category">${esc(item.experienceCategory||'其他')}</span></div><h3>${esc(item.title||'未命名素材')}</h3></div><span class="material-stage stage-${esc(item.stage)}">${esc(item.stage)}</span></div>${tagPills(item)}${editorFields(item,true)}</article>`}
function editorFields(item,always=false){
  return `<div class="material-editor-fields${always?' always':''}">
    <div class="material-mini-grid">
      <label class="material-field"><span>時間</span><input data-material-field="time" value="${esc(item.time)}" placeholder="例：2018/08/03、2023–2026、約2016寒假"></label>
      <label class="material-field"><span>時間精度</span><select data-material-field="timePrecision">${precisionOptions(item.timePrecision)}</select></label>
      <label class="material-field"><span>經歷分類</span><select data-material-field="experienceCategory">${categoryOptions(item.experienceCategory)}</select></label>
      <label class="material-field"><span>寫作狀態</span><select data-material-field="stage">${stageOptions(item.stage)}</select></label>
      <label class="material-field"><span>所屬篇章</span><select data-material-field="chapterId">${chapterOptions(item.chapterId)}</select></label>
      <label class="material-field"><span>來源時間軸</span><select data-material-field="timelineId">${timelineOptions(item.timelineId)}</select></label>
    </div>
    <label class="material-field material-title-field"><span>素材標題</span><input data-material-field="title" value="${esc(item.title||'')}" placeholder="素材標題"></label>
    <label class="material-field"><span>機師特質標籤</span><input data-material-field="tags" value="${esc(item.tags||'')}" placeholder="請從機師特質中選擇"></label>
    ${frameworkHtml(item)}
    <details class="material-legacy-details">
      <summary>補充資料：證據／當時感受／舊欄位</summary>
      <label class="material-field"><span>素材內容／事件</span><textarea data-material-field="content" placeholder="發生了什麼？先保留具體事件、場景與事實。">${esc(item.content||'')}</textarea></label>
      <div class="material-story-grid">
        <label class="material-field"><span>證據／佐證</span><textarea data-material-field="evidence">${esc(item.evidence||'')}</textarea></label>
        <label class="material-field"><span>當時感受</span><textarea data-material-field="feelings">${esc(item.feelings||'')}</textarea></label>
        <label class="material-field"><span>現在理解</span><textarea data-material-field="reflection">${esc(item.reflection||'')}</textarea></label>
      </div>
    </details>
    <div class="material-editor-footer"><span class="material-save-state" data-material-save>✓ 已儲存</span>${item.source?`<span class="material-source">來源：${esc(item.source)}</span>`:''}<button type="button" class="btn material-delete" data-material-delete>刪除</button></div>
  </div>`;
}

function renderMaterialList(){
  const list=document.getElementById('materialList');if(!list)return;
  const rows=filteredMaterials();
  list.className=viewMode==='compact'?'material-library compact':'material-library cards';
  list.innerHTML=rows.length?(viewMode==='compact'?rows.map(compactRow).join(''):rows.map(card).join('')):'<div class="empty">沒有符合條件的素材。</div>';
  bindRows();
  window.LifeArchiveI18n?.translate?.(list);
}
function renderEditor(){
  const list=document.getElementById('materialList');if(!list||rendering)return;
  rendering=true;
  syncFromStorage();
  materialState=materialState.filter(x=>!deletedIds.has(x.id)).map(normalizeMaterial);
  const container=document.getElementById('materialsWorkspace')||document.createElement('div');
  if(!container.id){container.id='materialsWorkspace';list.parentNode.insertBefore(container,list);container.appendChild(list)}
  let toolbar=document.getElementById('materialsToolbarWrap');
  if(!toolbar){toolbar=document.createElement('div');toolbar.id='materialsToolbarWrap';container.insertBefore(toolbar,list)}
  toolbar.innerHTML=toolbarHtml();
  bindToolbar();
  renderMaterialList();
  window.LifeArchiveI18n?.translate?.(toolbar);
  rendering=false;
}

function scheduleSearch(value){
  searchTerm=String(value||'');
  clearTimeout(searchTimer);
  searchTimer=setTimeout(renderMaterialList,120);
}
function bindToolbar(){
  const search=document.getElementById('materialSearch');
  search?.addEventListener('compositionstart',()=>{
    searchComposing=true;
    suppressCommittedInput=false;
  });
  search?.addEventListener('compositionend',e=>{
    searchComposing=false;
    suppressCommittedInput=true;
    scheduleSearch(e.target.value);
    setTimeout(()=>{suppressCommittedInput=false},80);
  });
  search?.addEventListener('input',e=>{
    if(searchComposing||e.isComposing)return;
    if(suppressCommittedInput){
      suppressCommittedInput=false;
      return;
    }
    scheduleSearch(e.target.value);
  });
  search?.addEventListener('search',e=>{
    suppressCommittedInput=false;
    scheduleSearch(e.target.value);
  });
  document.getElementById('materialCategoryFilter')?.addEventListener('change',e=>{categoryFilter=e.target.value;renderMaterialList()});
  document.getElementById('materialStageFilter')?.addEventListener('change',e=>{stageFilter=e.target.value;renderMaterialList()});
  document.getElementById('materialTagFilter')?.addEventListener('change',e=>{tagFilter=e.target.value;renderMaterialList()});
  document.getElementById('materialSort')?.addEventListener('change',e=>{sortMode=e.target.value;renderMaterialList()});
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{viewMode=b.dataset.view;localStorage.setItem('life-archive-material-view',viewMode);renderEditor()}));
}
function bindRows(){
  document.querySelectorAll('#materialList [data-expand]').forEach(b=>b.addEventListener('click',()=>{const id=b.closest('[data-material-id]')?.dataset.materialId;expandedId=expandedId===id?null:id;renderMaterialList()}));
  document.querySelectorAll('#materialList [data-material-field]').forEach(control=>{
    const updateState=()=>{
      const row=control.closest('[data-material-id]');
      const item=materialState.find(x=>String(x.id)===String(row?.dataset.materialId));
      if(!item)return null;
      item[control.dataset.materialField]=control.value;
      if(control.dataset.materialField==='content')item.story60=control.value;
      if(control.dataset.materialField==='reflection')item.insight25=control.value;
      const status=row.querySelector('[data-material-save]');
      if(status)status.textContent='儲存中…';
      return {status};
    };
    if(control.tagName==='SELECT'){
      control.addEventListener('change',()=>{
        const result=updateState();if(!result)return;
        clearTimeout(saveTimer);persist();if(result.status)result.status.textContent='✓ 已儲存';
        if(['stage','chapterId','timelineId','experienceCategory'].includes(control.dataset.materialField))requestAnimationFrame(renderMaterialList);
      });
    }else{
      control.addEventListener('input',()=>{
        const result=updateState();if(!result)return;
        clearTimeout(saveTimer);saveTimer=setTimeout(()=>{persist();if(result.status&&document.contains(result.status))result.status.textContent='✓ 已儲存'},300);
      });
      control.addEventListener('change',()=>{
        const result=updateState();if(!result)return;
        clearTimeout(saveTimer);persist();if(result.status)result.status.textContent='✓ 已儲存';
        if(['tags','time'].includes(control.dataset.materialField))requestAnimationFrame(renderEditor);
      });
    }
  });
  document.querySelectorAll('#materialList [data-material-delete]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.closest('[data-material-id]')?.dataset.materialId;if(!id||!confirm('刪除這筆素材？'))return;
    deletedIds.add(id);materialState=materialState.filter(x=>x.id!==id);persist();if(expandedId===id)expandedId=null;renderEditor();
  }));
}

function createBlankMaterial(){
  const item=normalizeMaterial({
    id:uid(),title:'',content:'',story60:'',research15:'',insight25:'',time:'',timePrecision:'待確認',
    experienceCategory:'其他',tags:'',stage:'靈感箱',chapterId:'',timelineId:'',evidence:'',feelings:'',reflection:'',source:'手動新增'
  });
  materialState.push(item);
  searchTerm='';stageFilter='全部';tagFilter='全部';categoryFilter='全部';expandedId=item.id;
  persist();renderEditor();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const row=document.querySelector(`[data-material-id="${CSS.escape(String(item.id))}"]`);
    row?.querySelector('[data-material-field="title"]')?.focus();
    row?.scrollIntoView({behavior:'smooth',block:'center'});
  }));
}

function addStyles(){
  if(document.getElementById('materialsEditorStyles'))return;
  const style=document.createElement('style');style.id='materialsEditorStyles';style.textContent=`
  #v-materials{max-width:1320px}#v-materials .heading{margin-bottom:14px}#v-materials .heading p{max-width:720px}
  .materials-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}.materials-toolbar input,.materials-toolbar select{border:1px solid var(--line);background:var(--panel);border-radius:10px;padding:9px 10px}.materials-search{flex:1;min-width:260px}.materials-view-toggle{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}.materials-view-toggle button{border:0;background:var(--panel);padding:9px 11px;cursor:pointer;color:var(--muted)}.materials-view-toggle button.active{background:var(--side);color:#fff}
  .material-library{display:grid;gap:7px}.material-library.compact{grid-template-columns:1fr}.material-compact-row{background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden}.material-compact-main{width:100%;border:0;background:transparent;display:grid;grid-template-columns:46px 100px 72px minmax(260px,2.2fr) minmax(150px,1fr) 90px 24px;gap:9px;align-items:center;text-align:left;padding:10px 12px;cursor:pointer}.material-compact-main:hover{background:#faf6f0}.material-seq{font-size:10px;font-weight:900;color:#9a8f86}.material-time{font-size:11px;color:var(--accent);font-weight:800}.material-category{font-size:10px;font-weight:800;background:#f1ece5;border-radius:999px;padding:5px 7px;text-align:center;white-space:nowrap}.material-compact-title{min-width:0}.material-compact-title strong{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.material-compact-title small{display:block;color:var(--muted);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}.material-compact-tags{display:flex;gap:4px;overflow:hidden}.material-compact-tags i,.material-tags span{font-style:normal;font-size:10px;background:var(--soft);color:var(--accent);border-radius:99px;padding:4px 6px;white-space:nowrap}.material-stage{font-size:10px;font-weight:800;border-radius:99px;padding:5px 7px;text-align:center;background:#eee7df}.stage-可寫作{background:#e3efe5;color:#356044}.stage-已放入章節{background:#e2e8f1;color:#405879}.stage-發展中{background:#f5ecd2;color:#7a6427}.stage-靈感箱{background:#ece8e3;color:#6e665f}.material-chevron{color:var(--muted)}
  .material-editor-fields{border-top:1px solid var(--line);padding:14px 15px;background:#fcfaf6}.material-mini-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.material-field{display:grid;gap:5px;margin-bottom:10px}.material-field>span{font-size:10px;color:var(--muted);font-weight:750}.material-field input,.material-field textarea,.material-field select{width:100%;border:1px solid #e3d9ce;border-radius:9px;background:#fff;padding:9px 10px;color:var(--ink)}.material-field textarea{min-height:130px;resize:vertical;line-height:1.65}.material-story-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.material-story-grid textarea{min-height:120px}.material-title-field input{font-weight:750}.material-editor-footer{display:flex;gap:10px;align-items:center}.material-save-state,.material-source,.material-no-tags{font-size:10px;color:var(--muted)}.material-source{margin-right:auto}.material-delete{color:#9c4545;background:transparent}
  .material-library.cards{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.material-editor-card{background:var(--panel);border:1px solid var(--line);border-radius:15px;padding:14px;min-width:0}.material-card-summary{display:flex;justify-content:space-between;gap:12px;align-items:start;margin-bottom:8px}.material-card-summary h3{font-size:15px;margin:5px 0 0}.material-card-meta{display:flex;gap:7px;align-items:center}.material-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}.material-editor-card .material-mini-grid{grid-template-columns:1fr 1fr}.material-editor-card .material-story-grid{grid-template-columns:1fr}.material-editor-card .material-field textarea{min-height:140px}
  .material-writing-framework{margin:18px 0 8px;border:1px solid var(--line);border-radius:18px;background:#fffdf9;overflow:hidden}.material-writing-head{padding:16px 18px;border-bottom:1px solid var(--line);background:linear-gradient(135deg,#faf4ef,#f5eee8)}.material-writing-head strong{font-family:Georgia,"Noto Serif TC",serif;font-size:17px;display:block;margin-bottom:4px}.material-writing-head small{color:var(--muted);line-height:1.55}.writing-ratio-bar{display:grid;grid-template-columns:60fr 15fr 25fr;height:8px;background:#eee;margin-top:12px;border-radius:99px;overflow:hidden}.writing-ratio-bar i:nth-child(1){background:#6f4c45}.writing-ratio-bar i:nth-child(2){background:#a98266}.writing-ratio-bar i:nth-child(3){background:#7b3945}.writing-block{padding:18px;border-bottom:1px solid var(--line)}.writing-block:last-child{border-bottom:0}.writing-block-top{display:flex;gap:12px;align-items:flex-start;margin-bottom:10px}.writing-percent{min-width:54px;height:30px;border-radius:99px;display:grid;place-items:center;font-size:12px;font-weight:800;background:#f1e2e5;color:#7b3945}.writing-block h4{margin:0 0 3px;font-size:15px}.writing-block p{margin:0;color:var(--muted);font-size:12px;line-height:1.55}.writing-block textarea{width:100%;min-height:150px;border:1px solid var(--line);background:white;border-radius:12px;padding:13px;resize:vertical;line-height:1.75;font:inherit;color:inherit}.writing-block[data-kind="story"] textarea{min-height:220px}.writing-block[data-kind="research"] textarea{min-height:125px}.writing-block[data-kind="insight"] textarea{min-height:175px}.material-legacy-details{margin:10px 0 4px;border-top:1px dashed var(--line);padding-top:10px}.material-legacy-details summary{cursor:pointer;color:var(--muted);font-size:12px;font-weight:700}.framework-save-note{display:block;margin-top:8px;color:var(--muted);font-size:11px;text-align:right}
  @media(max-width:1050px){.material-compact-main{grid-template-columns:42px 90px 65px minmax(220px,2fr) 80px 20px}.material-compact-tags{display:none}.material-library.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.material-story-grid{grid-template-columns:1fr}}
  @media(max-width:850px){#v-materials{padding-left:12px;padding-right:12px}.materials-toolbar{display:grid;grid-template-columns:1fr 1fr}.materials-search{grid-column:1/-1;min-width:0}.materials-view-toggle{grid-column:1/-1}.materials-view-toggle button{flex:1}.material-compact-main{grid-template-columns:34px 72px 58px 1fr 20px;gap:6px;padding:10px}.material-stage,.material-compact-tags{display:none}.material-mini-grid{grid-template-columns:1fr 1fr}.material-library.cards{grid-template-columns:1fr}.material-story-grid{grid-template-columns:1fr}.material-field input,.material-field textarea,.material-field select{font-size:16px}.material-editor-footer{flex-wrap:wrap}.material-source{width:100%;order:3}.writing-block-top{display:block}.writing-percent{margin-bottom:8px}.material-writing-head,.writing-block{padding:15px}}
  `;document.head.appendChild(style);
}

function init(){
  const list=document.getElementById('materialList');if(!list)return;
  materialState=cloneMaterials(readState().materials).map(normalizeMaterial);
  addStyles();
  renderEditor();
  document.querySelector('#nav [data-v="materials"]')?.addEventListener('click',()=>setTimeout(renderEditor,0));
  document.getElementById('addMaterial')?.addEventListener('click',event=>{event.preventDefault();createBlankMaterial()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();