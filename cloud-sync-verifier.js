import { getApp, getApps } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const PROJECT_ID='life-archive-2d4a6';
const TIMELINE_KEY='life-archive-timeline-v1';
let verifying=false;
let lastVerifiedText='';

function localTimelineCount(){
  try{
    const value=JSON.parse(localStorage.getItem(TIMELINE_KEY)||'[]');
    return Array.isArray(value)?value.length:0;
  }catch{return 0;}
}

function shortUid(uid=''){
  return uid ? `${uid.slice(0,8)}…${uid.slice(-4)}` : '未登入';
}

async function verifyCloud(){
  if(verifying)return;
  const status=document.getElementById('cloudStatus');
  if(!status)return;
  const currentText=status.textContent||'';
  if(!currentText.includes('全部資料已同步') || currentText===lastVerifiedText)return;

  const app=getApps().length?getApp():null;
  if(!app)return;
  const auth=getAuth(app);
  const user=auth.currentUser;
  if(!user)return;

  verifying=true;
  try{
    const db=getFirestore(app);
    const [workspaceSnap,bookSnap,timelineSnap]=await Promise.all([
      getDoc(doc(db,'users',user.uid,'settings','workspace')),
      getDoc(doc(db,'users',user.uid,'settings','book')),
      getDocs(collection(db,'users',user.uid,'timeline'))
    ]);
    const localCount=localTimelineCount();
    const remoteCount=timelineSnap.size;
    const workspaceOk=workspaceSnap.exists();
    const bookOk=bookSnap.exists();
    const timelineOk=remoteCount===localCount;
    const allOk=workspaceOk&&bookOk&&timelineOk;
    const prefix=allOk?'✅ 已讀回驗證':'⚠️ 同步後驗證異常';
    const detail=`${prefix}｜workspace ${workspaceOk?'✓':'✗'}・book ${bookOk?'✓':'✗'}・timeline ${remoteCount}/${localCount}｜Project ${PROJECT_ID}｜UID ${shortUid(user.uid)}`;
    status.innerHTML=`<span class="cloud-dot ${allOk?'ok':''}"></span>${detail}`;
    lastVerifiedText=status.textContent||detail;
    console.info('[Life Archive cloud verification]',{
      projectId:PROJECT_ID,
      uid:user.uid,
      workspaceExists:workspaceOk,
      bookExists:bookOk,
      timelineRemote:remoteCount,
      timelineLocal:localCount
    });
  }catch(err){
    const detail=`⚠️ 無法讀回驗證：${err.code||err.message||err}｜Project ${PROJECT_ID}｜UID ${shortUid(user.uid)}`;
    status.innerHTML=`<span class="cloud-dot"></span>${detail}`;
    lastVerifiedText=status.textContent||detail;
    console.error('[Life Archive cloud verification failed]',err);
  }finally{
    verifying=false;
  }
}

function attach(){
  const status=document.getElementById('cloudStatus');
  if(!status)return false;
  const observer=new MutationObserver(()=>setTimeout(verifyCloud,350));
  observer.observe(status,{childList:true,subtree:true,characterData:true});
  setTimeout(verifyCloud,350);
  return true;
}

if(!attach()){
  const rootObserver=new MutationObserver(()=>{
    if(attach())rootObserver.disconnect();
  });
  rootObserver.observe(document.documentElement,{childList:true,subtree:true});
}

window.LifeArchiveCloudVerifier={verify:verifyCloud};
