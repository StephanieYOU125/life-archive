(()=>{
  const base=window.LifeArchiveI18n;
  if(!base||base.locale!=='en')return;
  if(window.__lifeArchiveEnglishEnhancementsLoaded)return;
  window.__lifeArchiveEnglishEnhancementsLoaded=true;

  const POLISH={
    'Save your life first. Turn it into a book over time.':'Capture your life first. Shape it into a book, one story at a time.',
    'Organize drafts, plan chapters, build story cards, write the manuscript, or recover memories directly from old photos.':'Collect notes, shape chapters, build a story library, and draft your manuscript. You can also use old photos to recover moments you might otherwise forget.',
    'Material Library':'Story Library','Material Triage':'Story Extractor','Draft Triage':'Story Extractor','Book Positioning':'Book Direction','References & Perspectives':'References & Insights','Revision Check':'Revision Studio','Story materials':'Story Ideas','05 · Preserve':'05 · Save & Backup','◇ Material Library':'◇ Story Library','▦ Material Triage':'▦ Story Extractor','◎ Book Positioning':'◎ Book Direction','❝ References':'❝ References & Insights','⚑ Revision':'⚑ Revision Studio','Organize Drafts':'Extract Story Ideas','Turn Entire Draft into Material':'Save as Story Idea','Complete Writing Studio Backup':'Full Studio Backup','Raw Text':'Source Text',

    // Text Memories
    '純文字回憶':'Text Memories','▧ 純文字回憶':'▧ Text Memories','✎ 純文字回憶':'✎ Text Memory',
    '照片不存進 Life Archive。你只需要記下照片放在哪裡、照片編號／檔名，以及當時發生的事情。這些文字資料可以同步到 Firestore。':'Photos stay outside Life Archive. Record where each photo is stored, its file name or ID, and what happened at the time. These text records can sync to Firestore.',
    '照片留在原本位置 · Life Archive 保存索引與故事':'Photos stay where they are · Life Archive keeps the index and story',
    '建議做法：':'Recommended setup:',
    '照片本體放在 iCloud Photos、Google Photos、外接硬碟或電腦資料夾；Life Archive 只記錄「存放位置＋照片編號／檔名」。例如：':'Keep the original photos in iCloud Photos, Google Photos, an external drive, or a computer folder. Life Archive only stores the location plus the photo ID or filename. For example:',
    'Google Photos／2025 日本交換':'Google Photos / 2025 Japan Exchange',
    '＋ 新增純文字回憶':'+ Add Text Memory','☁ 立即同步':'☁ Sync Now','↓ 從雲端載入':'↓ Load from Cloud','本機儲存中':'Stored locally',
    '替這段回憶取名字':'Name this memory','時間':'Time','人生階段':'Life Stage','地點':'Place',
    '照片索引（照片本體不會上傳）':'Photo Reference (the photo itself is not uploaded)','照片存放在哪裡':'Photo Location','照片編號／檔名':'Photo ID / Filename',
    '重要人物':'People','關聯章節':'Linked Chapters','我記得發生了什麼':'What I Remember Happened','我當時的感受':'How I Felt Then','現在回頭看的理解':'What I Understand Now',
    '✓ 已儲存在本機':'✓ Saved locally','目前還沒有純文字回憶。按「＋ 新增純文字回憶」開始。':'No text memories yet. Select “+ Add Text Memory” to create your first one.',
    '☁ 已同步到雲端':'☁ Synced to cloud','雲端同步失敗':'Cloud sync failed','☁ 已同步刪除':'☁ Deletion synced','雲端刪除失敗':'Cloud deletion failed','請先使用右上角 Google 登入':'Sign in with Google in the top-right first','正在同步…':'Syncing…','同步失敗':'Sync failed','正在從雲端讀取…':'Loading from cloud…','雲端目前沒有純文字回憶':'No text memories in the cloud yet','已取消載入':'Load canceled','雲端讀取失敗':'Cloud load failed','☁ 已登入，可自動同步':'☁ Signed in · Auto-sync enabled','☁ 已登入；按「立即同步」啟用':'☁ Signed in · Select “Sync Now” to enable cloud sync','尚未登入；目前只儲存在本機':'Not signed in · Stored on this device only',
    '國小':'Elementary School','國中':'Junior High School','高中':'Senior High School','大學':'University','研究所':'Graduate School','工作':'Work','旅行':'Travel','交換':'Exchange','運動':'Sports','娛樂':'Leisure','挑戰':'Challenge','其他':'Other'
  };

  const PLACEHOLDERS={
    '替這段回憶取名字':'Name this memory',
    '例：2025/07、約2018夏天':'e.g. 2025/07, around summer 2018',
    '例：Google Photos／2025 日本交換；外接硬碟 A／France':'e.g. Google Photos / 2025 Japan Exchange; External Drive A / France',
    '例：IMG_4821.JPG、DSC_1038':'e.g. IMG_4821.JPG, DSC_1038',
    '照片裡或故事中的人物':'People in the photo or story',
    '可先留白':'Optional',
    '只記你確定記得的事件、場景、對話。':'Record only events, scenes, and dialogue you are confident you remember.',
    '當時的感受，不用用現在的理解解釋。':'How you felt then, without interpreting it from today’s perspective.',
    '現在怎麼理解這件事？':'How do you understand this now?'
  };

  function dynamicText(trimmed){
    let m=trimmed.match(/^☁ 已同步 (\d+) 筆純文字回憶$/);
    if(m)return `☁ Synced ${m[1]} text ${m[1]==='1'?'memory':'memories'}`;
    m=trimmed.match(/^☁ 已載入 (\d+) 筆$/);
    if(m)return `☁ Loaded ${m[1]} ${m[1]==='1'?'item':'items'}`;
    return null;
  }

  function polishText(text){
    const raw=String(text??'');
    const trimmed=raw.trim();
    const translated=POLISH[trimmed]||dynamicText(trimmed);
    if(!translated)return raw;
    const lead=raw.match(/^\s*/)?.[0]||'';
    const tail=raw.match(/\s*$/)?.[0]||'';
    return lead+translated+tail;
  }

  const originalT=base.t.bind(base);
  base.t=(text)=>polishText(originalT(text));

  function translateOption(option){
    if(!(option instanceof HTMLOptionElement))return;
    const original=option.dataset.lifeArchiveZhOption||option.textContent.trim();
    if(!option.dataset.lifeArchiveZhOption){
      option.dataset.lifeArchiveZhOption=original;
      if(!option.hasAttribute('value'))option.value=original;
    }
    const translated=polishText(original);
    if(translated!==original)option.textContent=translated;
  }

  function translateAttrs(el){
    if(!(el instanceof Element))return;
    if(el.hasAttribute('placeholder')){
      const original=el.dataset.lifeArchiveZhPlaceholder||el.getAttribute('placeholder')||'';
      if(!el.dataset.lifeArchiveZhPlaceholder)el.dataset.lifeArchiveZhPlaceholder=original;
      const translated=PLACEHOLDERS[original]||polishText(original);
      if(translated!==original)el.setAttribute('placeholder',translated);
    }
    if(el instanceof HTMLOptionElement)translateOption(el);
  }

  const originalTranslate=base.translate.bind(base);
  function polish(root=document.body){
    if(!root)return;
    originalTranslate(root);
    if(root instanceof Element)translateAttrs(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      const parent=node.parentElement;
      if(!parent||parent.closest('script,style,textarea,code,pre,[contenteditable="true"]'))continue;
      const next=polishText(node.nodeValue);
      if(next!==node.nodeValue)node.nodeValue=next;
    }
    root.querySelectorAll?.('input[placeholder],textarea[placeholder],option').forEach(translateAttrs);
    document.documentElement.lang='en';
    document.documentElement.dataset.locale='en';
    document.title='Life Archive | Private Writing Studio';
  }

  base.translate=polish;
  window.LifeArchiveI18n=base;

  const nativeConfirm=window.confirm?.bind(window);
  if(nativeConfirm){
    window.confirm=(message)=>{
      const raw=String(message??'');
      if(raw==='刪除這筆純文字回憶？')return nativeConfirm('Delete this text memory?');
      const cloud=raw.match(/^從雲端載入 (\d+) 筆純文字回憶？\n\n同 ID 的本機資料會以雲端內容更新，本機獨有資料會保留。$/);
      if(cloud)return nativeConfirm(`Load ${cloud[1]} text ${cloud[1]==='1'?'memory':'memories'} from the cloud?\n\nCloud data will update local records with the same ID. Local-only records will be kept.`);
      return nativeConfirm(polishText(raw));
    };
  }

  const style=document.createElement('style');
  style.id='lifeArchiveEnglishPolish';
  style.textContent='html[data-locale="en"] body{font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif} html[data-locale="en"] .hero h1,html[data-locale="en"] .heading h1,html[data-locale="en"] .tm-hero h1{letter-spacing:-.025em}';
  document.head.appendChild(style);

  polish(document.body);
  //const observer=new MutationObserver(records=>{
   // records.forEach(record=>record.addedNodes.forEach(node=>{
  //    if(node.nodeType===Node.TEXT_NODE){
  //      const parent=node.parentElement;
  //      if(!parent||parent.closest('script,style,textarea,code,pre,[contenteditable="true"]'))return;
 //       const next=polishText(node.nodeValue);
 //       if(next!==node.nodeValue)node.nodeValue=next;
 //     }else if(node.nodeType===Node.ELEMENT_NODE){
 //       polish(node);
 //     }
 //   }));
 // });
 // if(document.body)observer.observe(document.body,{childList:true,subtree:true});
//})();
