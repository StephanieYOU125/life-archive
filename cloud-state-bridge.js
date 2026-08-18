import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig={
  apiKey:"AIzaSyCaZnmoChuGKYUqRfYKgsV29liGqokiSjA",
  authDomain:"life-archive-2d4a6.firebaseapp.com",
  projectId:"life-archive-2d4a6",
  storageBucket:"life-archive-2d4a6.firebasestorage.app",
  messagingSenderId:"499371823629",
  appId:"1:499371823629:web:878bbd928bc86fc0197b44",
  measurementId:"G-C4NSZW459D"
};

const CLOUD_FLAG='life-archive-cloud-enabled';
const LAST_SYNC_KEY='life-archive-cloud-last-sync-v1';
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);

let state={
  signedIn:false,
  enabled:localStorage.getItem(CLOUD_FLAG)==='1',
  syncing:false,
  lastSync:localStorage.getItem(LAST_SYNC_KEY)||null,
  email:''
};

function emit(){
  state.enabled=localStorage.getItem(CLOUD_FLAG)==='1';
  state.lastSync=localStorage.getItem(LAST_SYNC_KEY)||state.lastSync||null;
  window.dispatchEvent(new CustomEvent('life-archive:cloud-state',{detail:{...state}}));
}

function inspectCloudPanel(){
  const status=document.getElementById('cloudStatus')?.textContent||'';
  const busy=/正在|同步中|讀取/.test(status);
  const success=/已同步|最新狀態|已登入/.test(status);
  state.syncing=busy;
  if(success&&/已同步|最新狀態/.test(status)){
    const now=new Date().toISOString();
    state.lastSync=now;
    localStorage.setItem(LAST_SYNC_KEY,now);
  }
  emit();
}

onAuthStateChanged(auth,user=>{
  state.signedIn=!!user;
  state.email=user?.email||'';
  if(!user)state.syncing=false;
  emit();
});

const observer=new MutationObserver(inspectCloudPanel);
function attach(){
  const panel=document.getElementById('cloudPanel');
  if(!panel)return false;
  observer.observe(panel,{childList:true,subtree:true,characterData:true,attributes:true});
  inspectCloudPanel();
  return true;
}
if(!attach()){
  const rootObserver=new MutationObserver(()=>{if(attach())rootObserver.disconnect()});
  rootObserver.observe(document.documentElement,{childList:true,subtree:true});
}

window.addEventListener('storage',e=>{
  if(e.key===CLOUD_FLAG||e.key===LAST_SYNC_KEY)emit();
});

window.LifeArchiveCloudState={
  get:()=>({...state,enabled:localStorage.getItem(CLOUD_FLAG)==='1',lastSync:localStorage.getItem(LAST_SYNC_KEY)||state.lastSync||null}),
  refresh:()=>{inspectCloudPanel();return {...state}}
};
emit();
