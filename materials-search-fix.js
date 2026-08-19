(()=>{
  let composing=false;
  let pending=null;

  function refocusSearch(value,selectionStart,selectionEnd){
    cancelAnimationFrame(pending);
    pending=requestAnimationFrame(()=>{
      const next=document.getElementById('materialSearch');
      if(!next)return;
      if(next.value!==value)next.value=value;
      try{
        next.focus({preventScroll:true});
        const end=Math.min(selectionEnd??value.length,next.value.length);
        const start=Math.min(selectionStart??end,end);
        next.setSelectionRange(start,end);
      }catch{}
    });
  }

  document.addEventListener('compositionstart',e=>{
    if(e.target?.id==='materialSearch')composing=true;
  },true);

  document.addEventListener('compositionend',e=>{
    if(e.target?.id!=='materialSearch')return;
    composing=false;
    const value=e.target.value;
    refocusSearch(value,value.length,value.length);
  },true);

  document.addEventListener('input',e=>{
    if(e.target?.id!=='materialSearch')return;
    const value=e.target.value;
    const start=e.target.selectionStart;
    const end=e.target.selectionEnd;
    if(composing){
      setTimeout(()=>refocusSearch(value,start,end),0);
      return;
    }
    refocusSearch(value,start,end);
  },true);
})();
