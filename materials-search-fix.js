(()=>{
  const STORAGE_KEY='life-archive-writing-studio-v1';
  let composing=false;
  let timer=null;
  let suppressCommittedInput=false;

  function uid(){
    return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
  }

  function readState(){
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}
    catch{return {}}
  }

  function createBlankMaterial(){
    const state=readState();
    const materials=Array.isArray(state.materials)?state.materials:[];
    const item={
      id:uid(),
      title:'',
      content:'',
      time:'',
      timePrecision:'待確認',
      experienceCategory:'其他',
      tags:'',
      stage:'靈感箱',
      chapterId:'',
      timelineId:'',
      evidence:'',
      feelings:'',
      reflection:'',
      source:'手動新增'
    };
    materials.push(item);
    state.materials=materials;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    return item;
  }

  function openNewestMaterial(item){
    const materialsNav=document.querySelector('#nav [data-v="materials"]');
    if(materialsNav)materialsNav.click();
    setTimeout(()=>{
      const row=document.querySelector(`[data-material-id="${CSS.escape(String(item.id))}"]`);
      if(!row)return;
      if(!row.classList.contains('open'))row.querySelector('[data-expand]')?.click();
      setTimeout(()=>{
        const editor=document.querySelector(`[data-material-id="${CSS.escape(String(item.id))}"]`);
        const title=editor?.querySelector('[data-material-field="title"]');
        title?.focus();
        editor?.scrollIntoView({behavior:'smooth',block:'center'});
      },40);
    },90);
  }

  // 新增素材改成直接建立空白素材卡，不再跳出 prompt。
  document.addEventListener('click',event=>{
    const button=event.target?.closest?.('#addMaterial');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const item=createBlankMaterial();
    openNewestMaterial(item);
  },true);

  function timelineItems(){
    try{
      const rows=JSON.parse(localStorage.getItem('life-archive-timeline-v1')||'[]');
      return Array.isArray(rows)?rows:[];
    }catch{return []}
  }

  function applySearch(value){
    const q=String(value||'').trim().toLowerCase();
    let state={};
    try{state=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch{}
    const materials=Array.isArray(state.materials)?state.materials:[];
    const chapters=Array.isArray(state.chapters)?state.chapters:[];
    const timeline=timelineItems();
    const matched=new Set();

    for(const item of materials){
      const chapter=chapters.find(c=>String(c.id)===String(item.chapterId));
      const t=timeline.find(x=>String(x.id)===String(item.timelineId));
      const timelineTitle=t?[t.time,t.identity].filter(Boolean).join(' · '):'';
      const haystack=[
        item.title,item.content,item.evidence,item.feelings,item.reflection,
        item.time,item.tags,item.experienceCategory,item.stage,chapter?.title||'',timelineTitle
      ].join(' ').toLowerCase();
      if(!q||haystack.includes(q))matched.add(String(item.id));
    }

    const list=document.getElementById('materialList');
    if(!list)return;
    list.querySelectorAll('[data-material-id]').forEach(row=>{
      row.hidden=!matched.has(String(row.dataset.materialId||''));
    });

    let empty=list.querySelector('[data-search-empty="1"]');
    const visible=[...list.querySelectorAll('[data-material-id]')].some(row=>!row.hidden);
    if(!visible&&q){
      if(!empty){
        empty=document.createElement('div');
        empty.className='empty';
        empty.dataset.searchEmpty='1';
        empty.textContent='沒有符合條件的素材。';
        list.appendChild(empty);
      }
    }else empty?.remove();
  }

  function schedule(value){
    clearTimeout(timer);
    timer=setTimeout(()=>applySearch(value),120);
  }

  // 中文輸入法組字期間完全不攔截，讓瀏覽器正常完成注音／選字。
  document.addEventListener('compositionstart',event=>{
    if(event.target?.id==='materialSearch')composing=true;
  },true);

  document.addEventListener('compositionend',event=>{
    if(event.target?.id!=='materialSearch')return;
    composing=false;
    suppressCommittedInput=true;
    schedule(event.target.value);
    setTimeout(()=>{suppressCommittedInput=false},80);
  },true);

  document.addEventListener('input',event=>{
    if(event.target?.id!=='materialSearch')return;
    if(composing || event.isComposing)return;
    event.stopImmediatePropagation();
    schedule(event.target.value);
    if(suppressCommittedInput)suppressCommittedInput=false;
  },true);

  document.addEventListener('search',event=>{
    if(event.target?.id!=='materialSearch')return;
    event.stopImmediatePropagation();
    schedule(event.target.value);
  },true);
})();