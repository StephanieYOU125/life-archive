import { getApps, getApp, initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const isFirebaseHosting = location.hostname.endsWith('.web.app') || location.hostname.endsWith('.firebaseapp.com');
const firebaseConfig = {
  apiKey: "AIzaSyCaZnmoChuGKYUqRfYKgsV29liGqokiSjA",
  authDomain: isFirebaseHosting ? location.hostname : "life-archive-2d4a6.firebaseapp.com",
  projectId: "life-archive-2d4a6",
  storageBucket: "life-archive-2d4a6.firebasestorage.app",
  messagingSenderId: "499371823629",
  appId: "1:499371823629:web:878bbd928bc86fc0197b44",
  measurementId: "G-C4NSZW459D"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const REDIRECT_PENDING = 'life-archive-google-redirect-pending';

function isMobileOrStandalone() {
  const ua = navigator.userAgent || '';
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  return mobileUA || coarse || standalone;
}

function statusElement() {
  return document.getElementById('cloudStatus');
}

function setStatus(text, ok=false) {
  const el = statusElement();
  if (!el) return;
  if (el.classList.contains('cloud-status')) {
    el.innerHTML = `<span class="cloud-dot ${ok ? 'ok' : 'busy'}"></span>${text}`;
  } else {
    el.innerHTML = ok ? `<span class="sync-ok">✓ ${text}</span>` : text;
  }
}

async function finishRedirect() {
  if (!isMobileOrStandalone()) return;
  const pending = sessionStorage.getItem(REDIRECT_PENDING) === '1';
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      sessionStorage.removeItem(REDIRECT_PENDING);
      setStatus(`已登入 ${result.user.email || ''}`, true);
      return;
    }
    if (pending && !auth.currentUser) {
      sessionStorage.removeItem(REDIRECT_PENDING);
      setStatus('Google 登入已返回，但尚未取得登入狀態。請重新整理頁面後再試一次。');
    }
  } catch (err) {
    console.error('Firebase redirect sign-in failed', err);
    sessionStorage.removeItem(REDIRECT_PENDING);
    setStatus(`Google 登入返回失敗：${err.code || err.message || err}`);
  }
}

document.addEventListener('click', async event => {
  const button = event.target.closest?.('#cloudLogin, #loginBtn');
  if (!button || !isMobileOrStandalone()) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  setStatus('正在前往 Google 登入頁面…');
  sessionStorage.setItem(REDIRECT_PENDING, '1');
  try {
    await signInWithRedirect(auth, provider);
  } catch (err) {
    console.error('Firebase mobile redirect start failed', err);
    sessionStorage.removeItem(REDIRECT_PENDING);
    setStatus(`無法開啟 Google 登入：${err.code || err.message || err}`);
  }
}, true);

finishRedirect();
