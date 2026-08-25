import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig={
  apiKey:"AIzaSyCaZnmoChuGKYUqRfYKgsV29liGqokiSjA",
  authDomain:"life-archive-2d4a6.firebaseapp.com",
  projectId:"life-archive-2d4a6",
  storageBucket:"life-archive-2d4a6.firebasestorage.app",
  messagingSenderId:"499371823629",
  appId:"1:499371823629:web:878bbd928bc86fc0197b44",
  measurementId:"G-C4NSZW459D"
};

const KEY='life-archive-text-memories-v1';
const CLOUD_FLAG='life-archive-cloud-enabled';
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
let items=readLocal();
let cloudUser=null;
let saveTimer=null;

function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function readLocal(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function writeLocal(){localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new CustomEvent('lifearchive:text-memories-updated',{detail:items.map(x=>({...x}))}))}
function now(){return new Date().toISOString()}
function blank(extra={}){const t=now();return {id:uid(),title:'',when:'',stage:'其他',place:'',photoLocation:'',photoId:'',people:'',story:'',feeling:'',reflection:'',chapterIds:'',created:t,updated:t,...extra}}
function stages(value){const list=['國小','國中','高中','大學','研究所','工作','旅行','交換','運動','娛樂','挑戰','其他'];return list.map(x=>`<option${x===value?' selected':''}>${x}</option>`).join('')}

function status(text,mode=''){
  const el=document.getElementById('textMemoryCloudStatus');if(!el)return;
  el.className='tm-cloud-status '+mode;el.textContent=text;
}

async function syncOne(item){
  if(!cloudUser||localStorage.getItem(CLOUD_FLAG)!=='1')return;
  try{
    await setDoc(doc(db,'users',cloudUser.uid,'memories',String(item.id)),{...JSON.parse(JSON.stringify(item)),updatedAt:serverTimestamp()},{merge:true});
    status('☁ 已同步到雲端','ok');
  }catch(err){console.error(err);status('雲端同步失敗','error')}
}
async function deleteCloud(id){
  if(!cloudUser||localStorage.getItem(CLOUD_FLAG)!=='1')return;
  try{await deleteDoc(doc(db,'users',cloudUser.uid,'memories',String(id)));status('☁ 已同步刪除','ok')}catch(err){console.error(err);status('雲端刪除失敗','error')}
}
async function uploadAll(){
  if(!cloudUser)return status('請先使用右上角 Google 登入');
  status('正在同步…','busy');
  try{await Promise.all(items.map(syncOne));localStorage.setItem(CLOUD_FLAG,'1');status(`☁ 已同步 ${items.length} 筆純文字回憶`,'ok')}catch(err){console.error(err);status('同步失敗','error')}
}
async function loadCloud(){
  if(!cloudUser)return status('請先使用右上角 Google 登入');
  status('正在從雲端讀取…','busy');
  try{
    const snap=await getDocs(collection(db,'users',cloudUser.uid,'memories'));
    const cloud=snap.docs.map(d=>{const x=d.data();delete x.updatedAt;return {id:d.id,...x}});
    if(!cloud.length){status('雲端目前沒有純文字回憶');return}
    const ok=confirm(`從雲端載入 ${cloud.length} 筆純文字回憶？\n\n同 ID 的本機資料會以雲端內容更新，本機獨有資料會保留。`);
    if(!ok)return status('已取消載入');
    const map=new Map(items.map(x=>[String(x.id),x]));cloud.forEach(x=>map.set(String(x.id),{...map.get(String(x.id)),...x}));items=[...map.values()];writeLocal();render();status(`☁ 已載入 ${cloud.length} 筆`,'ok');
  }catch(err){console.error(err);status('雲端讀取失敗','error')}
}

function addStyles(){
  if(document.getElementById('textMemoriesV2Styles'))return;
  const s=document.createElement('style');s.id='textMemoriesV2Styles';s.textContent=`
  #v-memories{max-width:1180px}.tm-hero{background:linear-gradient(145deg,#292522,#493638);color:white;border-radius:24px;padding:28px 30px;margin-bottom:15px}.tm-hero .eyebrow{color:#e5c7c1}.tm-hero h1{font-family:Georgia,"Noto Serif TC",serif;font-size:35px;margin:7px 0 8px}.tm-hero p{color:#ddd2cc;line-height:1.75;margin:0;max-width:820px}.tm-rule{display:inline-block;margin-top:13px;padding:7px 10px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.07);border-radius:999px;font-size:10px;color:#e0d4ce}
  .tm-toolbar{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}.tm-actions{display:flex;gap:7px;flex-wrap:wrap}.tm-cloud-status{font-size:10px;color:var(--muted)}.tm-cloud-status.ok{color:#39784b}.tm-cloud-status.busy{color:#9b7022}.tm-cloud-status.error{color:#9c4545}
  .tm-note{background:#f7efe8;border:1px solid #e5d8cd;border-radius:14px;padding:12px 14px;font-size:11px;line-height:1.7;color:#675f59;margin-bottom:13px}.tm-note b{color:var(--accent)}
  .tm-grid{display:grid;gap:11px}.tm-card{background:var(--panel);border:1px solid var(--line);border-radius:17px;padding:16px}.tm-card-head{display:flex;gap:10px;align-items:center;margin-bottom:11px}.tm-card-head input{flex:1;border:0;border-bottom:1px solid #e5ddd4;background:transparent;font-family:Georgia,"Noto Serif TC",serif;font-size:18px;padding:7px 3px;color:var(--ink)}.tm-badge{font-size:9px;background:var(--soft);color:var(--accent);border-radius:999px;padding:5px 7px;font-weight:800}.tm-two{display:grid;grid-template-columns:1fr 1fr;gap:9px}.tm-three{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px}.tm-field{display:grid;gap:5px;margin-bottom:9px}.tm-field>span{font-size:10px;color:var(--muted);font-weight:800}.tm-field small{font-size:9px;color:#9d938b}.tm-field input,.tm-field textarea,.tm-field select{width:100%;border:1px solid #e2d8ce;border-radius:9px;background:#fff;padding:9px 10px;line-height:1.6;color:var(--ink)}.tm-field textarea{min-height:105px;resize:vertical}.tm-photo-ref{padding:11px;background:#faf5ef;border-radius:12px;border:1px solid #eadfd4;margin-bottom:10px}.tm-photo-ref-title{font-size:10px;font-weight:900;color:var(--accent);margin-bottom:8px}.tm-footer{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:4px}.tm-save{font-size:9px;color:var(--muted)}.tm-danger{color:#9c4545;background:transparent}.tm-empty{padding:40px 20px;text-align:center;border:1px dashed var(--line);border-radius:14px;color:var(--muted)}
  @media(max-width:850px){.tm-hero{padding:22px 20px}.tm-hero h1{font-size:29px}.tm-two,.tm-three{grid-template-columns:1fr}.tm-field input,.tm-field textarea,.tm-field select,.tm-card-head input{font-size:16px}.tm-toolbar{align-items:flex-start}.tm-cloud-status{width:100%}}
  `;document.head.appendChild(s);
}

function buildPage(){
  const section=document.getElementById('v-memories');if(!section)return;
  section.innerHTML=`
    <div class="tm-hero"><span class="eyebrow">TEXT MEMORY · PHOTO REFERENCE</span><h1>純文字回憶</h1><p>照片不存進 Life Archive。你只需要記下照片放在哪裡、照片編號／檔名，以及當時發生的事情。這些文字資料可以同步到 Firestore。</p><div class="tm-rule">照片留在原本位置 · Life Archive 保存索引與故事</div></div>
    <div class="tm-note"><b>建議做法：</b>照片本體放在 iCloud Photos、Google Photos、外接硬碟或電腦資料夾；Life Archive 只記錄「存放位置＋照片編號／檔名」。例如：<b>Google Photos／2025 日本交換</b> ＋ <b>IMG_4821.JPG</b>。</div>
    <div class="tm-toolbar"><div class="tm-actions"><button class="btn primary" id="tmAdd">＋ 新增純文字回憶</button><button class="btn" id="tmUpload">☁ 立即同步</button><button class="btn" id="tmDownload">↓ 從雲端載入</button><button class="btn" id="tmExport">匯出 JSON</button></div><span class="tm-cloud-status" id="textMemoryCloudStatus">本機儲存中</span></div>
    <div class="tm-grid" id="tmGrid"></div>`;
  bindPage();render();
}

function render(){
  const grid=document.getElementById('tmGrid');if(!grid)return;
  const rows=[...items].sort((a,b)=>String(b.created||'').localeCompare(String(a.created||'')));
  grid.innerHTML=rows.length?rows.map(item=>`
    <article class="tm-card" data-tm-id="${esc(item.id)}">
      <div class="tm-card-head"><span class="tm-badge">${esc(item.stage||'其他')}</span><input data-tm-field="title" value="${esc(item.title)}" placeholder="替這段回憶取名字"></div>
      <div class="tm-three"><label class="tm-field"><span>時間</span><input data-tm-field="when" value="${esc(item.when)}" placeholder="例：2025/07、約2018夏天"></label><label class="tm-field"><span>人生階段</span><select data-tm-field="stage">${stages(item.stage||'其他')}</select></label><label class="tm-field"><span>地點</span><input data-tm-field="place" value="${esc(item.place)}"></label></div>
      <div class="tm-photo-ref"><div class="tm-photo-ref-title">照片索引（照片本體不會上傳）</div><div class="tm-two"><label class="tm-field"><span>照片存放在哪裡</span><input data-tm-field="photoLocation" value="${esc(item.photoLocation)}" placeholder="例：Google Photos／2025 日本交換；外接硬碟 A／France"></label><label class="tm-field"><span>照片編號／檔名</span><input data-tm-field="photoId" value="${esc(item.photoId)}" placeholder="例：IMG_4821.JPG、DSC_1038"></label></div></div>
      <div class="tm-two"><label class="tm-field"><span>重要人物</span><input data-tm-field="people" value="${esc(item.people)}" placeholder="照片裡或故事中的人物"></label><label class="tm-field"><span>關聯章節</span><input data-tm-field="chapterIds" value="${esc(item.chapterIds)}" placeholder="可先留白"></label></div>
      <label class="tm-field"><span>我記得發生了什麼</span><textarea data-tm-field="story" placeholder="只記你確定記得的事件、場景、對話。">${esc(item.story)}</textarea></label>
      <div class="tm-two"><label class="tm-field"><span>我當時的感受</span><textarea data-tm-field="feeling" placeholder="當時的感受，不用用現在的理解解釋。">${esc(item.feeling)}</textarea></label><label class="tm-field"><span>現在回頭看的理解</span><textarea data-tm-field="reflection" placeholder="現在怎麼理解這件事？">${esc(item.reflection)}</textarea></label></div>
      <div class="tm-footer"><span class="tm-save" data-tm-save>✓ 已儲存在本機</span><button class="btn tm-danger" data-tm-delete>刪除</button></div>
    </article>`).join(''):'<div class="tm-empty">目前還沒有純文字回憶。按「＋ 新增純文字回憶」開始。</div>';

  grid.querySelectorAll('[data-tm-field]').forEach(control=>{
    control.addEventListener('input',()=>update(control));control.addEventListener('change',()=>update(control,true));
  });
  grid.querySelectorAll('[data-tm-delete]').forEach(b=>b.addEventListener('click',async()=>{const id=b.closest('[data-tm-id]').dataset.tmId;if(!confirm('刪除這筆純文字回憶？'))return;items=items.filter(x=>String(x.id)!==String(id));writeLocal();render();await deleteCloud(id)}));
}

function update(control,immediate=false){
  const card=control.closest('[data-tm-id]');const item=items.find(x=>String(x.id)===String(card?.dataset.tmId));if(!item)return;
  item[control.dataset.tmField]=control.value;item.updated=now();writeLocal();const label=card.querySelector('[data-tm-save]');if(label)label.textContent='儲存中…';clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{if(label&&document.contains(label))label.textContent='✓ 已儲存在本機';await syncOne(item)},immediate?30:700);
}

function bindPage(){
  document.getElementById('tmAdd')?.addEventListener('click',()=>{const item=blank();items.unshift(item);writeLocal();render();requestAnimationFrame(()=>document.querySelector(`[data-tm-id="${CSS.escape(item.id)}"] input[data-tm-field="title"]`)?.focus())});
  document.getElementById('tmUpload')?.addEventListener('click',uploadAll);
  document.getElementById('tmDownload')?.addEventListener('click',loadCloud);
  document.getElementById('tmExport')?.addEventListener('click',()=>{const u=URL.createObjectURL(new Blob([JSON.stringify({format:'life-archive-text-memories',version:1,memories:items},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='life-archive-text-memories-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),500)});
}

function renameNavigation(){
  document.querySelectorAll('#nav [data-v="memories"]').forEach(b=>{b.textContent='▧ 純文字回憶'});
}

//function init(){addStyles();buildPage();renameNavigation();const nav=document.getElementById('nav');if(nav)new MutationObserver(renameNavigation).observe(nav,{childList:true,subtree:true});window.lifeArchiveMemories={getItems:()=>items.map(x=>({...x})),render,showView:v=>window.LifeArchiveNavigate?.(v)};}
function init(){
  addStyles();
  buildPage();
  renameNavigation();

  window.lifeArchiveMemories={
    getItems:()=>items.map(x=>({...x})),
    render,
    showView:v=>window.LifeArchiveNavigate?.(v)
  };
}
onAuthStateChanged(auth,user=>{cloudUser=user;if(user){status(localStorage.getItem(CLOUD_FLAG)==='1'?'☁ 已登入，可自動同步':'☁ 已登入；按「立即同步」啟用','ok')}else status('尚未登入；目前只儲存在本機')});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80),{once:true});else setTimeout(init,80);
