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
  materials:'◇ 素材庫',triage:'▦ 素材整理台',visual:'✦ 故事工作台',compass:'◎ 全書定位',outline:'☷ 章節地圖',
  editor:'✎ 章節編輯器',references:'❝ 引用與借鏡',diagnosis:'⚑ 修稿檢查',export:'⇩ 備份與匯出'
};

const SYSTEM_OPTION_EN={
  '全部':'All','國小':'Elementary School','國中':'Junior High School','高中':'Senior High School','大學':'University','研究所':'Graduate School',
  '工作':'Work','旅行':'Travel','交換':'Exchange','運動':'Sports','娛樂':'Leisure','挑戰':'Challenge','其他':'Other',
  '靈感箱':'Idea Box','發展中':'Developing','可寫作':'Ready to Write','已放入章節':'Added to Chapter',
  '精確日期':'Exact Date','年月':'Year / Month','年份':'Year','約略時間':'Approximate Time','待確認':'Needs Review',
  '已確認':'Confirmed','部分確認':'Partly Confirmed','有矛盾':'Conflict','待確認來源':'Source to Verify','已確認來源':'Source Verified',
  '書籍':'Book','文章／報導':'Article / Report','研究／論文':'Research / Paper','人物／訪談':'Person / Interview','影片／Podcast':'Video / Podcast','理論／概念':'Theory / Concept',
  '未指定篇章':'No Chapter Assigned','未連結時間軸':'No Timeline Link','還沒決定放哪一章':'Chapter Not Decided'
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
  if(triage?.querySelector('h1'))triage.querySelector('h1').textContent='素材整理台';
  if(triage?.querySelector('p'))triage.querySelector('p').textContent='整理舊文字或人生經歷，再把有價值的內容送進素材庫。';
  const visual=document.querySelector('#v-visual .heading');
  if(visual?.querySelector('h1'))visual.querySelector('h1').textContent='故事工作台';
  if(visual?.querySelector('p'))visual.querySelector('p').textContent='把素材依「靈感箱 → 發展中 → 可寫作 → 已放入章節」推進。';
}

function translateSystemOptions(root=document){
  if(window.LifeArchiveI18n?.locale!=='en')return;
  const options=[];
  if(root instanceof HTMLOptionElement)options.push(root);
  if(root.querySelectorAll)options.push(...root.querySelectorAll('option'));
  options.forEach(option=>{
    const original=option.dataset.zhLabel||option.textContent.trim();
    if(!option.dataset.zhLabel)option.dataset.zhLabel=original;
    if(!option.hasAttribute('value'))option.value=original;
    const translated=SYSTEM_OPTION_EN[original];
    if(translated)option.textContent=translated;
  });
}

function loadEnglishEnhancements(done){
  if(window.LifeArchiveI18n?.locale!=='en'){done?.();return}
  if(document.querySelector('script[data-life-archive-i18n-enhancements]')){done?.();return}
  const script=document.createElement('script');
  script.src='./i18n-enhancements.js';
  script.dataset.lifeArchiveI18nEnhancements='1';
  script.addEventListener('load',()=>{window.LifeArchiveI18n?.translate?.(document.body);translateSystemOptions(document);done?.()},{once:true});
  document.body.appendChild(script);
}

function loadI18n(){
  const activate=()=>{
    window.LifeArchiveI18n?.translate?.(document.body);
    translateSystemOptions(document);
    loadEnglishEnhancements(()=>window.LifeArchiveI18n?.translate?.(document.body));
    if(document.documentElement.dataset.i18nOptionWatch==='1')return;
    document.documentElement.dataset.i18nOptionWatch='1';
    const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
      if(node.nodeType===Node.ELEMENT_NODE)translateSystemOptions(node);
    })));
    observer.observe(document.body,{childList:true,subtree:true});
  };
  if(window.LifeArchiveI18n){activate();return}
  const existing=document.querySelector('script[data-life-archive-i18n]');
  if(existing){existing.addEventListener('load',activate,{once:true});return}
  const script=document.createElement('script');
  script.src='./i18n.js';
  script.dataset.lifeArchiveI18n='1';
  script.addEventListener('load',activate,{once:true});
  document.body.appendChild(script);
}

function init(){
  addStyles();
  renamePageHeadings();
  buildSidebar();
  loadI18n();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();