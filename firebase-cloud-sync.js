import './timeline-cloud-sync.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc, getDocs, setDoc, deleteDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaZnmoChuGKYUqRfYKgsV29liGqokiSjA",
  authDomain: "life-archive-2d4a6.firebaseapp.com",
  projectId: "life-archive-2d4a6",
  storageBucket: "life-archive-2d4a6.firebasestorage.app",
  messagingSenderId: "499371823629",
  appId: "1:499371823629:web:878bbd928bc86fc0197b44",
  measurementId: "G-C4NSZW459D"
};

const LOCAL_KEY = 'life-archive-writing-studio-v1';
const STORY_KEY = 'life-archive-story-organizer-v1';
const TIMELINE_KEY = 'life-archive-timeline-v1';
const CLOUD_FLAG = 'life-archive-cloud-enabled';
const CLOUD_PANEL_COLLAPSED_KEY = 'life-archive-cloud-panel-collapsed';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
let cloudEnabled = localStorage.getItem(CLOUD_FLAG) === '1';
let syncing = false;
let syncTimer = null;
let storySyncTimer = null;
let lastSnapshot = readLocal();

const style = document.createElement('style');
style.textContent = `
#cloudPanel{position:fixed;right:18px;top:82px;z-index:50;width:min(350px,calc(100vw - 36px));background:#fffdf9;border:1px solid #ded5c9;border-radius:16px;padding:14px;box-shadow:0 12px 35px rgba(50,40,30,.12);font-family:-apple-system,BlinkMacSystemFont,"Noto Sans TC",sans-serif;color:#292521;transition:width .2s ease,padding .2s ease,box-shadow .2s ease}
#cloudPanel .cloud-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
#cloudPanel .cloud-title{font-weight:800;white-space:nowrap}
#cloudPanel .cloud-status{font-size:12px;color:#817970;line-height:1.55;margin:7px 0 10px;word-break:break-word}
#cloudPanel .cloud-actions{display:flex;gap:7px;flex-wrap:wrap}
#cloudPanel button{border:1px solid #ded5c9;background:#fffdf9;color:#292521;padding:8px 10px;border-radius:9px;cursor:pointer;font:inherit;font-size:12px}
#cloudPanel button.primary{background:#7b3945;color:#fff;border-color:#7b3945}
#cloudPanel button:disabled{opacity:.55;cursor:default}
#cloudPanel .cloud-dot{width:9px;height:9px;border-radius:50%;background:#aaa199;display:inline-block;margin-right:6px}
#cloudPanel .cloud-dot.ok{background:#39784b}
#cloudPanel .cloud-dot.busy{background:#b88932}
#cloudPanel #cloudToggle{width:34px;height:34px;padding:0;display:grid;place-items:center;font-size:17px;line-height:1;border-radius:10px;flex:0 0 auto}
#cloudPanel.collapsed{width:min(285px,calc(100vw - 36px));padding:10px 12px;box-shadow:0 7px 22px rgba(50,40,30,.10)}
#cloudPanel.collapsed .cloud-status{margin:5px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#cloudPanel.collapsed .cloud-actions,#cloudPanel.collapsed #timelineCloudStatus{display:none!important}
@media(max-width:850px){#cloudPanel{top:auto;bottom:16px;right:16px}#cloudPanel.collapsed{width:min(270px,calc(100vw - 32px))}}
`;
document.head.appendChild(style);

const panel = document.createElement('div');
panel.id = 'cloudPanel';
panel.innerHTML = `
  <div class="cloud-head"><div class="cloud-title">☁ Life Archive 2.0</div><button id="cloudToggle" type="button" aria-label="縮小同步面板" aria-expanded="true">⌃</button></div>
  <div id="cloudStatus" class="cloud-status"><span class="cloud-dot"></span>尚未登入</div>
  <div class="cloud-actions">
    <button id="cloudLogin" class="primary">Google 登入</button>
    <button id="cloudUpload" hidden>立即同步</button>
    <button id="cloudDownload" hidden>從資料庫載入</button>
    <button id="cloudLogout" hidden>登出</button>
  </div>
`;
document.body.appendChild(panel);

const el = id => document.getElementById(id);
const statusEl = el('cloudStatus');
const loginBtn = el('cloudLogin');
const uploadBtn = el('cloudUpload');
const downloadBtn = el('cloudDownload');
const logoutBtn = el('cloudLogout');
const toggleBtn = el('cloudToggle');

function setPanelCollapsed(collapsed, persist=true) {
  panel.classList.toggle('collapsed', collapsed);
  toggleBtn.textContent = collapsed ? '⌄' : '⌃';
  toggleBtn.setAttribute('aria-expanded', String(!collapsed));
  toggleBtn.setAttribute('aria-label', collapsed ? '展開同步面板' : '縮小同步面板');
  if (persist) localStorage.setItem(CLOUD_PANEL_COLLAPSED_KEY, collapsed ? '1' : '0');
}

setPanelCollapsed(localStorage.getItem(CLOUD_PANEL_COLLAPSED_KEY) === '1', false);
toggleBtn.onclick = () => setPanelCollapsed(!panel.classList.contains('collapsed'));

function setStatus(text, mode='') {
  statusEl.innerHTML = `<span class="cloud-dot ${mode}"></span>${text}`;
}

function readJSON(key, fallback=null) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

function readLocal() {
  return readJSON(LOCAL_KEY, null);
}

function readStoryOrganizer() {
  const value = readJSON(STORY_KEY, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function safeDocData(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}
// 將舊素材轉換成新的 60／15／25 結構
function normalizeMaterialForCloud(item = {}) {
  return {
    ...item,
    story60: item.story60 ?? item.content ?? '',
    research15: item.research15 ?? '',
    insight25: item.insight25 ?? item.reflection ?? ''
  };
}
function mapById(items=[]) {
  return new Map(items.map((item,index) => [String(item.id || `item-${index+1}`), { ...item, order:index }]));
}

function changed(a,b) {
  return JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);
}

function bookSettings(s) {
  if (!s) return {};
  const publishingProposal = s.publishingProposal && typeof s.publishingProposal === 'object'
    ? s.publishingProposal
    : null;
  return {
    title:s.title || '',
    core:s.core || '',
    reader:s.reader || '',
    raw:s.raw || '',
    refs:Array.isArray(s.refs)?s.refs:[],
    parts:Array.isArray(s.parts)?s.parts:[],
    legacyProject:s.legacyProject || null,
    blockDecisions:s.blockDecisions || {},
    migration:s.migration || null,
    ...(publishingProposal ? {publishingProposal} : {}),
    schemaVersion:4
  };
}

async function syncStoryOrganizer() {
  const user = auth.currentUser;
  if (!user) return 0;
  const storyOrganizer = readStoryOrganizer();
  await setDoc(doc(db,'users',user.uid,'settings','workspace'), {
    storyOrganizer:safeDocData(storyOrganizer),
    schemaVersion:1,
    updatedAt:serverTimestamp()
  }, {merge:true});
  return 1;
}

async function syncDiff(previous, current, showResult=false) {
  const user = auth.currentUser;
  if (!user || !current || syncing) return 0;
  syncing = true;
  if (showResult) setStatus('正在同步書稿、章節與素材…', 'busy');
  try {
    const beforeCh = mapById(previous?.chapters || []);
    const afterCh = mapById(current.chapters || []);
    const beforeMat = mapById(previous?.materials || []);
    const afterMat = mapById(current.materials || []);
    const operations = [];

    for (const [id,item] of afterCh) {
      if (!beforeCh.has(id) || changed(beforeCh.get(id), item)) {
        operations.push(setDoc(doc(db,'users',user.uid,'chapters',id), {...safeDocData(item),updatedAt:serverTimestamp()}, {merge:true}));
      }
    }
    for (const id of beforeCh.keys()) {
      if (!afterCh.has(id)) operations.push(deleteDoc(doc(db,'users',user.uid,'chapters',id)));
    }

    for (const [id,item] of afterMat) {
      if (!beforeMat.has(id) || changed(beforeMat.get(id), item)) {
        const normalizedItem = normalizeMaterialForCloud(item);

        operations.push(
          setDoc(
            doc(db,'users',user.uid,'materials',id),
            {
          ...safeDocData(normalizedItem),
          updatedAt:serverTimestamp()
            },
            {merge:true}
          )
        );
      }
    }
    for (const id of beforeMat.keys()) {
      if (!afterMat.has(id)) operations.push(deleteDoc(doc(db,'users',user.uid,'materials',id)));
    }

    if (!previous || changed(bookSettings(previous), bookSettings(current))) {
      operations.push(setDoc(doc(db,'users',user.uid,'settings','book'), {...safeDocData(bookSettings(current)),updatedAt:serverTimestamp()}, {merge:true}));
    }

    if (operations.length) await Promise.all(operations);
    cloudEnabled = true;
    localStorage.setItem(CLOUD_FLAG,'1');
    lastSnapshot = JSON.parse(JSON.stringify(current));
    if (showResult) {
      setStatus(operations.length ? `已同步 ${operations.length} 項書稿變更` : '書稿資料庫已是最新狀態', 'ok');
    }
    return operations.length;
  } catch (err) {
    console.error('Firestore v2 sync failed', err);
    if (showResult) setStatus(`資料庫同步失敗：${err.code || err.message || err}`);
    throw err;
  } finally {
    syncing = false;
  }
}

async function fullSync(showResult=true) {
  const current = readLocal();
  if (!current) {
    if (showResult) setStatus('目前沒有本機書稿資料可同步');
    return false;
  }
  if (!auth.currentUser) {
    if (showResult) setStatus('請先登入 Google 再同步');
    return false;
  }

  if (showResult) setStatus('正在同步 Life Archive 全部資料…', 'busy');
  uploadBtn.disabled = true;
  try {
    const writingCount = await syncDiff(null, current, false);
    const storyCount = await syncStoryOrganizer();
    let timelineOk = true;
    if (window.LifeArchiveTimelineCloud?.uploadSilent) {
      timelineOk = await window.LifeArchiveTimelineCloud.uploadSilent();
    }
    if (!timelineOk) throw new Error('時間軸同步失敗');

    cloudEnabled = true;
    localStorage.setItem(CLOUD_FLAG,'1');
    const timelineCount = Array.isArray(readJSON(TIMELINE_KEY, [])) ? readJSON(TIMELINE_KEY, []).length : 0;
    const time = new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'});
    setStatus(`全部資料已同步｜書稿 ${writingCount} 項變更・素材整理台 ${storyCount} 份・時間軸 ${timelineCount} 筆｜${time}`, 'ok');
    return true;
  } catch (err) {
    console.error('Unified cloud sync failed', err);
    setStatus(`整體同步失敗：${err.code || err.message || err}`);
    return false;
  } finally {
    uploadBtn.disabled = false;
  }
}

async function loadFromCollections() {
  const user = auth.currentUser;
  if (!user) return;
  setStatus('正在讀取 Firestore 全部資料…', 'busy');
  downloadBtn.disabled = true;
  try {
    const [chapterSnap, materialSnap, settingSnap, workspaceSnap, timelineSnap] = await Promise.all([
      getDocs(collection(db,'users',user.uid,'chapters')),
      getDocs(collection(db,'users',user.uid,'materials')),
      getDoc(doc(db,'users',user.uid,'settings','book')),
      getDoc(doc(db,'users',user.uid,'settings','workspace')),
      getDocs(collection(db,'users',user.uid,'timeline'))
    ]);

    if (chapterSnap.empty && materialSnap.empty && !settingSnap.exists() && !workspaceSnap.exists() && timelineSnap.empty) {
      setStatus('新的資料庫目前沒有資料；舊整包備份仍保留');
      return;
    }

    const current = readLocal() || {};
    const chapters = chapterSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order??9999)-(b.order??9999)).map(({updatedAt,migratedAt,order,...x})=>x);
    const materials = materialSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order??9999)-(b.order??9999)).map(({updatedAt,migratedAt,order,...x})=>x);
    const timeline = timelineSnap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order??9999)-(b.order??9999)).map(({updatedAt,order,...x})=>x);
    const settings = settingSnap.exists() ? settingSnap.data() : {};
    const workspace = workspaceSnap.exists() ? workspaceSnap.data() : {};
    const restored = {
      ...current,
      title:settings.title ?? current.title ?? '',
      core:settings.core ?? current.core ?? '',
      reader:settings.reader ?? current.reader ?? '',
      raw:settings.raw ?? current.raw ?? '',
      refs:Array.isArray(settings.refs)?settings.refs:(current.refs||[]),
      parts:Array.isArray(settings.parts)?settings.parts:(current.parts||[]),
      legacyProject:settings.legacyProject ?? current.legacyProject,
      blockDecisions:settings.blockDecisions ?? current.blockDecisions,
      migration:settings.migration ?? current.migration,
      publishingProposal:(settings.publishingProposal && typeof settings.publishingProposal === 'object')
        ? settings.publishingProposal
        : current.publishingProposal,
      chapters,
      materials
    };

    const hasStory = workspace.storyOrganizer && typeof workspace.storyOrganizer === 'object';
    const ok = confirm(`將從 Firestore 載入 ${chapters.length} 章、${materials.length} 筆素材、${timeline.length} 筆時間軸${hasStory?'，以及素材整理台草稿':''}。\n\n這會取代這台裝置目前對應的 Life Archive 資料，但 Firestore 與舊整包備份都不會被刪除。\n\n確定載入？`);
    if (!ok) { setStatus('已取消從資料庫載入'); return; }

    localStorage.setItem(LOCAL_KEY, JSON.stringify(restored));
    if (hasStory) localStorage.setItem(STORY_KEY, JSON.stringify(workspace.storyOrganizer));
    if (!timelineSnap.empty) localStorage.setItem(TIMELINE_KEY, JSON.stringify(timeline));
    localStorage.setItem(CLOUD_FLAG,'1');
    location.reload();
  } catch (err) {
    console.error('Firestore v2 load failed', err);
    setStatus(`資料庫讀取失敗：${err.code || err.message || err}`);
  } finally {
    downloadBtn.disabled = false;
  }
}

loginBtn.onclick = async () => {
  setStatus('正在開啟 Google 登入…', 'busy');
  try { await signInWithPopup(auth, provider); }
  catch (err) { console.error(err); setStatus(`登入失敗：${err.code || err.message || err}`); }
};
logoutBtn.onclick = () => signOut(auth);
uploadBtn.onclick = () => fullSync(true);
downloadBtn.onclick = loadFromCollections;

onAuthStateChanged(auth, async user => {
  if (!user) {
    loginBtn.hidden = false;
    uploadBtn.hidden = true;
    downloadBtn.hidden = true;
    logoutBtn.hidden = true;
    setStatus('尚未登入；本機自動儲存仍正常');
    return;
  }
  loginBtn.hidden = true;
  uploadBtn.hidden = false;
  downloadBtn.hidden = false;
  logoutBtn.hidden = false;
  setStatus(`已登入 ${user.email || ''}｜完整雲端同步模式`, 'ok');
  lastSnapshot = readLocal();
  if (cloudEnabled && lastSnapshot) {
    try {
      await syncDiff(lastSnapshot, lastSnapshot, false);
      await syncStoryOrganizer();
    } catch (err) {
      console.error('Background startup sync failed', err);
    }
  }
});

const nativeSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
  const previous = key === LOCAL_KEY ? lastSnapshot : null;
  const result = nativeSetItem.call(this, key, value);

  if (this === localStorage && key === LOCAL_KEY) {
    let current = null;
    try { current = JSON.parse(value); } catch {}
    if (current) {
      if (cloudEnabled && auth.currentUser && !syncing) {
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => syncDiff(previous, current, false).catch(err=>console.error(err)), 900);
      } else {
        lastSnapshot = JSON.parse(JSON.stringify(current));
      }
    }
  }

  if (this === localStorage && key === STORY_KEY && cloudEnabled && auth.currentUser) {
    clearTimeout(storySyncTimer);
    storySyncTimer = setTimeout(() => syncStoryOrganizer().catch(err=>console.error('Story organizer autosync failed',err)), 900);
  }

  return result;
};
