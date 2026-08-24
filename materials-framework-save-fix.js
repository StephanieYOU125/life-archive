(()=>{
  function saveFrameworkToOfficialState(row,field,value){
    const id=row?.dataset?.materialId;
    if(!id)return false;
    try{
      // materials-editor.js keeps the authoritative in-memory materialState.
      // Update that state directly so its localStorage guard cannot discard
      // 60/15/25 edits made by materials-search-fix.js.
      if(typeof materialState==='undefined' || !Array.isArray(materialState))return false;
      const item=materialState.find(x=>String(x.id)===String(id));
      if(!item)return false;

      item[field]=value;
      if(field==='story60')item.content=value;
      if(field==='insight25')item.reflection=value;

      if(typeof persist==='function')persist();

      const status=row.querySelector('[data-material-save]');
      if(status)status.textContent='✓ 已儲存';
      const saved=document.getElementById('saved');
      if(saved)saved.textContent='已自動儲存在本機';
      return true;
    }catch(err){
      console.error('Framework official-state save failed',err);
      return false;
    }
  }

  document.addEventListener('input',event=>{
    const fieldEl=event.target?.closest?.('[data-framework-field]');
    if(!fieldEl)return;
    const row=fieldEl.closest('[data-material-id]');
    if(!row)return;
    saveFrameworkToOfficialState(row,fieldEl.dataset.frameworkField,fieldEl.value);
  },true);

  document.addEventListener('change',event=>{
    const fieldEl=event.target?.closest?.('[data-framework-field]');
    if(!fieldEl)return;
    const row=fieldEl.closest('[data-material-id]');
    if(!row)return;
    saveFrameworkToOfficialState(row,fieldEl.dataset.frameworkField,fieldEl.value);
  },true);

  window.LifeArchiveMaterialsFrameworkFix={
    save:(id,field,value)=>{
      const escaped=globalThis.CSS?.escape?CSS.escape(String(id)):String(id).replace(/["\\]/g,'\\$&');
      const row=document.querySelector(`[data-material-id="${escaped}"]`);
      return saveFrameworkToOfficialState(row,field,value);
    }
  };
})();
