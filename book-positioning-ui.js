import './submission-materials-migration.js';

const GROUPS = [
  {
    id:'core',
    eyebrow:'01 · CORE',
    title:'核心定位',
    desc:'先回答：這是一本什麼書？為什麼值得讀？',
    keys:['title','subtitle','genre','oneLiner','concept','claims']
  },
  {
    id:'reader',
    eyebrow:'02 · READER',
    title:'讀者與問題',
    desc:'界定你正在對誰說話，以及這本書真正想解決什麼困惑。',
    keys:['audience','painPoints','features']
  },
  {
    id:'author',
    eyebrow:'03 · AUTHOR',
    title:'作者定位',
    desc:'不是履歷堆疊，而是回答：為什麼這個題目由你來寫？',
    keys:['author','authorStrength']
  },
  {
    id:'structure',
    eyebrow:'04 · STRUCTURE',
    title:'全書結構',
    desc:'把核心主張落到章節與閱讀順序。',
    keys:['structure']
  }
];

const SHORT_KEYS = new Set(['title','subtitle','genre','oneLiner']);

function waitForProposal(){
  const ready=document.getElementById('publishingProposal');
  if(ready) return Promise.resolve(ready);
  return new Promise(resolve=>{
    const observer=new MutationObserver(()=>{
      const el=document.getElementById('publishingProposal');
      if(el){ observer.disconnect(); resolve(el); }
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  });
}

function escapeHtml(value=''){
  return String(value).replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function editorMap(proposal){
  return new Map(
    [...proposal.querySelectorAll('.proposal-editor')]
      .map(editor=>[editor.dataset.proposalKey,editor])
  );
}

function updateOverview(map,overview){
  const title=(map.get('title')?.value||'').trim() || '尚未設定書名';
  const one=(map.get('oneLiner')?.value||'').trim() || '先寫下一句：這本書想陪讀者走到哪裡？';
  const filled=[...map.values()].filter(x=>x.value.trim()).length;
  const total=map.size || 1;
  const percent=Math.round(filled/total*100);

  overview.querySelector('[data-book-title]').textContent=title;
  overview.querySelector('[data-book-one]').textContent=one;
  overview.querySelector('[data-progress-text]').textContent=`${filled} / ${total} 已填寫`;
  overview.querySelector('[data-progress-bar]').style.width=percent+'%';
}

function makeGroup(group, cards){
  const section=document.createElement('section');
  section.className='position-group';
  section.id='position-'+group.id;
  section.innerHTML=`
    <div class="position-group-head">
      <div>
        <span class="position-kicker">${escapeHtml(group.eyebrow)}</span>
        <h3>${escapeHtml(group.title)}</h3>
        <p>${escapeHtml(group.desc)}</p>
      </div>
    </div>
    <div class="position-grid"></div>
  `;
  const grid=section.querySelector('.position-grid');
  group.keys.forEach(key=>{
    const card=cards.get(key);
    if(!card) return;
    card.classList.toggle('compact',SHORT_KEYS.has(key));
    grid.appendChild(card);
  });
  return section;
}

function redesign(proposal){
  if(document.getElementById('positioningWorkspaceV2')) return;
  const compass=document.getElementById('v-compass');
  if(!compass) return;

  const style=document.createElement('style');
  style.textContent=`
    #v-compass>.panel{display:none}
    #publishingProposal>.proposal-heading{display:none}
    #publishingProposal{margin-top:0!important;display:block!important}
    #positioningWorkspaceV2{display:grid;gap:22px}
    .position-overview{background:linear-gradient(145deg,#2b2623,#3a2c2b);color:#fff;border-radius:24px;padding:28px 30px;box-shadow:0 16px 42px rgba(48,36,32,.14)}
    .position-overview-top{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}
    .position-overview .position-kicker{color:#e6c8c1}
    .position-overview h2{font-family:Georgia,"Noto Serif TC",serif;font-size:34px;line-height:1.28;margin:8px 0 12px;max-width:780px}
    .position-overview p{margin:0;max-width:780px;color:#ded4cf;line-height:1.75;font-size:15px}
    .position-progress{min-width:190px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:13px 14px}
    .position-progress small{display:block;color:#d4c9c3;margin-bottom:9px}
    .position-progress-track{height:6px;background:rgba(255,255,255,.12);border-radius:99px;overflow:hidden}
    .position-progress-bar{height:100%;width:0;background:#ead8c9;border-radius:99px;transition:width .25s ease}
    .position-nav{display:flex;gap:8px;flex-wrap:wrap;margin-top:22px}
    .position-nav button{border:1px solid rgba(255,255,255,.17);background:rgba(255,255,255,.07);color:#fff;border-radius:999px;padding:8px 12px;cursor:pointer;font-size:12px}
    .position-nav button:hover{background:rgba(255,255,255,.13)}
    .position-kicker{font-size:10px;letter-spacing:.14em;font-weight:800;color:var(--accent)}
    .position-group{scroll-margin-top:92px}
    .position-group-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:11px;padding:0 2px}
    .position-group-head h3{font-family:Georgia,"Noto Serif TC",serif;font-size:25px;margin:5px 0 4px}
    .position-group-head p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}
    .position-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .position-grid .proposal-section{display:block!important;grid-column:1/-1;border:1px solid var(--line);border-radius:16px;background:var(--panel);overflow:hidden;box-shadow:0 4px 16px rgba(50,40,30,.035)}
    .position-grid .proposal-section.compact{grid-column:auto}
    .position-grid .proposal-section summary{pointer-events:none;padding:15px 17px 8px;font-size:13px;color:var(--ink);font-weight:800}
    .position-grid .proposal-section summary::after{display:none!important}
    .position-grid .proposal-editor-wrap{padding:0 14px 14px!important}
    .position-grid .proposal-editor{min-height:150px!important;max-height:620px!important;border:1px solid transparent!important;background:#f8f5f0!important;border-radius:11px!important;padding:12px 13px!important;line-height:1.8!important;transition:.16s ease}
    .position-grid .proposal-section.compact .proposal-editor{min-height:88px!important;max-height:220px!important}
    .position-grid .proposal-editor:hover{border-color:#e6ddd2!important}
    .position-grid .proposal-editor:focus{background:#fff!important;border-color:var(--accent)!important;outline:3px solid rgba(123,57,69,.09)!important}
    .position-grid .proposal-save{text-align:right;margin-top:6px!important}
    .positioning-note{border:1px dashed var(--line);border-radius:14px;padding:13px 15px;color:var(--muted);font-size:12px;line-height:1.65;background:rgba(255,253,249,.5)}
    @media(max-width:850px){
      .position-overview{padding:22px 19px;border-radius:19px}
      .position-overview-top{display:block}
      .position-overview h2{font-size:28px}
      .position-progress{margin-top:18px;min-width:0}
      .position-grid{grid-template-columns:1fr}
      .position-grid .proposal-section,.position-grid .proposal-section.compact{grid-column:1}
      .position-group-head h3{font-size:22px}
      .position-grid .proposal-editor{font-size:16px!important}
    }
  `;
  document.head.appendChild(style);

  const map=editorMap(proposal);
  const cards=new Map();
  [...proposal.querySelectorAll('.proposal-section')].forEach(card=>{
    const editor=card.querySelector('.proposal-editor');
    if(!editor) return;
    card.open=true;
    card.addEventListener('toggle',()=>{if(!card.open) card.open=true});
    cards.set(editor.dataset.proposalKey,card);
  });

  const workspace=document.createElement('div');
  workspace.id='positioningWorkspaceV2';

  const overview=document.createElement('section');
  overview.className='position-overview';
  overview.innerHTML=`
    <div class="position-overview-top">
      <div>
        <span class="position-kicker">BOOK POSITIONING</span>
        <h2 data-book-title></h2>
        <p data-book-one></p>
      </div>
      <div class="position-progress">
        <small data-progress-text></small>
        <div class="position-progress-track"><div class="position-progress-bar" data-progress-bar></div></div>
      </div>
    </div>
    <div class="position-nav">
      ${GROUPS.map(g=>`<button type="button" data-jump="${g.id}">${g.title}</button>`).join('')}
    </div>
  `;
  workspace.appendChild(overview);

  GROUPS.forEach(group=>workspace.appendChild(makeGroup(group,cards)));

  const note=document.createElement('div');
  note.className='positioning-note';
  note.textContent='建議使用順序：先定「書名／一句話介紹／核心概念」，再處理讀者與痛點，最後回頭整理作者定位與全書架構。所有欄位仍沿用原本的自動儲存資料，不會另開一份。';
  workspace.appendChild(note);

  proposal.prepend(workspace);
  [...proposal.children].forEach(child=>{
    if(child!==workspace && !child.classList.contains('proposal-heading')) child.style.display='none';
  });

  workspace.querySelectorAll('.proposal-section').forEach(x=>x.style.display='block');

  overview.querySelectorAll('[data-jump]').forEach(button=>{
    button.addEventListener('click',()=>{
      document.getElementById('position-'+button.dataset.jump)?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  map.forEach(editor=>editor.addEventListener('input',()=>updateOverview(map,overview)));
  updateOverview(map,overview);
}

waitForProposal().then(redesign);
