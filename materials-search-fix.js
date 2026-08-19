(()=>{
  const STORAGE_KEY='life-archive-writing-studio-v1';
  let composing=false;
  let timer=null;

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
        item.time,item.tags,item.stage,chapter?.title||'',timelineTitle
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

  document.addEventListener('compositionstart',event=>{
    if(event.target?.id==='materialSearch')composing=true;
  },true);

  document.addEventListener('compositionend',event=>{
    if(event.target?.id!=='materialSearch')return;
    composing=false;
    event.stopImmediatePropagation();
    schedule(event.target.value);
  },true);

  document.addEventListener('input',event=>{
    if(event.target?.id!=='materialSearch')return;
    event.stopImmediatePropagation();
    if(!composing)schedule(event.target.value);
  },true);

  document.addEventListener('search',event=>{
    if(event.target?.id!=='materialSearch')return;
    event.stopImmediatePropagation();
    schedule(event.target.value);
  },true);

  new MutationObserver(()=>{
    const input=document.getElementById('materialSearch');
    if(input&&input.value)applySearch(input.value);
  }).observe(document.documentElement,{childList:true,subtree:true});
})();
