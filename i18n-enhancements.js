(()=>{
  const base=window.LifeArchiveI18n;
  if(!base||base.locale!=='en')return;
  if(window.__lifeArchiveEnglishEnhancementsLoaded)return;
  window.__lifeArchiveEnglishEnhancementsLoaded=true;

  const POLISH={
    'Save your life first. Turn it into a book over time.':'Capture your life first. Shape it into a book, one story at a time.',
    'Organize drafts, plan chapters, build story cards, write the manuscript, or recover memories directly from old photos.':'Collect notes, shape chapters, build a story library, and draft your manuscript. You can also use old photos to recover moments you might otherwise forget.',
    'Material Library':'Story Library',
    'Material Triage':'Story Extractor',
    'Draft Triage':'Story Extractor',
    'Book Positioning':'Book Direction',
    'References & Perspectives':'References & Insights',
    'Revision Check':'Revision Studio',
    'Story materials':'Story Ideas',
    '05 · Preserve':'05 · Save & Backup',
    '◇ Material Library':'◇ Story Library',
    '▦ Material Triage':'▦ Story Extractor',
    '◎ Book Positioning':'◎ Book Direction',
    '❝ References':'❝ References & Insights',
    '⚑ Revision':'⚑ Revision Studio',
    'Organize Drafts':'Extract Story Ideas',
    'Turn Entire Draft into Material':'Save as Story Idea',
    'Complete Writing Studio Backup':'Full Studio Backup',
    'Raw Text':'Source Text'
  };

  function polishText(text){
    const raw=String(text??'');
    const trimmed=raw.trim();
    const translated=POLISH[trimmed];
    if(!translated)return raw;
    const lead=raw.match(/^\s*/)?.[0]||'';
    const tail=raw.match(/\s*$/)?.[0]||'';
    return lead+translated+tail;
  }

  const originalT=base.t.bind(base);
  base.t=(text)=>polishText(originalT(text));

  const originalTranslate=base.translate.bind(base);
  function polish(root=document.body){
    if(!root)return;
    originalTranslate(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      const parent=node.parentElement;
      if(!parent||parent.closest('script,style,textarea,code,pre,[contenteditable="true"]'))continue;
      const next=polishText(node.nodeValue);
      if(next!==node.nodeValue)node.nodeValue=next;
    }
    document.documentElement.lang='en';
    document.documentElement.dataset.locale='en';
    document.title='Life Archive | Private Writing Studio';
  }

  base.translate=polish;
  window.LifeArchiveI18n=base;

  const style=document.createElement('style');
  style.id='lifeArchiveEnglishPolish';
  style.textContent='html[data-locale="en"] body{font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif} html[data-locale="en"] .hero h1,html[data-locale="en"] .heading h1{letter-spacing:-.025em}';
  document.head.appendChild(style);

  polish(document.body);
  const observer=new MutationObserver(records=>{
    records.forEach(record=>record.addedNodes.forEach(node=>{
      if(node.nodeType===Node.TEXT_NODE){
        const parent=node.parentElement;
        if(!parent||parent.closest('script,style,textarea,code,pre,[contenteditable="true"]'))return;
        const next=polishText(node.nodeValue);
        if(next!==node.nodeValue)node.nodeValue=next;
      }else if(node.nodeType===Node.ELEMENT_NODE){
        polish(node);
      }
    }));
  });
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});
})();