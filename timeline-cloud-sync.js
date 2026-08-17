import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig={
  apiKey:"AIzaSyCaZnmoChuGKYUqRfYKgsV29liGqokiSjA",
  authDomain:"life-archive-2d4a6.firebaseapp.com",
  projectId:"life-archive-2d4a6",
  storageBucket:"life-archive-2d4a6.firebasestorage.app",
  messagingSenderId:"499371823629",
  appId:"1:499371823629:web:878bbd928bc86fc0197b44",
  measurementId:"G-C4NSZW459D"
};

const TIMELINE_KEY='life-archive-timeline-v1';
const REV_KEY='life-archive-timeline-cloud-revision';
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
let user=null;
let suppressLocalWatch=false;
let autoSyncReady=false;
let syncTimer=null;

const previousSetItem=Storage.prototype.setItem;

function readTimeline(){
  try{
    const value=JSON.parse(localStorage.getItem(TIMELINE_KEY)||'[]');
    return Array.isArray(value)?value:[];
  }catch{return []}
}

function cleanRemoteItem(data={}){
  const {order,updatedAt,...rest}=data;
  return rest;
}

function stable(items=[]){
  return JSON.stringify(items.map(item=>({
    id:String(item.id||''),
    time:item.time||'',identity:item.identity||'',resume:item.resume||'',result:item.result||'',status:item.status||'',note:item.note||''
  })));
}

function makeRevision(){
  return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function readCloud(){
  if(!user)return {items:[],revision:null};
  const [snap,metaSnap]=await Promise.all([
    getDocs(collection(db,'users',user.uid,'timeline')),
    getDoc(doc(db,'users',user.uid,'meta','timeline-sync'))
  ]);
  const items=snap.docs
    .map(d=>({id:d.id,...d.data()}))
    .sort((a,b)=>(a.order??9999)-(b.order??9999))
    .map(cleanRemoteItem);
  const revision=metaSnap.exists()?metaSnap.data().revision||null:null;
  return {items,revision};
}

async function uploadTimeline({ask=true}={}){
  if(!user)return false;
  const local=readTimeline();
  if(ask && !confirm(`將把這台裝置的 ${local.length} 筆人生時間軸上傳到 Firestore，並以本機版本為準。\n\n確定繼續？`))return false;
  setTimelineStatus('時間軸：正在上傳…');
  try{
    const remote=await getDocs(collection(db,'users',user.uid,'timeline'));
    const localIds=new Set(local.map((item,index)=>String(item.id||`timeline-${index+1}`)));
    const ops=[];
    remote.docs.forEach(d=>{if(!localIds.has(d.id))ops.push(deleteDoc(d.ref));});
    local.forEach((item,index)=>{
      const id=String(item.id||`timeline-${index+1}`);
      ops.push(setDoc(doc(db,'users',user.uid,'timeline',id),{
        ...JSON.parse(JSON.stringify(item)),id,order:index,updatedAt:serverTimestamp()
      },{merge:true}));
    });
    const revision=makeRevision();
    ops.push(setDoc(doc(db,'users',user.uid,'meta','timeline-sync'),{
      revision,itemCount:local.length,updatedAt:serverTimestamp()
    },{merge:true}));
    await Promise.all(ops);
    previousSetItem.call(localStorage,REV_KEY,revision);
    autoSyncReady=true;
    setTimelineStatus(`時間軸：已同步 ${local.length} 筆`,'ok');
    return true;
  }catch(err){
    console.error('Timeline upload failed',err);
    setTimelineStatus(`時間軸同步失敗：${err.code||err.message||err}`,'error');
    return false;
  }
}

async function downloadTimeline({ask=true}={}){
  if(!user)return false;
  setTimelineStatus('時間軸：正在讀取雲端…');
  try{
    const cloud=await readCloud();
    const local=readTimeline();
    if(ask && local.length && stable(local)!==stable(cloud.items)){
      const ok=confirm(`Firestore 有 ${cloud.items.length} 筆時間軸。\n\n載入後會取代這台裝置目前的 ${local.length} 筆時間軸。確定繼續？`);
      if(!ok){setTimelineStatus('時間軸：已取消載入');return false;}
    }
    suppressLocalWatch=true;
    previousSetItem.call(localStorage,TIMELINE_KEY,JSON.stringify(cloud.items));
    previousSetItem.call(localStorage,REV_KEY,cloud.revision||'');
    suppressLocalWatch=false;
    autoSyncReady=true;
    setTimelineStatus(`時間軸：已從雲端載入 ${cloud.items.length} 筆`,'ok');
    window.dispatchEvent(new CustomEvent('life-archive:timeline-loaded'));
    location.reload();
    return true;
  }catch(err){
    suppressLocalWatch=false;
    console.error('Timeline download failed',err);
    setTimelineStatus(`時間軸讀取失敗：${err.code||err.message||err}`,'error');
    return false;
  }
}

function attachTimelineControls(){
  const panel=document.getElementById('cloudPanel');
  const actions=panel?.querySelector('.cloud-actions');
  if(!panel||!actions||document.getElementById('timelineCloudUpload'))return;
  const upload=document.createElement('button');
  upload.id='timelineCloudUpload';upload.textContent='同步時間軸';upload.hidden=!user;
  upload.onclick=()=>uploadTimeline({ask:true});
  const download=document.createElement('button');
  download.id='timelineCloudDownload';download.textContent='載入時間軸';download.hidden=!user;
  download.onclick=()=>downloadTimeline({ask:true});
  actions.append(upload,download);
  const status=document.createElement('div');
  status.id='timelineCloudStatus';
  status.style.cssText='font-size:11px;color:#817970;line-height:1.5;margin-top:8px;word-break:break-word';
  status.textContent='時間軸：等待登入';
  panel.appendChild(status);
}

function setTimelineStatus(text,mode=''){
  attachTimelineControls();
  const el=document.getElementById('timelineCloudStatus');
  if(el){el.textContent=text;el.style.color=mode==='error'?'#9c4545':mode==='ok'?'#39784b':'#817970';}
}

async function reconcile(){
  if(!user)return;
  try{
    const local=readTimeline();
    const localRevision=localStorage.getItem(REV_KEY)||null;
    const cloud=await readCloud();
    if(!cloud.items.length && local.length){
      await uploadTimeline({ask:false});
      return;
    }
    if(cloud.items.length && !local.length){
      await downloadTimeline({ask:false});
      return;
    }
    if(!cloud.items.length && !local.length){
      autoSyncReady=true;
      setTimelineStatus('時間軸：雲端與本機皆為空','ok');
      return;
    }
    if(stable(local)===stable(cloud.items)){
      if(cloud.revision)previousSetItem.call(localStorage,REV_KEY,cloud.revision);
      autoSyncReady=true;
      setTimelineStatus(`時間軸：已同步 ${local.length} 筆`,'ok');
      return;
    }
    if(localRevision && cloud.revision && localRevision===cloud.revision){
      autoSyncReady=true;
      await uploadTimeline({ask:false});
      return;
    }
    autoSyncReady=false;
    setTimelineStatus('時間軸：本機與雲端不同，請選「同步時間軸」或「載入時間軸」','error');
  }catch(err){
    console.error('Timeline reconcile failed',err);
    setTimelineStatus(`時間軸檢查失敗：${err.code||err.message||err}`,'error');
  }
}

Storage.prototype.setItem=function(key,value){
  const result=previousSetItem.call(this,key,value);
  if(this===localStorage && key===TIMELINE_KEY && !suppressLocalWatch){
    if(user && autoSyncReady){
      clearTimeout(syncTimer);
      syncTimer=setTimeout(()=>uploadTimeline({ask:false}),900);
    }
  }
  return result;
};

onAuthStateChanged(auth,async currentUser=>{
  user=currentUser||null;
  attachTimelineControls();
  const upload=document.getElementById('timelineCloudUpload');
  const download=document.getElementById('timelineCloudDownload');
  if(upload)upload.hidden=!user;
  if(download)download.hidden=!user;
  if(!user){autoSyncReady=false;setTimelineStatus('時間軸：等待登入');return;}
  setTimelineStatus('時間軸：正在比對本機與雲端…');
  await reconcile();
});

const attachObserver=new MutationObserver(()=>attachTimelineControls());
attachObserver.observe(document.documentElement,{childList:true,subtree:true});
attachTimelineControls();

window.LifeArchiveTimelineCloud={upload:()=>uploadTimeline({ask:true}),download:()=>downloadTimeline({ask:true})};
