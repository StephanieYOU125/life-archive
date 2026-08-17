const WORKFLOW=[
  {label:null,items:['dashboard']},
  {label:'01 · 整理人生',items:['timeline','memories','source']},
  {label:'02 · 建立素材',items:['materials','triage','visual']},
  {label:'03 · 設計一本書',items:['compass','outline']},
  {label:'04 · 開始寫作',items:['editor','references','diagnosis']},
  {label:'05 · 保存',items:['export']}
];

const LABELS={
  dashboard:'⌂ 從哪裡開始',timeline:'◷ 人生時間軸',memories:'▧ 照片回憶',source:'≡ 原始文字',
  materials:'◇ 素材庫',triage:'▦ 文字拆解台',visual:'✦ 故事工作台',compass:'◎ 全書定位',outline:'☷ 章節地圖',
  editor:'✎ 章節編輯器',references:'❝ 引用與借鏡',diagnosis:'⚑ 修稿檢查',export:'⇩ 備份與匯出'
};

const CRUMBS={
  dashboard:'從哪裡開始',timeline:'人生時間軸',memories:'照片回憶',source:'原始文字',materials:'素材庫',
  triage:'文字拆解台',visual:'故事工作台',compass:'全書定位',outline:'章節地圖',editor:'章節編輯器',
  references:'引用與借鏡',diagnosis:'修稿檢查',export:'備份與匯出'
};

function addStyles(){
  if(document.getElementById('workflowSidebarStyles'))return;
  const style=document.createElement('style');style.id='workflowSidebarStyles';style.textContent=`
    #nav{gap:2px!important;padding-right:2px}
    #nav .workflow-group-label{font-size:9px;letter-spacing:.14em;color:#756d66;font-weight:800;padding:15px 12px 5px;user-select:none}
    #nav button{min-height:38px;padding:8px 11px!important;font-size:13px;line-height:1.25}
    #nav button[data-v="dashboard"]{margin-bottom:4px}
    #nav .workflow-divider{height:1px;background:rgba(255,255,255,.06);margin:5px 9px 2px}
    @media(max-width:850px){#nav .workflow-group-label{padding-top:13px;color:#8f867f}#nav button{min-height:42px;font-size:14px}}
  `;document.head.appendChild(style);
}

function renamePageHeadings(){
  const triage=document.querySelector('#v-triage .heading');
  if(triage?.querySelector('h1'))triage.querySelector('h1').textContent='文字拆解台';
  if(triage?.querySelector('p'))triage.querySelector('p').textContent='把舊稿、筆記或一大段文字拆成可以重複使用的故事素材。';
  const visual=document.querySelector('#v-visual .heading');
  if(visual?.querySelector('h1'))visual.querySelector('h1').textContent='故事工作台';
  if(visual?.querySelector('p'))visual.querySelector('p').textContent='把素材依「靈感箱 → 發展中 → 可寫作 → 已放入章節」推進。';
}

function arrange(){
  const nav=document.getElementById('nav');if(!nav)return false;
  const buttons=new Map([...nav.querySelectorAll('button[data-v]')].map(b=>[b.dataset.v,b]));
  nav.querySelectorAll('.workflow-group-label,.workflow-divider').forEach(x=>x.remove());
  Object.entries(LABELS).forEach(([key,label])=>{const btn=buttons.get(key);if(btn){btn.textContent=label;btn.classList.remove('photo-entry')}});
  WORKFLOW.forEach((group,index)=>{
    if(group.label){const label=document.createElement('div');label.className='workflow-group-label';label.textContent=group.label;nav.appendChild(label)}
    group.items.forEach(key=>{const button=buttons.get(key);if(button)nav.appendChild(button)});
    if(index===0){const divider=document.createElement('div');divider.className='workflow-divider';nav.appendChild(divider)}
  });
  [...buttons.values()].forEach(button=>{
    if(button.dataset.workflowCrumbBound)return;
    button.dataset.workflowCrumbBound='1';
    button.addEventListener('click',()=>setTimeout(()=>{const crumb=document.getElementById('crumb');const label=CRUMBS[button.dataset.v];if(crumb&&label)crumb.textContent=label},0));
  });
  return buttons.has('timeline');
}

function init(){
  addStyles();renamePageHeadings();
  const hasTimeline=arrange();
  const nav=document.getElementById('nav');if(!nav||hasTimeline)return;
  const observer=new MutationObserver(()=>{if(arrange())observer.disconnect()});
  observer.observe(nav,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
