(()=>{
  let schema=null;
  let installed=false;

  async function install(){
    if(installed)return;
    try{
      const mod=await import('./material-schema.js');
      schema=mod.LifeArchiveMaterialSchema;
      if(!schema)return;

      // Replace the editor normalizer without rewriting the legacy UI.
      if(typeof normalizeMaterial==='function'){
        const legacyNormalize=normalizeMaterial;
        normalizeMaterial=function(item){
          return schema.normalizeMaterial(legacyNormalize(item));
        };
      }

      // Every local save passes through the canonical schema first.
      if(typeof persist==='function'){
        const legacyPersist=persist;
        persist=function(){
          if(typeof materialState!=='undefined'&&Array.isArray(materialState)){
            materialState=materialState.map(item=>schema.normalizeMaterial(item));
          }
          return legacyPersist();
        };
      }

      // Keep canonical and compatibility aliases synchronized before the
      // editor's own input/change handlers write the field value.
      const syncField=event=>{
        const control=event.target?.closest?.('[data-material-field]');
        if(!control||typeof materialState==='undefined'||!Array.isArray(materialState))return;
        const row=control.closest('[data-material-id]');
        const item=materialState.find(x=>String(x.id)===String(row?.dataset.materialId));
        if(!item)return;
        schema.setMaterialField(item,control.dataset.materialField,control.value);
      };
      document.addEventListener('input',syncField,true);
      document.addEventListener('change',syncField,true);

      installed=true;
      window.LifeArchiveMaterialSchemaBridge={
        version:schema.version,
        normalize:()=>{
          if(typeof materialState==='undefined'||!Array.isArray(materialState))return [];
          materialState=materialState.map(item=>schema.normalizeMaterial(item));
          return materialState;
        }
      };

      // Refresh the editor in memory only. Do not automatically write/migrate
      // user data merely because the page was opened.
      if(typeof materialState!=='undefined'&&Array.isArray(materialState)){
        materialState=materialState.map(item=>schema.normalizeMaterial(item));
      }
      if(typeof renderEditor==='function')requestAnimationFrame(()=>renderEditor());
    }catch(err){
      console.error('Material Schema v2 bridge failed to load',err);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
