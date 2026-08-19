const MERGED_STORY_KEY='life-archive-writing-studio-v1';

function readWriting(){
  try{return JSON.parse(localStorage.getItem(MERGED_STORY_KEY)||'{}')||{}}
  catch{return {}}
}

function writeWriting(state){
  localStorage.setItem(MERGED_STORY_KEY,JSON.stringify(state));
}

function uid(){
  return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
}

function organizerData(){
  const get=id=>document.getElementById(id)?.value?.trim()||'';
  return {
    topic:get('organizerTopic'),
    period:get('organizerPeriod'),
    fragments:get('organizerFragments'),
    feelings:get('organizerFeelings'),
    reflection:get('organizerReflection')
  };
}

function organizerToStory(){
  const d=organizerData();
  if(!d.fragments){alert('請先填寫「我記得的片段」。');return}
  const state=readWriting();
  const materials=Array.isArray(state.materials)?state.materials:[];
  const title=d.topic||d.period||'未命名人生故事';
  const content=[
    d.fragments?`【我記得的片段】\n${d.fragments}`:'',
    d.feelings?`【我當時的感受】\n${d.feelings}`:'',
    d.reflection?`【現在回頭看的理解】\n${d.reflection}`:''
  ].filter(Boolean).join('\n\n');
  materials.push({
    id:uid(),
    title,
    content,
    time:d.period||'',
    timePrecision:d.period?'約略時間':'待確認',
    tags:d.topic||'',
    stage:'靈感箱',
    chapterId:'',
    timelineId:'',
    source:'人生故事整理器'
  });
  state.materials=materials;
  writeWriting(state);
  window.LifeArchiveDashboard?.render?.();
  window.dispatchEvent(new Event('storage'));
  const btn=document.getElementById('organizerCreateStory');
  if(btn){const old=btn.textContent;btn.textContent='✓ 已建立故事卡';setTimeout(()=>btn.textContent=old,1200)}
  setTimeout(()=>document.getElementById('materialList')?.scrollIntoView({behavior:'smooth',block:'start'}),150);
}

function addCreateButton(){
  const actions=document.querySelector('#v-story-organizer .organizer-actions');
  if(!actions||document.getElementById('organizerCreateStory'))return;
  const button=document.createElement('button');
  button.type='button';
  button.className='btn';
  button.id='organizerCreateStory';
  button.textContent='＋ 建立故事卡';
  button.addEventListener('click',organizerToStory);
  actions.insertBefore(button,document.getElementById('organizerReset'));
}

function mergeOrganizerIntoMaterials(){
  const organizer=document.getElementById('v-story-organizer');
  const materials=document.getElementById('v-materials');
  if(!organizer||!materials)return;
  if(document.getElementById('mergedStoryOrganizer'))return;

  const wrap=document.createElement('section');
  wrap.id='mergedStoryOrganizer';
  wrap.className='merged-story-organizer';

  const hero=organizer.querySelector('.organizer-hero');
  const layout=organizer.querySelector('.organizer-layout');
  if(hero)wrap.appendChild(hero);
  if(layout)wrap.appendChild(layout);

  const heading=materials.querySelector('.heading');
  if(heading){
    const eyebrow=heading.querySelector('.eyebrow');
    const h1=heading.querySelector('h1');
    const p=heading.querySelector('p');
    if(eyebrow)eyebrow.textContent='LIFE → STORY';
    if(h1)h1.textContent='故事';
    if(p)p.textContent='先整理人生脈絡，再把值得發展的內容建立成故事卡。';
    heading.insertAdjacentElement('afterend',wrap);
  }else{
    materials.prepend(wrap);
  }

  organizer.remove();
  addCreateButton();

  const navButton=document.querySelector('#nav [data-v="story-organizer"]');
  navButton?.remove();
}

function addStyles(){
  if(document.getElementById('storyOrganizerMergeStyles'))return;
  const style=document.createElement('style');
  style.id='storyOrganizerMergeStyles';
  style.textContent=`
    #mergedStoryOrganizer{margin-bottom:22px}
    #mergedStoryOrganizer .organizer-hero{margin-bottom:12px}
    #mergedStoryOrganizer .organizer-hero h1{font-size:28px}
    #mergedStoryOrganizer .organizer-hero p{max-width:900px}
    #v-materials #materialsWorkspace{margin-top:18px;padding-top:18px;border-top:1px solid var(--line)}
    #v-materials #materialsWorkspace::before{content:'故事庫';display:block;font-family:Georgia,"Noto Serif TC",serif;font-size:24px;font-weight:700;margin-bottom:12px;color:var(--ink)}
  `;
  document.head.appendChild(style);
}

function init(){
  addStyles();
  const tryMerge=()=>{mergeOrganizerIntoMaterials();addCreateButton()};
  tryMerge();
  setTimeout(tryMerge,150);
  setTimeout(tryMerge,500);
  const observer=new MutationObserver(tryMerge);
  observer.observe(document.body,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
