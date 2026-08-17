const WORKFLOW=[
  {label:null,items:['dashboard']},
  {label:'01 · 整理人生',items:['timeline','memories','source']},
  {label:'02 · 建立素材',items:['materials','triage','visual']},
  {label:'03 · 設計一本書',items:['compass','outline']},
  {label:'04 · 開始寫作',items:['editor','references','diagnosis']},
  {label:'05 · 保存',items:['export']}
];

const LABELS={
  dashboard:'⌂ 今日工作台',timeline:'◷ 人生時間軸',memories:'▧ 照片回憶',source:'≡ 原始文字',
  materials:'◇ 素材庫',triage:'▦ 文字拆解台',visual:'✦ 故事工作台',compass:'◎ 全書定位',outline:'☷ 章節地圖',
  editor:'✎ 章節編輯器',references:'❝ 引用與借鏡',diagnosis:'⚑ 修稿檢查',export:'⇩ 備份與匯出'
};

function addStyles(){
  if(document.getElementById('workflowSidebarStyles'))return;
  const style=document.createElement('style');
  style.id='workflowSidebarStyles';
  style.textContent=`
    #nav{gap:2px!important;padding-right:2px}
    #nav .workflow-group-label{font-size:9px;letter-spacing:.14em;color:#756d66;font-weight:800;padding:15px 12px 5px;user-select:none}
    #nav button{min-height:38px;padding:8px 11px!important;font-size:13px;line-height:1.25}
    #nav button[data-v="dashboard"]{margin-bottom:4px}
    #nav .workflow-divider{height:1px;background:rgba(255,255,255,.06);margin:5px 9px 2px}
    @media(max-width:850px){#nav .workflow-group-label{padding-top:13px;color:#8f867f}#nav button{min-height:42px;font-size:14px}}
  `;
  document.head.appendChild(style);
}

function openView(key){
  if(key==='timeline'){
    window.LifeArchiveTimelineUI?.open?.();
    return;
  }
  window.LifeArchiveNavigate?.(key);
  if(key==='dashboard')setTimeout(()=>window.LifeArchiveDashboard?.render?.(),0);
}

function buildSidebar(){
  const nav=document.getElementById('nav');
  if(!nav)return;
  nav.replaceChildren();
  WORKFLOW.forEach((group,index)=>{
    if(group.label){
      const label=document.createElement('div');
      label.className='workflow-group-label';
      label.textContent=group.label;
      nav.appendChild(label);
    }
    group.items.forEach(key=>{
      const button=document.createElement('button');
      button.type='button';
      button.dataset.v=key;
      button.textContent=LABELS[key]||key;
      if(key==='dashboard')button.classList.add('active');
      button.addEventListener('click',()=>openView(key));
      nav.appendChild(button);
    });
    if(index===0){
      const divider=document.createElement('div');
      divider.className='workflow-divider';
      nav.appendChild(divider);
    }
  });
}

function renamePageHeadings(){
  const triage=document.querySelector('#v-triage .heading');
  if(triage?.querySelector('h1'))triage.querySelector('h1').textContent='文字拆解台';
  if(triage?.querySelector('p'))triage.querySelector('p').textContent='把舊稿、筆記或一大段文字拆成可以重複使用的故事素材。';
  const visual=document.querySelector('#v-visual .heading');
  if(visual?.querySelector('h1'))visual.querySelector('h1').textContent='故事工作台';
  if(visual?.querySelector('p'))visual.querySelector('p').textContent='把素材依「靈感箱 → 發展中 → 可寫作 → 已放入章節」推進。';
}

function init(){
  addStyles();
  renamePageHeadings();
  buildSidebar();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
