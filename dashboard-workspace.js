const DASHBOARD_LAST_CHAPTER_KEY='life-archive-last-chapter-v1';

function dashState(){
  if(window.LifeArchiveStateBridge?.get)return window.LifeArchiveStateBridge.get()||{};
  try{return JSON.parse(localStorage.getItem('life-archive-writing-studio-v1')||'{}')||{}}catch{return {}}
}

function dashEsc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dashNonEmpty(v){return typeof v==='string'&&v.trim().length>0}

function timelineCount(){
  try{
    const value=JSON.parse(localStorage.getItem('life-archive-timeline-v1')||'[]');
    if(Array.isArray(value))return value.length;
    if(Array.isArray(value?.items))return value.items.length;
    if(Array.isArray(value?.entries))return value.entries.length;
    return 0;
  }catch{return 0}
}

function proposalProgress(s){
  const p=s?.publishingProposal&&typeof s.publishingProposal==='object'?s.publishingProposal:{};
  const keys=['author','title','subtitle','genre','concept','oneLiner','claims','audience','painPoints','features','authorStrength','structure'];
  const filled=keys.filter(k=>dashNonEmpty(p[k])).length;
  const legacy=[s?.title,s?.core,s?.reader].filter(dashNonEmpty).length;
  return {filled,total:keys.length,legacy,hasAny:filled>0||legacy>0};
}

function dashboardMetrics(){
  const s=dashState();
  const chapters=Array.isArray(s.chapters)?s.chapters:[];
  const materials=Array.isArray(s.materials)?s.materials:[];
  const refs=Array.isArray(s.refs)?s.refs:[];
  const drafted=chapters.filter(c=>dashNonEmpty(c?.draft));
  const rawChars=String(s.raw||'').length;
  const timeline=timelineCount();
  const proposal=proposalProgress(s);
  return {s,chapters,materials,refs,drafted,rawChars,timeline,proposal};
}

function getLastChapter(metrics){
  const id=localStorage.getItem(DASHBOARD_LAST_CHAPTER_KEY)||'';
  return metrics.chapters.find(c=>String(c.id)===id)
    || [...metrics.drafted].reverse()[0]
    || metrics.chapters[0]
    || null;
}

function lastParagraphExcerpt(chapter,max=130){
  const text=String(chapter?.draft||'').trim();
  if(!text)return '';
  const parts=text.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const last=parts[parts.length-1]||text;
  const clean=last.replace(/\s+/g,' ');
  return clean.length>max?`…${clean.slice(-(max-1))}`:clean;
}

function rememberCurrentChapter(){
  const select=document.getElementById('chapterSelect');
  if(select?.value)localStorage.setItem(DASHBOARD_LAST_CHAPTER_KEY,select.value);
}

function navigateTo(target){
  if(target==='timeline'){
    window.LifeArchiveTimelineUI?.open?.();
    return;
  }
  window.LifeArchiveNavigate?.(target);
}

function continueChapter(id){
  if(!id){navigateTo('outline');return}
  localStorage.setItem(DASHBOARD_LAST_CHAPTER_KEY,String(id));
  navigateTo('editor');
  requestAnimationFrame(()=>{
    const select=document.getElementById('chapterSelect');
    if(!select)return;
    select.value=String(id);
    select.dispatchEvent(new Event('change',{bubbles:true}));
  });
}

function addStyles(){
  if(document.getElementById('dashboardWorkspaceStyles'))return;
  const style=document.createElement('style');
  style.id='dashboardWorkspaceStyles';
  style.textContent=`
    #v-dashboard{max-width:1220px}
    .dw-hero{background:linear-gradient(145deg,#2b2623,#493638);color:#fff;border-radius:24px;padding:30px;margin-bottom:16px;box-shadow:0 14px 38px rgba(50,40,30,.08)}
    .dw-hero h1{font-family:Georgia,"Noto Serif TC",serif;font-size:38px;margin:7px 0 8px}.dw-hero p{margin:0;color:#ded4cf;line-height:1.8;max-width:760px}
    .dw-kicker{font-size:10px;letter-spacing:.14em;font-weight:900;color:#e8cbc6}.dw-section{margin-top:18px}.dw-section-head{display:flex;justify-content:space-between;align-items:end;gap:14px;margin-bottom:9px}.dw-section-head h2{margin:0;font-family:Georgia,"Noto Serif TC",serif;font-size:22px}.dw-section-head p{margin:0;color:var(--muted);font-size:11px;line-height:1.6}
    .dw-continue{background:linear-gradient(135deg,#fffdf9,#fbf7f1);border:1px solid #ddd1c6;border-radius:20px;padding:20px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;box-shadow:0 9px 24px rgba(56,43,34,.045)}
    .dw-current-eyebrow{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:7px}.dw-current-eyebrow span{font-size:9px;letter-spacing:.11em;font-weight:900;color:var(--accent)}.dw-current-eyebrow em{font-style:normal;font-size:9px;color:var(--muted);background:#f1ebe4;border-radius:999px;padding:4px 7px}
    .dw-current-title{font-family:Georgia,"Noto Serif TC",serif;font-size:24px;line-height:1.35;margin:0;color:#342d29}.dw-current-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.dw-current-meta span{font-size:10px;color:#6f655e;border:1px solid #e3d8cd;background:#fff;border-radius:999px;padding:5px 8px}
    .dw-current-question{margin-top:12px;border-left:3px solid #c9a0a7;background:#f7eff0;border-radius:0 11px 11px 0;padding:10px 12px}.dw-current-question small{display:block;font-size:9px;color:var(--accent);font-weight:900;letter-spacing:.06em;margin-bottom:3px}.dw-current-question p{margin:0;color:#4f4641;font-family:Georgia,"Noto Serif TC",serif;font-size:13px;line-height:1.65}
    .dw-current-excerpt{margin-top:11px;color:#7a7069;font-size:11px;line-height:1.7}.dw-current-excerpt b{font-size:9px;color:#9b8f86;letter-spacing:.04em;margin-right:5px}.dw-current-actions{display:grid;gap:7px;min-width:130px}.dw-current-actions .btn{white-space:nowrap}
    .dw-intents{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.dw-intent{background:var(--panel);border:1px solid var(--line);border-radius:17px;padding:17px;display:grid;grid-template-columns:38px 1fr;gap:12px}.dw-intent-icon{width:38px;height:38px;border-radius:12px;background:#f3e7e7;color:var(--accent);display:grid;place-items:center;font-size:18px}.dw-intent h3{margin:1px 0 5px;font-size:15px}.dw-intent p{margin:0;color:var(--muted);font-size:11px;line-height:1.6}.dw-links{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.dw-link{border:0;background:transparent;padding:0;color:var(--accent);font-size:11px;font-weight:800;cursor:pointer}.dw-link:hover{text-decoration:underline}
    .dw-next{background:#f8f2eb;border:1px solid #ddcfc2;border-radius:18px;padding:18px;display:grid;grid-template-columns:40px 1fr auto;gap:12px;align-items:center}.dw-next-icon{width:40px;height:40px;border-radius:50%;background:#fff;color:var(--accent);display:grid;place-items:center;font-weight:900}.dw-next small{display:block;color:var(--accent);font-weight:900;margin-bottom:3px}.dw-next strong{display:block;font-size:15px}.dw-next p{margin:5px 0 0;color:#6b6058;font-size:11px;line-height:1.6}
    .dw-progress{display:grid;gap:7px}.dw-progress-row{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:12px 14px;display:grid;grid-template-columns:120px 1fr auto;gap:12px;align-items:center}.dw-progress-row b{font-size:12px}.dw-progress-row span{font-size:11px;color:var(--muted)}.dw-progress-row em{font-style:normal;font-size:10px;font-weight:900;padding:5px 8px;border-radius:999px;background:#eee7df;color:#6e665f}.dw-progress-row em.started{background:#e3efe5;color:#356044}.dw-progress-row em.current{background:#f3e7e7;color:var(--accent)}
    .dw-mini-stats{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.dw-mini-stat{font-size:10px;color:#d8ceca;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:6px 9px}
    @media(max-width:850px){.dw-hero{padding:23px 20px}.dw-hero h1{font-size:30px}.dw-intents{grid-template-columns:1fr}.dw-continue,.dw-next{grid-template-columns:1fr}.dw-current-actions{grid-template-columns:1fr;min-width:0}.dw-current-title{font-size:21px}.dw-progress-row{grid-template-columns:1fr auto}.dw-progress-row span{grid-column:1/-1}.dw-section-head{display:block}.dw-section-head p{margin-top:4px}}
  `;
  document.head.appendChild(style);
}

function nextSuggestion(m){
  if(m.rawChars>=1000&&m.materials.length<3){
    return {icon:'▦',title:'先把舊稿拆成可使用的素材',detail:`你已有 ${m.rawChars.toLocaleString()} 字原始文字，但素材還不多。先拆故事，比繼續堆文字更容易看見全書結構。`,target:'triage',button:'前往文字拆解台'};
  }
  if(m.materials.length>=5&&!m.proposal.hasAny){
    return {icon:'◎',title:'先不要急著增加更多素材',detail:`你已累積 ${m.materials.length} 筆素材，可以開始問：這本書真正想留下什麼？`,target:'compass',button:'前往全書定位'};
  }
  if(m.proposal.hasAny&&m.chapters.length===0){
    return {icon:'☷',title:'把方向變成章節骨架',detail:'你已開始整理全書方向，下一步先決定每章要回答的問題，不必急著寫正文。',target:'outline',button:'建立章節地圖'};
  }
  if(m.chapters.length>0&&m.drafted.length===0){
    return {icon:'✎',title:'挑一章，先寫出第一版',detail:'章節骨架已經存在。先把其中一章寫成不完美的初稿，再用修稿檢查找缺口。',target:'editor',button:'開始章節正文'};
  }
  if(m.drafted.length>0){
    const c=getLastChapter(m);
    const chars=String(c?.draft||'').length;
    if(c&&!dashNonEmpty(c.question)){
      return {icon:'?',title:'替這一章留下一個真正的問題',detail:'正文已經開始長出來，但核心問題還是空的。先寫下一句「這一章到底想回答什麼？」會比繼續加字更有方向。',chapterId:c.id,button:'整理核心問題'};
    }
    if(chars>=400){
      return {icon:'⚑',title:'先不要急著再加字，讀一次缺口',detail:`這一章目前已有 ${chars.toLocaleString()} 字。可以換到修稿工作室，看畫面、衝突、行動與理解哪一層最值得補。`,target:'diagnosis',button:'去修稿工作室'};
    }
    return {icon:'▣',title:'下一段先補一個看得見的畫面',detail:'這章已經開始了。與其重複整理觀點，可以先補一個具體時刻、動作或物件，讓讀者真正站進現場。',chapterId:c?.id,button:'回章節補畫面'};
  }
  if(m.timeline>0||m.materials.length>0||m.rawChars>0){
    return {icon:'◇',title:'把回憶變成可以使用的故事素材',detail:'你已經開始保存人生資料。下一步不必決定它是不是「好故事」，先把值得記住的事件收進素材庫。',target:'materials',button:'打開素材庫'};
  }
  return {icon:'◷',title:'先保存一段人生，不必先想書',detail:'從一個日期、一張照片或一件突然想到的往事開始。先記住，之後再決定它要不要變成故事。',target:'timeline',button:'打開人生時間軸'};
}

function progressRows(m){
  const step1Started=m.timeline>0||m.rawChars>0;
  const step2Started=m.materials.length>0;
  const step3Started=m.proposal.hasAny||m.chapters.length>0;
  const step4Started=m.drafted.length>0;
  const cloudEnabled=localStorage.getItem('life-archive-cloud-enabled')==='1';
  return [
    ['01 · 整理人生',step1Started?`${m.timeline} 筆時間軸 · ${m.rawChars.toLocaleString()} 字原始文字`:'還沒有資料也沒關係，從一段回憶開始',step1Started?'已開始':'尚未開始'],
    ['02 · 建立素材',m.materials.length?`${m.materials.length} 筆故事素材`:'還沒有素材',step2Started?'已開始':'尚未開始'],
    ['03 · 設計一本書',m.chapters.length?`${m.chapters.length} 個章節 · 全書定位已${m.proposal.hasAny?'開始':'待整理'}`:(m.proposal.hasAny?'全書定位已開始':'尚未整理全書方向'),step3Started?'進行中':'尚未開始'],
    ['04 · 開始寫作',m.chapters.length?`${m.drafted.length} / ${m.chapters.length} 章已有正文`:'先有章節骨架，再開始寫',step4Started?'進行中':'尚未開始'],
    ['05 · 保存',cloudEnabled?'已設定雲端同步；仍建議定期匯出備份':'文字會自動儲存在本機；建議定期匯出備份',cloudEnabled?'已設定':'可隨時備份']
  ];
}

function renderDashboard(){
  const section=document.getElementById('v-dashboard');
  if(!section)return;
  const m=dashboardMetrics();
  const last=getLastChapter(m);
  const suggestion=nextSuggestion(m);
  const lastDraftChars=last?String(last.draft||'').length:0;
  const chapterIndex=last?m.chapters.findIndex(c=>String(c.id)===String(last.id))+1:0;
  const excerpt=lastParagraphExcerpt(last);
  const continueHtml=last?`
    <div class="dw-continue">
      <div>
        <div class="dw-current-eyebrow"><span>上次停在這一章</span>${chapterIndex>0?`<em>第 ${chapterIndex} 章</em>`:''}</div>
        <h3 class="dw-current-title">${dashEsc(last.title||'未命名章節')}</h3>
        <div class="dw-current-meta"><span>${lastDraftChars?`${lastDraftChars.toLocaleString()} 字正文`:'還沒有正文'}</span>${dashNonEmpty(last.question)?'<span>核心問題已設定</span>':'<span>核心問題待整理</span>'}</div>
        ${dashNonEmpty(last.question)?`<div class="dw-current-question"><small>這章正在回答</small><p>${dashEsc(last.question)}</p></div>`:''}
        ${excerpt?`<div class="dw-current-excerpt"><b>上次停在這裡</b>${dashEsc(excerpt)}</div>`:''}
      </div>
      <div class="dw-current-actions"><button class="btn primary" type="button" data-dash-chapter="${dashEsc(last.id)}">${lastDraftChars?'回到這一章':'開始這一章'} →</button></div>
    </div>`:`
    <div class="dw-continue">
      <div><div class="dw-current-eyebrow"><span>目前還沒有正在寫的章節</span></div><h3 class="dw-current-title">不用急著從正文開始。</h3><div class="dw-current-excerpt">可以先保存人生、累積素材，或建立第一個章節骨架。</div></div>
      <div class="dw-current-actions"><button class="btn" type="button" data-dash-target="outline">前往章節地圖</button></div>
    </div>`;

  const rows=progressRows(m);
  section.innerHTML=`
    <div class="dw-hero">
      <div class="dw-kicker">LIFE ARCHIVE · TODAY</div>
      <h1>今天，從哪裡繼續？</h1>
      <p>不需要每天重新規劃人生。回到一段還沒寫完的故事，或換一種方式整理它，就已經是在往前走。</p>
      <div class="dw-mini-stats"><span class="dw-mini-stat">◷ ${m.timeline} 筆時間軸</span><span class="dw-mini-stat">◇ ${m.materials.length} 筆素材</span><span class="dw-mini-stat">☷ ${m.chapters.length} 個章節</span><span class="dw-mini-stat">✎ ${m.drafted.length} 章已有正文</span><span class="dw-mini-stat">❝ ${m.refs.length} 筆借鏡</span></div>
    </div>

    <section class="dw-section">
      <div class="dw-section-head"><div><h2>接著寫</h2><p>回到上次停下來的地方，不需要重新找方向。</p></div></div>
      ${continueHtml}
    </section>

    <section class="dw-section">
      <div class="dw-section-head"><div><h2>如果今天不想接著寫</h2><p>也可以換一種工作，不需要每次都推正文。</p></div></div>
      <div class="dw-intents">
        <article class="dw-intent"><div class="dw-intent-icon">◷</div><div><h3>我想記住一段人生</h3><p>有日期、有照片，或只是突然想到一件往事。先保存，不必判斷它是否值得寫進書。</p><div class="dw-links"><button class="dw-link" data-dash-target="timeline">人生時間軸 →</button><button class="dw-link" data-dash-target="memories">照片回憶 →</button></div></div></article>
        <article class="dw-intent"><div class="dw-intent-icon">◇</div><div><h3>我有一個故事，但不知道放哪裡</h3><p>先收進素材庫。它可以只是事件、畫面或一句還說不清楚的想法。</p><div class="dw-links"><button class="dw-link" data-dash-action="add-material">＋ 新增素材</button><button class="dw-link" data-dash-target="visual">故事工作台 →</button></div></div></article>
        <article class="dw-intent"><div class="dw-intent-icon">◎</div><div><h3>我想整理這本書到底要說什麼</h3><p>故事很多時，不要急著全寫。先找全書核心，再安排章節要回答的問題。</p><div class="dw-links"><button class="dw-link" data-dash-target="compass">全書定位 →</button><button class="dw-link" data-dash-target="outline">章節地圖 →</button></div></div></article>
        <article class="dw-intent"><div class="dw-intent-icon">✎</div><div><h3>我想換成編輯模式</h3><p>不一定要增加新內容，也可以補畫面、查引用，或讀一次故事缺口。</p><div class="dw-links"><button class="dw-link" data-dash-target="references">引用與借鏡 →</button><button class="dw-link" data-dash-target="diagnosis">修稿工作室 →</button></div></div></article>
      </div>
    </section>

    <section class="dw-section">
      <div class="dw-section-head"><div><h2>另一個值得處理的地方</h2><p>和「接著寫」分開，這裡只提示一個旁支工作。</p></div></div>
      <div class="dw-next"><div class="dw-next-icon">${dashEsc(suggestion.icon)}</div><div><small>NEXT STEP</small><strong>${dashEsc(suggestion.title)}</strong><p>${dashEsc(suggestion.detail)}</p></div><button class="btn primary" type="button" ${suggestion.chapterId?`data-dash-chapter="${dashEsc(suggestion.chapterId)}"`:`data-dash-target="${dashEsc(suggestion.target)}"`}>${dashEsc(suggestion.button)} →</button></div>
    </section>

    <section class="dw-section">
      <div class="dw-section-head"><div><h2>你現在的位置</h2><p>不是完成度評分，只是讓你看見資料正在從「人生」慢慢走向「一本書」。</p></div></div>
      <div class="dw-progress">${rows.map(r=>`<div class="dw-progress-row"><b>${dashEsc(r[0])}</b><span>${dashEsc(r[1])}</span><em class="${r[2]==='已開始'?'started':r[2]==='進行中'?'current':''}">${dashEsc(r[2])}</em></div>`).join('')}</div>
    </section>`;

  section.querySelectorAll('[data-dash-target]').forEach(btn=>btn.addEventListener('click',()=>navigateTo(btn.dataset.dashTarget)));
  section.querySelectorAll('[data-dash-chapter]').forEach(btn=>btn.addEventListener('click',()=>continueChapter(btn.dataset.dashChapter)));
  section.querySelectorAll('[data-dash-action="add-material"]').forEach(btn=>btn.addEventListener('click',()=>{
    navigateTo('materials');
    requestAnimationFrame(()=>document.getElementById('addMaterial')?.click());
  }));
}

function trackChapterWork(){
  const select=document.getElementById('chapterSelect');
  const draft=document.getElementById('chapterDraft');
  select?.addEventListener('change',rememberCurrentChapter);
  draft?.addEventListener('input',rememberCurrentChapter);
}

function updateDashboardLabels(){
  const crumb=document.getElementById('crumb');
  if(document.getElementById('v-dashboard')?.classList.contains('active')&&crumb)crumb.textContent='今日工作台';
}

function initDashboardWorkspace(){
  addStyles();trackChapterWork();renderDashboard();updateDashboardLabels();
  window.addEventListener('storage',e=>{if(e.key==='life-archive-writing-studio-v1'||e.key==='life-archive-timeline-v1')renderDashboard()});
  document.addEventListener('click',e=>{
    if(e.target.closest('#nav button[data-v="dashboard"]'))setTimeout(()=>{renderDashboard();updateDashboardLabels()},0);
  });
}

window.LifeArchiveDashboard={render:renderDashboard};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initDashboardWorkspace,{once:true});else initDashboardWorkspace();
