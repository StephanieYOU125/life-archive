const LOCAL_KEY='life-archive-writing-studio-v1';

// Keep only the proposal schema in public source. Personal proposal content lives in
// localStorage / Firestore after sign-in and is never seeded from this JS file.
const proposalSections=[
  ['author','作者介紹',''],
  ['title','一、書名',''],
  ['subtitle','二、副標題',''],
  ['genre','三、書籍類型',''],
  ['concept','四、核心概念',''],
  ['oneLiner','五、一句話介紹',''],
  ['claims','六、書籍主張',''],
  ['audience','七、目標讀者',''],
  ['painPoints','八、讀者痛點',''],
  ['features','九、內容特色',''],
  ['authorStrength','十、作者背景與寫作優勢',''],
  ['structure','十一、全書架構','']
];

function readState(){
  try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'{}')||{}}catch{return {}}
}
function defaults(){return Object.fromEntries(proposalSections.map(([key,,text])=>[key,text]))}
function currentProposal(){
  const state=readState();
  return {...defaults(),...(state.publishingProposal||{})};
}

// Preserve proposal data when another Life Archive module saves the shared workspace.
const previousSetItem=Storage.prototype.setItem;
Storage.prototype.setItem=function(key,value){
  if(this===localStorage&&key===LOCAL_KEY){
    try{
      const next=JSON.parse(value);
      const existing=readState().publishingProposal;
      if(existing&&!next.publishingProposal) next.publishingProposal=existing;
      value=JSON.stringify(next);
    }catch{}
  }
  return previousSetItem.call(this,key,value);
};

function saveProposalField(key,value){
  const state=readState();
  state.publishingProposal={...defaults(),...(state.publishingProposal||{}),[key]:value};
  localStorage.setItem(LOCAL_KEY,JSON.stringify(state));
  const saved=document.getElementById('saved');
  if(saved)saved.textContent='已自動儲存在本機';
}
function autoGrow(textarea){
  textarea.style.height='auto';
  textarea.style.height=Math.min(Math.max(textarea.scrollHeight,110),560)+'px';
}
function downloadMergedBackup(){
  const state=readState();
  state.publishingProposal={...defaults(),...(state.publishingProposal||{})};
  const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
  const a=document.createElement('a');
  a.href=url;
  a.download='life-archive-writing-'+new Date().toISOString().slice(0,10)+'.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),500);
}

function mountBookPositioning(){
  const compass=document.getElementById('v-compass');
  if(!compass||document.getElementById('publishingProposal'))return;

  const style=document.createElement('style');
  style.textContent=`
    .publishing-proposal{margin-top:20px;display:grid;gap:12px}
    .proposal-heading{background:var(--panel);border:1px solid var(--line);border-radius:17px;padding:20px}
    .proposal-heading h2{font-family:Georgia,"Noto Serif TC",serif;margin:7px 0 8px;font-size:28px}
    .proposal-heading p{margin:0;color:var(--muted);line-height:1.7}
    .proposal-section{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}
    .proposal-section summary{cursor:pointer;padding:16px 18px;font-weight:800;list-style:none}
    .proposal-section summary::-webkit-details-marker{display:none}
    .proposal-section summary::after{content:'＋';float:right;color:var(--muted)}
    .proposal-section[open] summary::after{content:'－'}
    .proposal-editor-wrap{padding:0 18px 18px}
    .proposal-editor{display:block;width:100%;min-height:110px;max-height:560px;overflow:auto;resize:vertical;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);padding:13px 14px;line-height:1.8;box-sizing:border-box;font:inherit}
    .proposal-editor:focus{outline:2px solid rgba(123,57,69,.18);border-color:var(--accent)}
    .proposal-save{display:block;color:var(--muted);font-size:11px;margin-top:7px}
    @media(max-width:850px){.proposal-editor{font-size:16px;line-height:1.75}.proposal-heading h2{font-size:24px}.proposal-editor-wrap{padding:0 14px 14px}}
  `;
  document.head.appendChild(style);

  const values=currentProposal();
  const wrap=document.createElement('div');
  wrap.id='publishingProposal';
  wrap.className='publishing-proposal';
  wrap.innerHTML='<div class="proposal-heading"><span class="eyebrow">PUBLISHING PROPOSAL</span><h2>出版企劃大綱</h2><p>每一格都可以直接編輯，輸入後會自動儲存。</p></div>';

  proposalSections.forEach(([key,title],i)=>{
    const details=document.createElement('details');
    details.className='proposal-section';
    if(i===0||key==='concept')details.open=true;
    const summary=document.createElement('summary');
    summary.textContent=title;
    const editorWrap=document.createElement('div');
    editorWrap.className='proposal-editor-wrap';
    const textarea=document.createElement('textarea');
    textarea.className='proposal-editor';
    textarea.dataset.proposalKey=key;
    textarea.value=values[key]||'';
    textarea.placeholder='在這裡輸入內容……';
    const state=document.createElement('small');
    state.className='proposal-save';
    state.textContent='✓ 已自動儲存';
    let timer=null;
    textarea.addEventListener('input',()=>{
      state.textContent='儲存中…';
      autoGrow(textarea);
      clearTimeout(timer);
      timer=setTimeout(()=>{
        saveProposalField(key,textarea.value);
        state.textContent='✓ 已自動儲存';
      },350);
    });
    details.addEventListener('toggle',()=>{if(details.open)requestAnimationFrame(()=>autoGrow(textarea))});
    editorWrap.append(textarea,state);
    details.append(summary,editorWrap);
    wrap.appendChild(details);
    requestAnimationFrame(()=>autoGrow(textarea));
  });
  compass.appendChild(wrap);

  ['backupTop','exportJson'].forEach(id=>{
    const button=document.getElementById(id);
    if(!button)return;
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      downloadMergedBackup();
    },true);
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountBookPositioning,{once:true});
else mountBookPositioning();
