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
    .dw-continue{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:18px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center}.dw-continue small{display:block;color:var(--accent);font-weight:800;margin-bottom:4px}.dw-continue strong{font-size:19px}.dw-continue p{color:var(--muted);font-size:12px;line-height:1.6;margin:6px 0 0}
    .dw-intents{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.dw-intent{background:var(--panel);border:1px solid var(--line);border-radius:17px;padding:17px;display:grid;grid-template-columns:38px 1fr;gap:12px}.dw-intent-icon{width:38px;height:38px;border-radius:12px;background:#f3e7e7;color:var(--accent);display:grid;place-items:center;font-size:18px}.dw-intent h3{margin:1px 0 5px;font-size:15px}.dw-intent p{margin:0;color:var(--muted);font-size:11px;line-height:1.6}.dw-links{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.dw-link{border:0;background:transparent;padding:0;color:var(--accent);font-size:11px;font-weight:800;cursor:pointer}.dw-link:hover{text-decoration:underline}
    .dw-next{background:#f8f2eb;border:1px solid #ddcfc2;border-radius:18px;padding:18px;display:grid;grid-template-columns:40px 1fr auto;gap:12px;align-items:center}.dw-next-icon{width:40px;height:40px;border-radius:50%;background:#fff;color:var(--accent);display:grid;place-items:center;font-weight:900}.dw-next small{display:block;color:var(--accent);font-weight:900;margin-bottom:3px}.dw-next strong{display:block;font-size:15px}.dw-next p{margin:5px 0 0;color:#6b6058;font-size:11px;line-height:1.6}
    .dw-progress{display:grid;gap:7px}.dw-progress-row{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:12px 14px;display:grid;grid-template-columns:120px 1fr auto;gap:12px;align-items:center}.dw-progress-row b{font-size:12px}.dw-progress-row span{font-size:11px;color:var(--muted)}.dw-progress-row em{font-style:normal;font-size:10px;font-weight:900;padding:5px 8px;border-radius:999px;background:#eee7df;color:#6e665f}.dw-progress-row em.started{background:#e3efe5;color:#356044}.dw-progress-row em.current{background:#f3e7e7;color:var(--accent)}
    .dw-mini-stats{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.dw-mini-stat{font-size:10px;color:#d8ceca;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:6px 9px}
    @media(max-width:850px){.dw-hero{padding:23px 20px}.dw-hero h1{font-size:30px}.dw-intents{grid-template-columns:1fr}.dw-continue,.dw-next{grid-template-columns:1fr}.dw-progress-row{grid-template-columns:1fr auto}.dw-progress-row span{grid-column:1/-1}.dw-section-head{display:block}.dw-section-head p{margin-top:4px}}
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
    return {icon:'→',title:'繼續正在形成的章節',detail:`目前已有 ${m.drafted.length} 個章節出現正文。比起重新開一個新坑，先把一章往前推。`,chapterId:c?.id,button:'繼續寫作'};
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
  const continueHtml=last?`
    <div class="dw-continue">
      <div><small>繼續上次的工作</small><strong>${dashEsc(last.title||'未命名章節')}</strong><p>${lastDraftChars?`${lastDraftChars.toLocaleString()} 字正文`:'這一章還沒有正文'}${dashNonEmpty(last.question)?` · ${dashEsc(last.question)}`:''}</p></div>
      <button class="btn primary" type="button" data-dash-chapter="${dashEsc(last.id)}">${lastDraftChars?'繼續寫作':'開始這一章'} →</button>
    </div>`:`
    <div class="dw-continue">
      <div><small>還沒有正在寫的章節</small><strong>不用急著寫正文。</strong><p>可以先保存人生、累積素材，或建立第一個章節骨架。</p></div>
      <button class="btn" type="button" data-dash-target="outline">前往章節地圖</button>
    </div>`;

  const rows=progressRows(m);
  section.innerHTML=`
    <div class="dw-hero">
      <div class="dw-kicker">LIFE ARCHIVE · TODAY</div>
      <h1>今天想把哪一小部分往前推？</h1>
      <p>先保存，再理解；想寫成書的時候，再把故事慢慢組起來。你不必每次都從「寫一本書」開始。</p>
      <div class="dw-mini-stats"><span class="dw-mini-stat">◷ ${m.timeline} 筆時間軸</span><span class="dw-mini-stat">◇ ${m.materials.length} 筆素材</span><span class="dw-mini-stat">☷ ${m.chapters.length} 個章節</span><span class="dw-mini-stat">✎ ${m.drafted.length} 章已有正文</span><span class="dw-mini-stat">❝ ${m.refs.length} 筆借鏡</span></div>
    </div>

    <section class="dw-section">
      <div class="dw-section-head"><div><h2>繼續上次的工作</h2><p>大多數時候，你不是重新開始，而是繼續。</p></div></div>
      ${continueHtml}
    </section>

    <section class="dw-section">
      <div class="dw-section-head"><div><h2>今天你想做什麼？</h2><p>先選現在的狀態，不必先理解所有功能。</p></div></div>
      <div class="dw-intents">
        <article class="dw-intent"><div class="dw-intent-icon">◷</div><div><h3>我想記住一段人生</h3><p>有日期、有照片，或只是突然想到一件往事。先保存，不必判斷它是否值得寫進書。</p><div class="dw-links"><button class="dw-link" data-dash-target="timeline">人生時間軸 →</button><button class="dw-link" data-dash-target="memories">照片回憶 →</button></div></div></article>
        <article class="dw-intent"><div class="dw-intent-icon">◇</div><div><h3>我有一個故事，但不知道放哪裡</h3><p>先收進素材庫。它可以只是事件、畫面或一句還說不清楚的想法。</p><div class="dw-links"><button class="dw-link" data-dash-action="add-material">＋ 新增素材</button><button class="dw-link" data-dash-target="visual">故事工作台 →</button></div></div></article>
        <article class="dw-intent"><div class="dw-intent-icon">◎</div><div><h3>我想整理這本書到底要說什麼</h3><p>故事很多時，不要急著全寫。先找全書核心，再安排章節要回答的問題。</p><div class="dw-links"><button class="dw-link" data-dash-target="compass">全書定位 →</button><button class="dw-link" data-dash-target="outline">章節地圖 →</button></div></div></article>
        <article class="dw-intent"><div class="dw-intent-icon">✎</div><div><h3>我已經知道要寫什麼</h3><p>直接進正文。先寫出一版，再用修稿檢查與引用借鏡補深度。</p><div class="dw-links"><button class="dw-link" data-dash-target="editor">章節編輯器 →</button><button class="dw-link" data-dash-target="diagnosis">修稿檢查 →</button></div></div></article>
      </div>
    </section>

    <section class="dw-section">
      <div class="dw-section-head"><div><h2>我建議你下一步</h2><p>依目前資料狀態提供方向，不是要求你照做。</p></div></div>
      <div class="dw-next"><div class="dw-next-icon">${dashEsc(suggestion.icon)}</div><div><small>NEXT STEP</small><strong>${dashEsc(suggestion.title)}</strong><p>${dashEsc(suggestion.detail)}</p></div><button class="btn primary" type="button" ${suggestion.chapterId?`data-dash-chapter="${dashEsc(suggestion.chapterId)}"`:`data-dash-target="${dashEsc(suggestion.target)}"`}>${dashEsc(suggestion.button)} →</button></div>
    </section>

    <section class="dw-section">
      <div class="dw-section-head"><div><h2>你現在的位置</h2><p>不是完成度評分，只是讓你看見資料正在從「人生」慢慢走向「一本書」。</p></div></div>
      <div class="dw-progress">${rows.map((r,i)=>`<div class="dw-progress-row"><b>${dashEsc(r[0])}</b><span>${dashEsc(r[1])}</span><em class="${r[2]==='已開始'?'started':r[2]==='進行中'?'current':''}">${dashEsc(r[2])}</em></div>`).join('')}</div>
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
