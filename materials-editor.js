const STORAGE_KEY='life-archive-writing-studio-v1';
const STAGES=['靈感箱','發展中','可寫作','已放入章節'];
const TIME_PRECISIONS=['精確日期','年月','年份','約略時間','待確認'];
const nativeSetItem=Storage.prototype.setItem;

let materialState=[];
let deletedIds=new Set();
let rendering=false;
let saveTimer=null;
let viewMode=localStorage.getItem('life-archive-material-view')||'compact';
let searchTerm='';
let stageFilter='全部';
let tagFilter='全部';
let sortMode='time-asc';
let expandedId=null;

function readState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch{return {}}}
function cloneMaterials(list){return Array.isArray(list)?list.map(x=>({...x})):[]}
function normalizeMaterial(item){return {...item,time:item.time||'',timePrecision:item.timePrecision||'待確認',tags:item.tags||'',chapterId:item.chapterId||'',timelineId:item.timelineId||'',stage:item.stage||'靈感箱'}}
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
function chapterTitle(item){const c=(readState().chapters||[]).find(x=>x.id===item.chapterId);return c?.title||'未指定篇章'}
function summary(text){const t=String(text||'').replace(/\s+/g,' ').trim();return t.length>105?t.slice(0,105)+'…':t}

function filteredMaterials(){
  let rows=materialState.filter(x=>!deletedIds.has(x.id));
  if(searchTerm.trim()){
    const q=searchTerm.trim().toLowerCase();
    rows=rows.filter(x=>[x.title,x.content,x.time,x.tags,chapterTitle(x),timelineTitle(x),x.stage].join(' ').toLowerCase().includes(q));
  }
  if(stageFilter!=='全部')rows=rows.filter(x=>x.stage===stageFilter);
  if(tagFilter!=='全部')rows=rows.filter(x=>tagsOf(x).includes(tagFilter));
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
    <input id="materialSearch" class="materials-search" value="${esc(searchTerm)}" placeholder="搜尋素材、標籤、時間、篇章……">
    <select id="materialStageFilter"><option>全部</option>${STAGES.map(s=>`<option${s===stageFilter?' selected':''}>${s}</option>`).join('')}</select>
    <select id="materialTagFilter"><option>全部</option>${allTags().map(s=>`<option${s===tagFilter?' selected':''}>${esc(s)}</option>`).join('')}</select>
    <select id="materialSort"><option value="time-asc"${sortMode==='time-asc'?' selected':''}>時間 ↑</option><option value="time-desc"${sortMode==='time-desc'?' selected':''}>時間 ↓</option><option value="status"${sortMode==='status'?' selected':''}>依狀態</option><option value="title"${sortMode==='title'?' selected':''}>依標題</option></select>
    <div class="materials-view-toggle"><button type="button" data-view="compact" class="${viewMode==='compact'?'active':''}">▤ 精簡</button><button type="button" data-view="cards" class="${viewMode==='cards'?'active':''}">▦ 卡片</button></div>
  </div>`;
}

function tagPills(item){const tags=tagsOf(item);return tags.length?`<div class="material-tags">${tags.map(t=>`<span>#${esc(t)}</span>`).join('')}</div>`:'<span class="material-no-tags">尚無標籤</span>'}
function compactRow(item){
  const open=expandedId===item.id;
  return `<article class="material-compact-row ${open?'open':''}" data-material-id="${esc(item.id)}">
    <button type="button" class="material-compact-main" data-expand>
      <span class="material-time">${esc(item.time||'時間待補')}</span>
      <span class="material-compact-title"><strong>${esc(item.title||'未命名素材')}</strong><small>${esc(summary(item.content))}</small></span>
      <span class="material-compact-tags">${tagsOf(item).slice(0,3).map(t=>`<i>#${esc(t)}</i>`).join('')||'<i>未標籤</i>'}</span>
      <span class="material-chapter">${esc(chapterTitle(item))}</span>
      <span class="material-stage stage-${esc(item.stage)}">${esc(item.stage)}</span>
      <span class="material-chevron">${open?'⌃':'⌄'}</span>
    </button>
    ${open?editorFields(item):''}
  </article>`;
}
function card(item){return `<article class="material-editor-card" data-material-id="${esc(item.id)}"><div class="material-card-summary"><div><span class="material-time">${esc(item.time||'時間待補')}</span><h3>${esc(item.title||'未命名素材')}</h3></div><span class="material-stage stage-${esc(item.stage)}">${esc(item.stage)}</span></div>${tagPills(item)}${editorFields(item,true)}</article>`}
function editorFields(item,always=false){
  return `<div class="material-editor-fields${always?' always':''}">
    <div class="material-mini-grid">
      <label class="material-field"><span>時間</span><input data-material-field="time" value="${esc(item.time)}" placeholder="例：2018/08/03、2023–2026、約2016寒假"></label>
      <label class="material-field"><span>時間精度</span><select data-material-field="timePrecision">${precisionOptions(item.timePrecision)}</select></label>
      <label class="material-field"><span>寫作狀態</span><select data-material-field="stage">${stageOptions(item.stage)}</select></label>
      <label class="material-field"><span>所屬篇章</span><select data-material-field="chapterId">${chapterOptions(item.chapterId)}</select></label>
      <label class="material-field"><span>來源時間軸</span><select data-material-field="timelineId">${timelineOptions(item.timelineId)}</select></label>
    </div>
    <label class="material-field material-title-field"><span>素材標題</span><input data-material-field="title" value="${esc(item.title||'')}" placeholder="素材標題"></label>
    <label class="material-field"><span>標籤</span><input data-material-field="tags" value="${esc(item.tags||'')}" placeholder="例：警察, SOP, 團隊, 風險"></label>
    <label class="material-field"><span>素材內容</span><textarea data-material-field="content" placeholder="事件、場景、想法、Safety Systems 概念……">${esc(item.content||'')}</textarea></label>
    <div class="material-editor-footer"><span class="material-save-state" data-material-save>✓ 已儲存</span>${item.source?`<span class="material-source">來源：${esc(item.source)}</span>`:''}<button type="button" class="btn material-delete" data-material-delete>刪除</button></div>
  </div>`;
}

function renderEditor(){
  const list=document.getElementById('materialList');if(!list||rendering)return;
  rendering=true;syncFromStorage();materialState=materialState.filter(x=>!deletedIds.has(x.id)).map(normalizeMaterial);
  const container=document.getElementById('materialsWorkspace')||document.createElement('div');
  if(!container.id){container.id='materialsWorkspace';list.parentNode.insertBefore(container,list);container.appendChild(list)}
  let toolbar=document.getElementById('materialsToolbarWrap');if(!toolbar){toolbar=document.createElement('div');toolbar.id='materialsToolbarWrap';container.insertBefore(toolbar,list)}
  toolbar.innerHTML=toolbarHtml();
  const rows=filteredMaterials();
  list.className=viewMode==='compact'?'material-library compact':'material-library cards';
  list.innerHTML=rows.length?(viewMode==='compact'?rows.map(compactRow).join(''):rows.map(card).join('')):'<div class="empty">沒有符合條件的素材。</div>';
  bindToolbar();bindRows();rendering=false;
}

function bindToolbar(){
  document.getElementById('materialSearch')?.addEventListener('input',e=>{searchTerm=e.target.value;renderEditor()});
  document.getElementById('materialStageFilter')?.addEventListener('change',e=>{stageFilter=e.target.value;renderEditor()});
  document.getElementById('materialTagFilter')?.addEventListener('change',e=>{tagFilter=e.target.value;renderEditor()});
  document.getElementById('materialSort')?.addEventListener('change',e=>{sortMode=e.target.value;renderEditor()});
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{viewMode=b.dataset.view;localStorage.setItem('life-archive-material-view',viewMode);renderEditor()}));
}
function bindRows(){
  document.querySelectorAll('[data-expand]').forEach(b=>b.addEventListener('click',()=>{const id=b.closest('[data-material-id]')?.dataset.materialId;expandedId=expandedId===id?null:id;renderEditor()}));
  document.querySelectorAll('[data-material-field]').forEach(control=>{
    const saveChange=()=>{
      const card=control.closest('[data-material-id]');const item=materialState.find(x=>x.id===card?.dataset.materialId);if(!item)return;
      item[control.dataset.materialField]=control.value;
      const status=card.querySelector('[data-material-save]');if(status)status.textContent='儲存中…';
      clearTimeout(saveTimer);saveTimer=setTimeout(()=>{persist();if(status)status.textContent='✓ 已儲存';if(['tags','stage','chapterId','timelineId','time'].includes(control.dataset.materialField))setTimeout(renderEditor,50)},300);
    };
    control.addEventListener('input',saveChange);control.addEventListener('change',saveChange);
  });
  document.querySelectorAll('[data-material-delete]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.closest('[data-material-id]')?.dataset.materialId;if(!id||!confirm('刪除這筆素材？'))return;
    deletedIds.add(id);materialState=materialState.filter(x=>x.id!==id);persist();if(expandedId===id)expandedId=null;renderEditor();
  }));
}

function addStyles(){
  if(document.getElementById('materialsEditorStyles'))return;
  const style=document.createElement('style');style.id='materialsEditorStyles';style.textContent=`
  #v-materials{max-width:1320px}#v-materials .heading{margin-bottom:14px}#v-materials .heading p{max-width:720px}
  .materials-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}.materials-toolbar input,.materials-toolbar select{border:1px solid var(--line);background:var(--panel);border-radius:10px;padding:9px 10px}.materials-search{flex:1;min-width:240px}.materials-view-toggle{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}.materials-view-toggle button{border:0;background:var(--panel);padding:9px 11px;cursor:pointer;color:var(--muted)}.materials-view-toggle button.active{background:var(--side);color:#fff}
  .material-library{display:grid;gap:7px}.material-library.compact{grid-template-columns:1fr}.material-compact-row{background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden}.material-compact-main{width:100%;border:0;background:transparent;display:grid;grid-template-columns:105px minmax(260px,2.2fr) minmax(150px,1fr) minmax(180px,1.3fr) 90px 24px;gap:10px;align-items:center;text-align:left;padding:10px 12px;cursor:pointer}.material-compact-main:hover{background:#faf6f0}.material-time{font-size:11px;color:var(--accent);font-weight:800}.material-compact-title{min-width:0}.material-compact-title strong{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.material-compact-title small{display:block;color:var(--muted);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}.material-compact-tags{display:flex;gap:4px;overflow:hidden}.material-compact-tags i,.material-tags span{font-style:normal;font-size:10px;background:var(--soft);color:var(--accent);border-radius:99px;padding:4px 6px;white-space:nowrap}.material-chapter{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.material-stage{font-size:10px;font-weight:800;border-radius:99px;padding:5px 7px;text-align:center;background:#eee7df}.stage-可寫作{background:#e3efe5;color:#356044}.stage-已放入章節{background:#e2e8f1;color:#405879}.stage-發展中{background:#f5ecd2;color:#7a6427}.stage-靈感箱{background:#ece8e3;color:#6e665f}.material-chevron{color:var(--muted)}
  .material-editor-fields{border-top:1px solid var(--line);padding:14px 15px;background:#fcfaf6}.material-mini-grid{display:grid;grid-template-columns:1fr 1fr 1fr 2fr;gap:9px}.material-field{display:grid;gap:5px;margin-bottom:10px}.material-field>span{font-size:10px;color:var(--muted);font-weight:750}.material-field input,.material-field textarea,.material-field select{width:100%;border:1px solid #e3d9ce;border-radius:9px;background:#fff;padding:9px 10px;color:var(--ink)}.material-field textarea{min-height:130px;resize:vertical;line-height:1.65}.material-title-field input{font-weight:750}.material-editor-footer{display:flex;gap:10px;align-items:center}.material-save-state,.material-source,.material-no-tags{font-size:10px;color:var(--muted)}.material-source{margin-right:auto}.material-delete{color:#9c4545;background:transparent}
  .material-library.cards{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.material-editor-card{background:var(--panel);border:1px solid var(--line);border-radius:15px;padding:14px;min-width:0}.material-card-summary{display:flex;justify-content:space-between;gap:12px;align-items:start;margin-bottom:8px}.material-card-summary h3{font-size:15px;margin:4px 0 0}.material-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}.material-editor-card .material-mini-grid{grid-template-columns:1fr 1fr}.material-editor-card .material-field textarea{min-height:150px}
  @media(max-width:1050px){.material-compact-main{grid-template-columns:90px minmax(220px,2fr) minmax(120px,1fr) 80px 24px}.material-chapter{display:none}.material-library.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:850px){#v-materials{padding-left:12px;padding-right:12px}.materials-toolbar{display:grid;grid-template-columns:1fr 1fr}.materials-search{grid-column:1/-1;min-width:0}.materials-view-toggle{grid-column:1/-1}.materials-view-toggle button{flex:1}.material-compact-main{grid-template-columns:74px 1fr 76px 20px;gap:7px;padding:10px}.material-compact-tags,.material-chapter{display:none}.material-compact-title small{max-width:100%}.material-mini-grid{grid-template-columns:1fr 1fr}.material-library.cards{grid-template-columns:1fr}.material-field input,.material-field textarea,.material-field select{font-size:16px}.material-editor-footer{flex-wrap:wrap}.material-source{width:100%;order:3}}
  `;document.head.appendChild(style);
}

function init(){
  const list=document.getElementById('materialList');if(!list)return;
  materialState=cloneMaterials(readState().materials).map(normalizeMaterial);addStyles();renderEditor();
  const observer=new MutationObserver(()=>{if(rendering)return;requestAnimationFrame(renderEditor)});observer.observe(list,{childList:true});
  document.querySelector('#nav [data-v="materials"]')?.addEventListener('click',()=>setTimeout(renderEditor,0));
  const addButton=document.getElementById('addMaterial');addButton?.addEventListener('click',()=>setTimeout(()=>{syncFromStorage();const newest=materialState[materialState.length-1];if(newest)expandedId=newest.id;renderEditor()},60));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
