import './cloud-state-bridge.js';

const WRITING_KEY='life-archive-writing-studio-v1';
const CLOUD_FLAG='life-archive-cloud-enabled';
const TIMELINE_KEY='life-archive-timeline-v1';
const TIMELINE_REV='life-archive-timeline-cloud-revision';

function safeRead(key,fallback=null){
  try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}
}
function hasText(v){return typeof v==='string'&&v.trim().length>0}
function writingSummary(){
  const s=safeRead(WRITING_KEY,{})||{};
  const chapters=Array.isArray(s.chapters)?s.chapters:[];
  const materials=Array.isArray(s.materials)?s.materials:[];
  const proposal=s.publishingProposal&&typeof s.publishingProposal==='object'?s.publishingProposal:{};
  return {
    chapters:chapters.length,
    materials:materials.length,
    proposal:Object.values(proposal).some(hasText)||hasText(s.title)||hasText(s.core)||hasText(s.reader)
  };
}
function timelineCount(){
  const t=safeRead(TIMELINE_KEY,[]);
  return Array.isArray(t)?t.length:0;
}
function cloudState(){
  return window.LifeArchiveCloudState?.get?.()||{
    signedIn:false,
    enabled:localStorage.getItem(CLOUD_FLAG)==='1',
    syncing:false,
    lastSync:null,
    email:''
  };
}
function stateLabel(kind){
  const cloud=cloudState();
  if(kind==='photos')return {tone:'local',icon:'📱',label:'僅此裝置'};
  if(!cloud.signedIn)return {tone:'warn',icon:'○',label:'尚未登入'};
  if(kind==='timeline'){
    return localStorage.getItem(TIMELINE_REV)
      ?{tone:'ok',icon:'☁',label:'已建立雲端同步'}
      :{tone:'warn',icon:'○',label:'等待首次比對'};
  }
  if(cloud.syncing)return {tone:'busy',icon:'↻',label:'正在同步'};
  return cloud.enabled
    ?{tone:'ok',icon:'☁',label:'雲端同步已啟用'}
    :{tone:'warn',icon:'○',label:'尚未啟用雲端同步'};
}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function addStyle(){
  if(document.getElementById('dataSafetyStyles'))return;
  const s=document.createElement('style');
  s.id='dataSafetyStyles';
  s.textContent=`
  #dataSafetyLauncher{position:fixed;right:18px;bottom:18px;z-index:48;border:1px solid #d8cdc1;background:#fffdf9;color:#4a4039;border-radius:999px;padding:9px 12px;box-shadow:0 8px 25px rgba(50,40,30,.11);font:700 11px -apple-system,BlinkMacSystemFont,"Noto Sans TC",sans-serif;cursor:pointer}
  #dataSafetyPanel{position:fixed;right:18px;bottom:62px;z-index:49;width:min(390px,calc(100vw - 30px));max-height:min(620px,calc(100vh - 100px));overflow:auto;background:#fffdf9;border:1px solid #d8cdc1;border-radius:20px;padding:17px;box-shadow:0 16px 45px rgba(45,35,28,.16);font-family:-apple-system,BlinkMacSystemFont,"Noto Sans TC",sans-serif;color:#292521}
  #dataSafetyPanel[hidden]{display:none}.ds-head{display:flex;justify-content:space-between;gap:12px;align-items:start}.ds-head small{display:block;color:#7f756e;font-size:10px;letter-spacing:.09em;font-weight:800}.ds-head h2{margin:4px 0 4px;font:700 22px Georgia,"Noto Serif TC",serif}.ds-head p{margin:0;color:#817970;font-size:11px;line-height:1.6}.ds-close{border:0;background:#f1ebe4;width:30px;height:30px;border-radius:50%;cursor:pointer;color:#5e554f}.ds-account{margin-top:13px;padding:10px 11px;border-radius:12px;background:#f7f2ec;font-size:11px;color:#6d635c;line-height:1.55}.ds-list{display:grid;gap:8px;margin-top:12px}.ds-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;border:1px solid #e4dbd1;border-radius:13px;padding:11px 12px;background:#fff}.ds-row strong{display:block;font-size:12px}.ds-row small{display:block;color:#8a8078;font-size:10px;margin-top:3px}.ds-badge{font-size:9px;font-weight:800;padding:5px 7px;border-radius:999px;white-space:nowrap}.ds-badge.ok{background:#e4f0e6;color:#356044}.ds-badge.warn{background:#f4eee3;color:#7a6236}.ds-badge.busy{background:#eee8f4;color:#625276}.ds-badge.local{background:#f3e7e7;color:#7b3945}.ds-warning{margin-top:12px;border-left:3px solid #b98991;background:#f7eff0;border-radius:0 12px 12px 0;padding:10px 11px;font-size:10px;color:#655751;line-height:1.65}.ds-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.ds-actions button{border:1px solid #ded5c9;background:#fffdf9;color:#4a4039;border-radius:9px;padding:8px 10px;font:700 10px inherit;cursor:pointer}.ds-actions button.primary{background:#7b3945;color:#fff;border-color:#7b3945}
  @media(max-width:850px){#dataSafetyLauncher{right:14px;bottom:14px}#dataSafetyPanel{right:14px;bottom:58px}}
  `;
  document.head.appendChild(s);
}

function render(){
  const panel=document.getElementById('dataSafetyPanel');
  if(!panel)return;
  const w=writingSummary();
  const cloud=cloudState();
  const rows=[
    ['書稿與章節',`${w.chapters} 個章節`,stateLabel('writing')],
    ['故事素材',`${w.materials} 筆素材`,stateLabel('writing')],
    ['全書定位',w.proposal?'已有內容':'尚未開始',stateLabel('writing')],
    ['人生時間軸',`${timelineCount()} 筆事件`,stateLabel('timeline')],
    ['照片回憶','IndexedDB 本機保存',stateLabel('photos')]
  ];
  const last=cloud.lastSync?new Date(cloud.lastSync).toLocaleString('zh-TW',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'';
  panel.innerHTML=`
    <div class="ds-head"><div><small>DATA SAFETY</small><h2>資料安全</h2><p>看清楚哪些資料有雲端保護，哪些仍只存在這台裝置。</p></div><button class="ds-close" type="button" aria-label="關閉">×</button></div>
    <div class="ds-account">${cloud.signedIn?`✓ 已登入${cloud.email?` · ${esc(cloud.email)}`:''}${last?`<br>最近一次本次工作階段同步：${esc(last)}`:''}`:'尚未登入 Google。文字仍會保存在目前瀏覽器，但不能把「本機有資料」視為「已有雲端備份」。'}</div>
    <div class="ds-list">${rows.map(([name,detail,status])=>`<div class="ds-row"><div><strong>${esc(name)}</strong><small>${esc(detail)}</small></div><span class="ds-badge ${status.tone}">${status.icon} ${esc(status.label)}</span></div>`).join('')}</div>
    <div class="ds-warning"><strong>照片要特別注意：</strong>目前照片回憶不會跟著 Firestore 跨裝置同步。換 iPhone、清除 Safari 網站資料或移除網站資料以前，請先到「照片回憶」匯出照片 JSON。</div>
    <div class="ds-actions"><button class="primary" type="button" data-ds-go="export">前往備份與匯出</button><button type="button" data-ds-go="memories">照片回憶</button></div>`;
  panel.querySelector('.ds-close').onclick=()=>{panel.hidden=true};
  panel.querySelectorAll('[data-ds-go]').forEach(btn=>btn.onclick=()=>{
    panel.hidden=true;
    window.LifeArchiveNavigate?.(btn.dataset.dsGo);
  });
}

function init(){
  addStyle();
  if(document.getElementById('dataSafetyLauncher'))return;
  const launcher=document.createElement('button');
  launcher.id='dataSafetyLauncher';launcher.type='button';launcher.textContent='◉ 資料安全';
  const panel=document.createElement('section');panel.id='dataSafetyPanel';panel.hidden=true;
  document.body.append(panel,launcher);
  launcher.onclick=()=>{render();panel.hidden=!panel.hidden};
  window.addEventListener('life-archive:cloud-state',render);
  window.addEventListener('life-archive:timeline-loaded',render);
  window.addEventListener('storage',e=>{if([WRITING_KEY,TIMELINE_KEY,CLOUD_FLAG,TIMELINE_REV].includes(e.key))render()});
  window.LifeArchiveDataSafety={open:()=>{render();panel.hidden=false},render};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
