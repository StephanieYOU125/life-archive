const TIMELINE_KEY='life-archive-timeline-v1';
const TIMELINE_SORT_KEY='life-archive-timeline-sort-v1';
const TIMELINE_STATUSES=['已確認','部分確認','待確認','有矛盾'];
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);

const SEED=[];

let timeline=[];
let filter='全部';
let search='';
let sortDirection=localStorage.getItem(TIMELINE_SORT_KEY)==='desc'?'desc':'asc';
let saveTimer;

function load(){
  try{
    const saved=JSON.parse(localStorage.getItem(TIMELINE_KEY)||'null');
    timeline=Array.isArray(saved)&&saved.length?saved:SEED;
  }catch{timeline=SEED}
  if(!localStorage.getItem(TIMELINE_KEY)) save();
}
function save(){localStorage.setItem(TIMELINE_KEY,JSON.stringify(timeline));}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function scheduleSave(label){clearTimeout(saveTimer);if(label)label.textContent='儲存中…';saveTimer=setTimeout(()=>{save();if(label)label.textContent='✓ 已儲存';updateStats();},250);}
function statusClass(s){return s==='已確認'?'ok':s==='部分確認'?'partial':s==='有矛盾'?'conflict':'pending';}

function parseTimelineTime(value){
  const raw=String(value||'').trim();
  if(!raw)return null;

  let year,month=0,day=0;
  const roc=raw.match(/民國\s*(\d{2,3})\s*年(?:\s*(\d{1,2})\s*月)?(?:\s*(\d{1,2})\s*日)?/);
  if(roc){
    year=Number(roc[1])+1911;month=Number(roc[2]||0);day=Number(roc[3]||0);
  }else{
    const zh=raw.match(/((?:19|20)\d{2})\s*年(?:\s*(\d{1,2})\s*月)?(?:\s*(\d{1,2})\s*日)?/);
    const numeric=raw.match(/((?:19|20)\d{2})(?:\s*[-/.]\s*(\d{1,2}))?(?:\s*[-/.]\s*(\d{1,2}))?/);
    const m=zh||numeric;
    if(!m)return null;
    year=Number(m[1]);month=Number(m[2]||0);day=Number(m[3]||0);
  }
  if(month<0||month>12||day<0||day>31)return null;
  return year*10000+month*100+day;
}

function sortTimelineRows(items){
  return items.map((item,index)=>({item,index,key:parseTimelineTime(item.time),blank:!String(item.time||'').trim()})).sort((a,b)=>{
    if(a.blank!==b.blank)return a.blank?-1:1;
    if(a.blank&&b.blank)return a.index-b.index;
    if(a.key===null&&b.key===null)return a.index-b.index;
    if(a.key===null)return 1;
    if(b.key===null)return -1;
    if(a.key===b.key)return a.index-b.index;
    return sortDirection==='desc'?b.key-a.key:a.key-b.key;
  }).map(x=>x.item);
}

function injectStyle(){
  if(document.getElementById('timelineStyles'))return;
  const s=document.createElement('style');s.id='timelineStyles';s.textContent=`
  #v-timeline{max-width:1400px}
  .timeline-hero{background:linear-gradient(145deg,#2b2623,#453233);color:#fff;border-radius:22px;padding:25px 27px;margin-bottom:16px}
  .timeline-hero h1{font-family:Georgia,"Noto Serif TC",serif;margin:6px 0 8px;font-size:34px}.timeline-hero p{color:#ded4cf;line-height:1.7;margin:0}
  .timeline-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}.timeline-stat{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:13px}.timeline-stat strong{font-size:24px;display:block}.timeline-stat small{color:var(--muted)}
  .timeline-toolbar{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin:14px 0}.timeline-toolbar input,.timeline-toolbar select{border:1px solid var(--line);background:var(--panel);border-radius:10px;padding:10px 12px}.timeline-search{flex:1;min-width:220px}.timeline-sort{min-width:150px}.timeline-table-wrap{overflow:auto;border:1px solid var(--line);border-radius:16px;background:var(--panel)}
  .timeline-table{width:100%;border-collapse:collapse;min-width:1180px}.timeline-table th{position:sticky;top:0;background:#eee7de;text-align:left;font-size:11px;color:#665d55;padding:11px;border-bottom:1px solid var(--line);z-index:2}.timeline-table td{vertical-align:top;padding:9px;border-bottom:1px solid #eee7df}.timeline-table tr:last-child td{border-bottom:0}
  .timeline-table input,.timeline-table textarea,.timeline-table select{width:100%;border:1px solid transparent;background:transparent;border-radius:8px;padding:7px;line-height:1.55}.timeline-table textarea{resize:vertical;min-height:86px}.timeline-table input:focus,.timeline-table textarea:focus,.timeline-table select:focus{outline:2px solid rgba(123,57,69,.12);border-color:var(--accent);background:#fff}
  .timeline-status-pill{display:inline-block;border-radius:99px;padding:5px 8px;font-size:10px;font-weight:800;margin-bottom:5px}.timeline-status-pill.ok{background:#e3efe5;color:#356044}.timeline-status-pill.partial{background:#f5ecd2;color:#7a6427}.timeline-status-pill.pending{background:#ece8e3;color:#6e665f}.timeline-status-pill.conflict{background:#f5dddd;color:#8a4141}
  .timeline-row-actions{display:flex;justify-content:flex-end}.timeline-delete{border:0;background:transparent;color:#9c4545;cursor:pointer;padding:6px}.timeline-empty{padding:30px;text-align:center;color:var(--muted)}
  .timeline-save{font-size:11px;color:var(--muted);white-space:nowrap}.timeline-sort-note{font-size:10px;color:var(--muted);flex-basis:100%;margin-top:-3px}
  @media(max-width:850px){#v-timeline{padding-left:12px;padding-right:12px}.timeline-stats{grid-template-columns:1fr 1fr}.timeline-hero{padding:20px}.timeline-hero h1{font-size:28px}.timeline-sort{min-width:0}.timeline-table-wrap{border:0;background:transparent;overflow:visible}.timeline-table{min-width:0;display:block}.timeline-table thead{display:none}.timeline-table tbody{display:grid;gap:12px}.timeline-table tr{display:block;background:var(--panel);border:1px solid var(--line);border-radius:15px;padding:12px}.timeline-table td{display:grid;grid-template-columns:88px 1fr;gap:8px;border:0;padding:5px}.timeline-table td:before{content:attr(data-label);font-size:11px;color:var(--muted);font-weight:700;padding-top:8px}.timeline-table textarea{min-height:95px}.timeline-row-actions{justify-content:flex-start}}
  `;document.head.appendChild(s);
}

function makeShell(){
  if(document.getElementById('v-timeline'))return;
  const section=document.createElement('section');section.className='view';section.id='v-timeline';section.innerHTML=`
    <div class="timeline-hero"><span class="eyebrow" style="color:#e6c8c1">LIFE TIMELINE × EVIDENCE</span><h1>人生時間軸</h1><p>把「發生了什麼」和「最後得到什麼」放在一起。已確認的可以拿去寫履歷或面試；待確認與有矛盾的項目則留給自己補證據。</p></div>
    <div class="timeline-stats"><div class="timeline-stat"><strong id="tlTotal">0</strong><small>全部事件</small></div><div class="timeline-stat"><strong id="tlConfirmed">0</strong><small>已確認</small></div><div class="timeline-stat"><strong id="tlPartial">0</strong><small>部分確認</small></div><div class="timeline-stat"><strong id="tlNeeds">0</strong><small>待確認／有矛盾</small></div></div>
    <div class="timeline-toolbar"><input id="tlSearch" class="timeline-search" placeholder="搜尋時間、經歷、能力、成果……"><select id="tlFilter"><option>全部</option>${TIMELINE_STATUSES.map(x=>`<option>${x}</option>`).join('')}</select><select id="tlSort" class="timeline-sort"><option value="asc">時間：早 → 晚</option><option value="desc">時間：晚 → 早</option></select><button class="btn primary" id="tlAdd">＋ 新增事件</button><button class="btn" id="tlExport">匯出 JSON</button><span class="timeline-save" id="tlSave">✓ 已儲存</span><div class="timeline-sort-note">新增的空白事件會暫時留在最上方；填完時間並離開欄位後，會自動移到正確位置。支援 2019、2019-10、2019/10/03、2019年10月、民國108年等格式。</div></div>
    <div class="timeline-table-wrap"><table class="timeline-table"><thead><tr><th style="width:12%">時間</th><th style="width:16%">身分／經歷</th><th style="width:27%">履歷／面試可以怎麼用</th><th style="width:24%">成果／能力</th><th style="width:17%">確認狀態</th><th style="width:4%"></th></tr></thead><tbody id="tlBody"></tbody></table></div>`;
  const materials=document.getElementById('v-materials');materials?.insertAdjacentElement('afterend',section);
}

function openTimeline(){
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.getElementById('v-timeline')?.classList.add('active');
  document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.v==='timeline'));
  const crumb=document.getElementById('crumb');if(crumb)crumb.textContent='人生時間軸';
  document.getElementById('side')?.classList.remove('open');
  render();
}

window.LifeArchiveTimelineUI={open:openTimeline};

function updateStats(){
  const set=(id,n)=>{const el=document.getElementById(id);if(el)el.textContent=n};
  set('tlTotal',timeline.length);set('tlConfirmed',timeline.filter(x=>x.status==='已確認').length);set('tlPartial',timeline.filter(x=>x.status==='部分確認').length);set('tlNeeds',timeline.filter(x=>x.status==='待確認'||x.status==='有矛盾').length);
}

function visibleRows(){
  const q=search.trim().toLowerCase();
  const rows=timeline.filter(x=>(filter==='全部'||x.status===filter)&&(!q||[x.time,x.identity,x.resume,x.result,x.status,x.note].join(' ').toLowerCase().includes(q)));
  return sortTimelineRows(rows);
}

function render(){
  const body=document.getElementById('tlBody');if(!body)return;const rows=visibleRows();
  body.innerHTML=rows.length?rows.map(x=>`<tr data-id="${x.id}">
    <td data-label="時間"><textarea data-f="time" placeholder="例如：2019-10">${esc(x.time)}</textarea></td>
    <td data-label="身分／經歷"><textarea data-f="identity">${esc(x.identity)}</textarea></td>
    <td data-label="履歷／面試"><textarea data-f="resume">${esc(x.resume)}</textarea></td>
    <td data-label="成果／能力"><textarea data-f="result">${esc(x.result)}</textarea></td>
    <td data-label="確認狀態"><span class="timeline-status-pill ${statusClass(x.status)}">${esc(x.status)}</span><select data-f="status">${TIMELINE_STATUSES.map(s=>`<option${s===x.status?' selected':''}>${s}</option>`).join('')}</select><textarea data-f="note" placeholder="待補資料／矛盾說明">${esc(x.note)}</textarea></td>
    <td data-label=""><div class="timeline-row-actions"><button class="timeline-delete" data-del title="刪除">✕</button></div></td></tr>`).join(''):'<tr><td colspan="6"><div class="timeline-empty">沒有符合條件的事件。</div></td></tr>';
  body.querySelectorAll('[data-f]').forEach(el=>{
    const commit=(shouldRender=false)=>{
      const row=el.closest('tr');const item=timeline.find(x=>x.id===row?.dataset.id);if(!item)return;
      item[el.dataset.f]=el.value;
      if(el.dataset.f==='status'){save();render();return;}
      scheduleSave(document.getElementById('tlSave'));
      if(shouldRender&&el.dataset.f==='time'){save();render();}
    };
    el.addEventListener('input',()=>commit(false));
    el.addEventListener('change',()=>commit(true));
  });
  body.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const id=b.closest('tr')?.dataset.id;if(id&&confirm('刪除這筆時間軸事件？')){timeline=timeline.filter(x=>x.id!==id);save();render();updateStats();}});
  updateStats();
}

function bind(){
  const searchEl=document.getElementById('tlSearch'),filterEl=document.getElementById('tlFilter'),sortEl=document.getElementById('tlSort');
  if(sortEl)sortEl.value=sortDirection;
  searchEl?.addEventListener('input',()=>{search=searchEl.value;render();});
  filterEl?.addEventListener('change',()=>{filter=filterEl.value;render();});
  sortEl?.addEventListener('change',()=>{sortDirection=sortEl.value==='desc'?'desc':'asc';localStorage.setItem(TIMELINE_SORT_KEY,sortDirection);render();});
  document.getElementById('tlAdd')?.addEventListener('click',()=>{timeline.unshift({id:uid(),time:'',identity:'',resume:'',result:'',status:'待確認',note:''});save();filter='全部';search='';if(searchEl)searchEl.value='';if(filterEl)filterEl.value='全部';render();document.querySelector('#tlBody tr:first-child [data-f="time"]')?.focus();});
  document.getElementById('tlExport')?.addEventListener('click',()=>{const ordered=sortTimelineRows(timeline);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({version:2,exportedAt:new Date().toISOString(),sortDirection,items:ordered},null,2)],{type:'application/json'}));a.download='life-archive-timeline-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);});
}

function init(){load();injectStyle();makeShell();bind();updateStats();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
