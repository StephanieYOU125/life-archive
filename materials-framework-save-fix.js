(()=>{
  let schema=null;
  import('./material-schema.js')
    .then(module=>{schema=module.LifeArchiveMaterialSchema||module})
    .catch(err=>console.warn('Material Schema v2 unavailable; using compatibility save path',err));

  function applyField(item,field,value){
    if(schema?.setMaterialField)return schema.setMaterialField(item,field,value);

    // Compatibility fallback while the schema module is loading.
    item[field]=value;
    if(['story','story60','content'].includes(field)){
      item.story=value;
      item.story60=value;
      item.content=value;
    }
    if(['research','research15'].includes(field)){
      item.research=value;
      item.research15=value;
    }
    if(['insight','insight25','reflection'].includes(field)){
      item.insight=value;
      item.insight25=value;
      item.reflection=value;
    }
    item.schemaVersion=2;
    return item;
  }

  function saveFrameworkToOfficialState(row,field,value){
    const id=row?.dataset?.materialId;
    if(!id)return false;
    try{
      if(typeof materialState==='undefined' || !Array.isArray(materialState))return false;
      const item=materialState.find(x=>String(x.id)===String(id));
      if(!item)return false;

      applyField(item,field,value);

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
