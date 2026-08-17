import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
let cloudEnabled = localStorage.getItem('life-archive-cloud-enabled') === '1';
let syncing = false;
let syncTimer = null;

const style = document.createElement('style');
style.textContent = `
#cloudPanel{position:fixed;right:18px;top:82px;z-index:50;width:min(330px,calc(100vw - 36px));background:#fffdf9;border:1px solid #ded5c9;border-radius:16px;padding:14px;box-shadow:0 12px 35px rgba(50,40,30,.12);font-family:-apple-system,BlinkMacSystemFont,"Noto Sans TC",sans-serif;color:#292521}
#cloudPanel .cloud-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
#cloudPanel .cloud-title{font-weight:800}
#cloudPanel .cloud-status{font-size:12px;color:#817970;line-height:1.55;margin:7px 0 10px;word-break:break-word}
#cloudPanel .cloud-actions{display:flex;gap:7px;flex-wrap:wrap}
#cloudPanel button{border:1px solid #ded5c9;background:#fffdf9;color:#292521;padding:8px 10px;border-radius:9px;cursor:pointer;font:inherit;font-size:12px}
#cloudPanel button.primary{background:#7b3945;color:#fff;border-color:#7b3945}
#cloudPanel button:disabled{opacity:.55;cursor:default}
#cloudPanel .cloud-dot{width:9px;height:9px;border-radius:50%;background:#aaa199;display:inline-block;margin-right:6px}
#cloudPanel .cloud-dot.ok{background:#39784b}
#cloudPanel .cloud-dot.busy{background:#b88932}
@media(max-width:850px){#cloudPanel{top:auto;bottom:16px;right:16px}}
`;
document.head.appendChild(style);

const panel = document.createElement('div');
panel.id = 'cloudPanel';
panel.innerHTML = `
  <div class="cloud-head"><div class="cloud-title">☁ Firebase 雲端備份</div><button id="cloudHide" aria-label="收合">×</button></div>
  <div id="cloudStatus" class="cloud-status"><span class="cloud-dot"></span>尚未登入</div>
  <div class="cloud-actions">
    <button id="cloudLogin" class="primary">Google 登入</button>
    <button id="cloudUpload" hidden>備份到雲端</button>
    <button id="cloudDownload" hidden>從雲端載入</button>
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

function setStatus(text, mode='') {
  statusEl.innerHTML = `<span class="cloud-dot ${mode}"></span>${text}`;
}

function cloudRef(user) {
  return doc(db, 'users', user.uid, 'workspaces', 'writing-studio');
}

async function uploadLocal(showResult=true) {
  const user = auth.currentUser;
  if (!user || syncing) return;
  const payload = localStorage.getItem(LOCAL_KEY);
  if (!payload) {
    if (showResult) setStatus('目前沒有本機書稿資料可備份');
    return;
  }
  syncing = true;
  if (showResult) setStatus('正在同步到 Firestore…', 'busy');
  try {
    await setDoc(cloudRef(user), {
      payload,
      schemaVersion: 1,
      updatedAt: serverTimestamp()
    }, { merge: true });
    cloudEnabled = true;
    localStorage.setItem('life-archive-cloud-enabled', '1');
    setStatus(`已同步雲端｜${new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})}`, 'ok');
  } catch (err) {
    console.error('Cloud upload failed', err);
    setStatus(`雲端同步失敗：${err.code || err.message || err}`);
  } finally {
    syncing = false;
  }
}

async function loadCloud() {
  const user = auth.currentUser;
  if (!user) return;
  setStatus('正在讀取雲端資料…', 'busy');
  try {
    const snap = await getDoc(cloudRef(user));
    if (!snap.exists() || !snap.data().payload) {
      setStatus('雲端目前還沒有書稿備份');
      return;
    }
    let parsed;
    try { parsed = JSON.parse(snap.data().payload); } catch { throw new Error('雲端資料格式不正確'); }
    if (!parsed || !Array.isArray(parsed.chapters)) throw new Error('雲端資料不是 Life Archive 書稿格式');
    const ok = confirm('從雲端載入會取代這台裝置目前的文字工作室資料。\n\n建議先使用「備份與匯出」下載 JSON。\n\n確定要載入嗎？');
    if (!ok) { setStatus('已取消從雲端載入'); return; }
    localStorage.setItem(LOCAL_KEY, snap.data().payload);
    cloudEnabled = true;
    localStorage.setItem('life-archive-cloud-enabled', '1');
    location.reload();
  } catch (err) {
    console.error('Cloud load failed', err);
    setStatus(`雲端讀取失敗：${err.code || err.message || err}`);
  }
}

loginBtn.onclick = async () => {
  setStatus('正在開啟 Google 登入…', 'busy');
  try { await signInWithPopup(auth, provider); }
  catch (err) { console.error(err); setStatus(`登入失敗：${err.code || err.message || err}`); }
};
logoutBtn.onclick = () => signOut(auth);
uploadBtn.onclick = () => uploadLocal(true);
downloadBtn.onclick = loadCloud;
el('cloudHide').onclick = () => panel.remove();

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
  setStatus(`已登入 ${user.email || ''}｜本機資料仍保留`, 'ok');
  if (cloudEnabled) await uploadLocal(false);
});

const nativeSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
  nativeSetItem.call(this, key, value);
  if (this === localStorage && key === LOCAL_KEY && cloudEnabled && auth.currentUser && !syncing) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => uploadLocal(false), 900);
  }
};
