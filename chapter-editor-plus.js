const CHAPTER_TITLE_STYLES=[
  {
    key:'contrast',icon:'↔',name:'矛盾句',
    desc:'把兩個看似衝突的事放在一起，讓讀者想知道中間發生了什麼。',
    patterns:['我準備得很完整，事情卻沒有照計畫走','答案出現了，我反而更不確定','我做得到，不代表我一定想要'],
    cue:'可以找：但是、卻、不代表、原本以為、明明……'
  },
  {
    key:'question',icon:'?',name:'問題句',
    desc:'不要急著把結論放進標題，留下真正困住這一章的問題。',
    patterns:['如果沒有人知道，我還會選它嗎？','努力到什麼時候，才應該停下來？','沒有出錯，就代表真的安全嗎？'],
    cue:'可以問：我當時真正不知道答案的是什麼？'
  },
  {
    key:'scene',icon:'▣',name:'畫面句',
    desc:'抓住一個具體瞬間、動作或物件，讓標題本身就像故事的第一個鏡頭。',
    patterns:['車門關上後，只剩我站在月台上','所有人往前走時，我停在原地看了一眼','那張表格送出去以前，我又重新算了一次'],
    cue:'可以找：一個動作、一個物件、一句當時真的發生的話。'
  }
];

function chapterState(){
  if(window.LifeArchiveStateBridge?.get)return window.LifeArchiveStateBridge.get()||{};
  try{return JSON.parse(localStorage.getItem('life-archive-writing-studio-v1')||'{}')||{}}catch{return {}}
}
function chapterEsc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function currentChapter(){
  const s=chapterState();const chapters=Array.isArray(s.chapters)?s.chapters:[];
  const id=document.getElementById('chapterSelect')?.value;
  return chapters.find(c=>String(c.id)===String(id))||chapters[0]||null;
}

function titleSignals(title=''){
  const t=String(title).trim();
  const isQuestion=/[？?]$/.test(t)||/^(為什麼|怎麼|如何|如果|到底|真的|什麼時候|沒有.*嗎)/.test(t);
  const isContrast=/(但|但是|卻|然而|不代表|原本以為|明明|反而|不是.*而是)/.test(t);
  const isScene=/(站在|走進|走到|看著|拿著|握著|關上|打開|跑|停下|回頭|月台|車站|門口|桌上|手機|行李|窗外|車門|螢幕|麥克風|後方)/.test(t);
  const summaryLike=/(我學到|我學會|讓我學到|讓我明白|我的心得|我的經驗|第一次.*讓我|我從.*學到)/.test(t);
  const tooLong=t.length>28;
  const tooShort=t.length>0&&t.length<5;
  return {isQuestion,isContrast,isScene,summaryLike,tooLong,tooShort,length:t.length};
}

function titleStyleName(signals){
  if(signals.isQuestion)return '問題句';
  if(signals.isContrast)return '矛盾句';
  if(signals.isScene)return '畫面句';
  return '尚未形成明顯類型';
}

function addChapterStyles(){
  if(document.getElementById('chapterEditorPlusStyles'))return;
  const style=document.createElement('style');style.id='chapterEditorPlusStyles';
  style.textContent=`
    #v-editor{max-width:1180px}
    #v-editor>.heading{display:none}
    .ce-hero{background:linear-gradient(145deg,#2b2623,#493638);color:#fff;border-radius:24px;padding:27px 29px;margin-bottom:14px;position:relative;overflow:hidden}.ce-hero:after{content:'Aa';position:absolute;right:24px;top:1px;font-family:Georgia,serif;font-size:110px;color:rgba(255,255,255,.035)}.ce-hero h1{font-family:Georgia,"Noto Serif TC",serif;font-size:35px;margin:6px 0 7px}.ce-hero p{color:#ded4cf;line-height:1.75;max-width:760px;margin:0}.ce-kicker{font-size:10px;letter-spacing:.14em;color:#e5c5bf;font-weight:900}
    .ce-meta{display:grid;grid-template-columns:minmax(230px,.8fr) 1.5fr;gap:11px;margin-bottom:11px}.ce-panel{background:var(--panel);border:1px solid var(--line);border-radius:17px;padding:16px}.ce-panel label{display:grid;gap:6px}.ce-panel label>span{font-size:10px;color:var(--muted);font-weight:900}.ce-panel input,.ce-panel textarea,.ce-panel select{width:100%;border:1px solid var(--line);background:#fff;border-radius:10px;padding:10px 11px;line-height:1.6}.ce-title-line{display:flex;gap:8px;align-items:center}.ce-title-line input{font-family:Georgia,"Noto Serif TC",serif;font-size:18px}.ce-title-badge{font-size:9px;font-weight:900;padding:5px 8px;border-radius:999px;background:#eee7df;color:#6e665f;white-space:nowrap}.ce-title-badge.strong{background:#e3efe5;color:#356044}.ce-title-feedback{margin-top:7px;font-size:10px;color:var(--muted);line-height:1.6}
    .ce-lab{background:#fffdf9;border:1px solid var(--line);border-radius:19px;margin-bottom:11px;overflow:hidden}.ce-lab-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px 17px;cursor:pointer}.ce-lab-head h2{font-family:Georgia,"Noto Serif TC",serif;font-size:19px;margin:0}.ce-lab-head p{font-size:10px;color:var(--muted);margin:3px 0 0}.ce-lab-body{display:none;border-top:1px solid var(--line);padding:15px 17px}.ce-lab.open .ce-lab-body{display:block}.ce-style-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.ce-style{background:#f8f5f0;border:1px solid #e5ddd3;border-radius:14px;padding:13px}.ce-style-top{display:flex;gap:8px;align-items:center;margin-bottom:5px}.ce-style-icon{width:29px;height:29px;border-radius:9px;background:#efe2e4;color:var(--accent);display:grid;place-items:center;font-weight:900}.ce-style b{font-size:12px}.ce-style>p{font-size:10px;color:var(--muted);line-height:1.55;margin:0 0 8px}.ce-examples{display:grid;gap:5px}.ce-example{border:0;background:#fff;text-align:left;border-radius:9px;padding:7px 8px;font-size:10px;color:#574f49;cursor:pointer}.ce-example:hover{outline:1px solid #d8c3c6}.ce-cue{font-size:9px;color:var(--accent);line-height:1.5;margin-top:7px}
    .ce-three-checks{margin-top:12px;background:#f6efe8;border-radius:13px;padding:12px}.ce-three-checks strong{display:block;font-size:11px;margin-bottom:7px}.ce-check-list{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.ce-check{background:#fff;border-radius:10px;padding:9px;font-size:10px;line-height:1.5;color:#665d57}.ce-check b{color:var(--accent)}.ce-before-after{margin-top:11px;border-top:1px dashed #d9c9bf;padding-top:11px;display:grid;grid-template-columns:1fr 28px 1fr;gap:8px;align-items:center}.ce-ba{background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px}.ce-ba small{display:block;font-size:8px;font-weight:900;color:var(--accent);margin-bottom:4px}.ce-ba p{font-size:10px;line-height:1.6;margin:0;color:#584f49}.ce-ba-arrow{text-align:center;color:var(--muted)}
    .ce-writing-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:9px}.ce-writing-head h2{font-family:Georgia,"Noto Serif TC",serif;font-size:20px;margin:0}.ce-count{font-size:10px;color:var(--muted)}.ce-draft{min-height:470px;font-family:Georgia,"Noto Serif TC",serif!important;font-size:17px!important;line-height:1.95!important;padding:18px!important}.ce-tool-row{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.ce-tool{border:1px solid var(--line);background:#faf6f0;border-radius:999px;padding:7px 10px;font-size:10px;cursor:pointer}.ce-tool:hover{border-color:#cbb9ac}.ce-note{font-size:10px;color:var(--muted);line-height:1.6;margin-top:9px}
    @media(max-width:850px){.ce-hero{padding:22px 20px}.ce-hero h1{font-size:29px}.ce-meta,.ce-style-grid{grid-template-columns:1fr}.ce-title-line{display:block}.ce-title-badge{display:inline-block;margin-top:7px}.ce-check-list{grid-template-columns:1fr}.ce-before-after{grid-template-columns:1fr}.ce-ba-arrow{transform:rotate(90deg)}.ce-panel input,.ce-panel textarea,.ce-panel select,.ce-draft{font-size:16px!important}}
  `;
  document.head.appendChild(style);
}

function buildEditor(){
  const section=document.getElementById('v-editor');
  const select=document.getElementById('chapterSelect');
  const title=document.getElementById('chapterTitle');
  const question=document.getElementById('chapterQuestion');
  const draft=document.getElementById('chapterDraft');
  if(!section||!select||!title||!question||!draft||section.dataset.chapterPlus==='1')return false;
  section.dataset.chapterPlus='1';

  const hero=document.createElement('div');hero.className='ce-hero';hero.innerHTML=`<div class="ce-kicker">CHAPTER WORKSPACE · STORY → QUESTION → DRAFT</div><h1>章節編輯器</h1><p>章名不要急著把答案講完；正文也不用一開始就完整。先抓住這一章真正的問題和一個看得見的場景，再慢慢往裡面走。</p>`;
  section.insertBefore(hero,section.firstChild);

  const oldTwo=section.querySelector('.two');
  const oldDraftPanel=draft.closest('.panel');
  if(oldTwo)oldTwo.style.display='none';
  if(oldDraftPanel)oldDraftPanel.style.display='none';

  const meta=document.createElement('div');meta.className='ce-meta';
  const selectPanel=document.createElement('div');selectPanel.className='ce-panel';selectPanel.innerHTML='<label><span>目前章節</span></label>';selectPanel.querySelector('label').appendChild(select);
  const identity=document.createElement('div');identity.className='ce-panel';identity.innerHTML='<label><span>章名</span><div class="ce-title-line"><div style="flex:1" id="ceTitleSlot"></div><span class="ce-title-badge" id="ceTitleBadge">分析中</span></div><div class="ce-title-feedback" id="ceTitleFeedback"></div></label>';
  identity.querySelector('#ceTitleSlot').appendChild(title);
  meta.append(selectPanel,identity);section.insertBefore(meta,oldTwo||section.children[1]);

  const lab=document.createElement('section');lab.className='ce-lab';lab.id='ceTitleLab';
  lab.innerHTML=`<div class="ce-lab-head" id="ceTitleLabToggle"><div><h2>章名工作台</h2><p>不要把背景、事件、結果、道理全部塞進標題。留一點縫隙，讓讀者想走進正文。</p></div><button class="btn" type="button">展開</button></div><div class="ce-lab-body"><div class="ce-style-grid">${CHAPTER_TITLE_STYLES.map(s=>`<article class="ce-style"><div class="ce-style-top"><div class="ce-style-icon">${s.icon}</div><b>${s.name}</b></div><p>${s.desc}</p><div class="ce-examples">${s.patterns.map(p=>`<button type="button" class="ce-example" data-title-example="${chapterEsc(p)}">${chapterEsc(p)}</button>`).join('')}</div><div class="ce-cue">${s.cue}</div></article>`).join('')}</div><div class="ce-three-checks"><strong>章名三題檢查</strong><div class="ce-check-list"><div class="ce-check"><b>① 會想知道發生什麼嗎？</b><br>不要把整章結論先講完。</div><div class="ce-check"><b>② 讀完後會有第二層意思嗎？</b><br>最好不只是在描述那一件事。</div><div class="ce-check"><b>③ 像這本書，而不是心得報告嗎？</b><br>少用「我學到／讓我明白」當章名。</div></div></div><div class="ce-before-after"><div class="ce-ba"><small>摘要型</small><p>我第一次獨自旅行學會獨立</p></div><div class="ce-ba-arrow">→</div><div class="ce-ba"><small>畫面型</small><p>車門關上後，只剩我站在月台上</p></div></div></div>`;
  section.insertBefore(lab,oldTwo||section.children[2]);

  const qPanel=document.createElement('div');qPanel.className='ce-panel';qPanel.innerHTML='<label><span>這章真正要回答的問題</span><div id="ceQuestionSlot"></div></label><div class="ce-note">如果章名是「門」，這個問題就是你寫作時的方向。不是摘要，而是讀者一路讀下去想知道的答案。</div>';qPanel.querySelector('#ceQuestionSlot').appendChild(question);section.insertBefore(qPanel,oldTwo||section.children[3]);

  const writing=document.createElement('div');writing.className='ce-panel';writing.innerHTML='<div class="ce-writing-head"><h2>正文</h2><span class="ce-count" id="ceWordCount">0 字</span></div><div id="ceDraftSlot"></div><div class="ce-tool-row"><button class="ce-tool" data-ce-go="memories" type="button">▧ 從照片找畫面</button><button class="ce-tool" data-ce-go="materials" type="button">◇ 從素材找故事</button><button class="ce-tool" data-ce-go="references" type="button">❝ 加入引用與借鏡</button><button class="ce-tool" data-ce-go="diagnosis" type="button">⚑ 去修稿工作室</button></div><div class="ce-note">先寫一個看得見的場景，再寫當時的想法。不要急著替過去的自己下結論；修稿工作室會再幫你找畫面、衝突與理解的缺口。</div>';
  writing.querySelector('#ceDraftSlot').appendChild(draft);draft.classList.add('ce-draft');section.insertBefore(writing,oldDraftPanel||null);

  lab.querySelector('#ceTitleLabToggle')?.addEventListener('click',e=>{if(e.target.closest('[data-title-example]'))return;lab.classList.toggle('open');lab.querySelector('#ceTitleLabToggle .btn').textContent=lab.classList.contains('open')?'收起':'展開'});
  lab.querySelectorAll('[data-title-example]').forEach(btn=>btn.addEventListener('click',()=>{title.value=btn.dataset.titleExample;title.dispatchEvent(new Event('input',{bubbles:true}));title.focus()}));
  section.querySelectorAll('[data-ce-go]').forEach(btn=>btn.addEventListener('click',()=>window.LifeArchiveNavigate?.(btn.dataset.ceGo)));
  return true;
}

function updateTitleAnalysis(){
  const title=document.getElementById('chapterTitle');const badge=document.getElementById('ceTitleBadge');const feedback=document.getElementById('ceTitleFeedback');if(!title||!badge||!feedback)return;
  const t=title.value.trim();const sig=titleSignals(t);const style=titleStyleName(sig);
  badge.textContent=t?style:'還沒有章名';badge.classList.toggle('strong',sig.isQuestion||sig.isContrast||sig.isScene);
  let notes=[];
  if(!t)notes.push('先用暫定章名也可以，等正文長出來再回來命名。');
  else{
    if(sig.summaryLike)notes.push('現在比較像「心得結論」，可以試著把答案拿掉，留下衝突、問題或一個具體畫面。');
    if(sig.tooLong)notes.push('章名偏長；看看是否同時塞了背景、事件、結果和道理，能不能只留下最有張力的一層。');
    if(sig.tooShort)notes.push('很短沒有問題，但目前資訊較少；確認它是否仍能勾起好奇。');
    if(!sig.summaryLike&&!sig.tooLong&&(sig.isQuestion||sig.isContrast||sig.isScene))notes.push('目前已經有明顯的閱讀鉤子。再問一次：讀完正文後，這句話會不會多一層意思？');
    if(!notes.length)notes.push('目前比較像中性描述。可以試著改成「矛盾句、問題句、畫面句」其中一種，再比較哪一個最像這章。');
  }
  feedback.textContent=notes.join(' ');
  const select=document.getElementById('chapterSelect');
  if(select?.selectedOptions?.[0]&&t)select.selectedOptions[0].textContent=t;
}

function updateDraftCount(){
  const draft=document.getElementById('chapterDraft');const count=document.getElementById('ceWordCount');if(!draft||!count)return;
  const text=draft.value||'';const chars=text.replace(/\s/g,'').length;const paragraphs=text.split(/\n+/).filter(x=>x.trim()).length;
  count.textContent=`${chars.toLocaleString()} 字 · ${paragraphs} 段`;
}

function syncChapterEditor(){
  updateTitleAnalysis();updateDraftCount();
}

function initChapterEditorPlus(){
  addChapterStyles();buildEditor();syncChapterEditor();
  document.getElementById('chapterTitle')?.addEventListener('input',updateTitleAnalysis);
  document.getElementById('chapterDraft')?.addEventListener('input',updateDraftCount);
  document.getElementById('chapterSelect')?.addEventListener('change',()=>setTimeout(syncChapterEditor,0));
  document.addEventListener('click',e=>{if(e.target.closest('#nav button[data-v="editor"]'))setTimeout(syncChapterEditor,0)});
}

window.LifeArchiveChapterEditor={refresh:syncChapterEditor};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initChapterEditorPlus,{once:true});else initChapterEditorPlus();
