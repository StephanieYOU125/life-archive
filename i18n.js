(()=>{
  const KEY='life-archive-language-v1';
  const params=new URLSearchParams(location.search);
  const requested=params.get('lang');
  const locale=requested==='en'?'en':requested==='zh'?'zh':(localStorage.getItem(KEY)==='en'?'en':'zh');
  localStorage.setItem(KEY,locale);

  const ZH_TO_EN={
    '私人書稿工作室':'Private Writing Studio',
    '文字儲存在目前瀏覽器；照片回憶使用 IndexedDB。私人照片不會放進 GitHub。請定期下載備份。':'Text is stored in this browser. Photo memories use IndexedDB. Private photos are not uploaded to GitHub. Please back up regularly.',
    '從哪裡開始':'Start Here','今日工作台':'Today’s Workspace','已自動儲存在本機':'Saved locally automatically','備份':'Backup',
    '先保存人生，再慢慢把它寫成一本書。':'Save your life first. Turn it into a book over time.',
    '你可以整理初稿、安排章節、建立故事卡、寫正文，也可以直接從舊照片找回當時發生的事情。':'Organize drafts, plan chapters, build story cards, write the manuscript, or recover memories directly from old photos.',
    '開始整理初稿':'Organize Drafts','打開照片回憶':'Open Photo Memories','書稿':'Manuscript','原始文字字元':'Raw text characters','章節':'Chapters','目前章節':'Current chapters','素材':'Materials','故事素材':'Story materials',
    '先分流，再修改':'SORT FIRST, REVISE LATER','文字拆解台':'Draft Triage','素材整理台':'Material Triage','把舊稿、筆記或一大段文字拆成可以重複使用的故事素材。':'Break old drafts, notes, or long passages into reusable story materials.',
    '整理舊文字或人生經歷，再把有價值的內容送進素材庫。':'Organize old writing or life experiences, then move useful parts into the material library.',
    '待整理初稿':'Draft to organize','把舊稿、筆記、想到的內容貼在這裡……':'Paste old drafts, notes, or ideas here…','儲存初稿':'Save Draft','整段建立為素材':'Turn Entire Draft into Material',
    '章節地圖':'Chapter Map','先決定每章要回答什麼問題，不必急著把所有人生經歷塞進去。':'Decide what question each chapter should answer. You do not need to fit every life experience into the book.',
    '＋ 新增章節':'+ Add Chapter','故事工作台':'Story Workspace','把素材依「靈感箱 → 發展中 → 可寫作 → 已放入章節」推進。':'Move materials through “Idea Box → Developing → Ready to Write → Added to Chapter.”',
    '照片回憶':'Photo Memories','從照片找回當時發生的事情。照片只保存在這台裝置的瀏覽器，不會上傳到 GitHub。':'Use photos to recover what happened then. Photos stay in this device’s browser and are not uploaded to GitHub.',
    '匯出照片 JSON':'Export Photo JSON','本機照片模式':'Local Photo Mode','程式碼在 GitHub；私人照片存在瀏覽器 IndexedDB。換裝置或清除瀏覽器網站資料前，請先匯出照片 JSON 備份。':'Code is on GitHub; private photos are stored in browser IndexedDB. Export a photo JSON backup before changing devices or clearing browser data.',
    '＋ 新增回憶':'+ Add Memory','可以從電腦或手機選照片，也可以先建立一筆純文字回憶。':'Choose photos from your computer or phone, or create a text-only memory first.','📷 拍照':'📷 Take Photo','🖼 從相簿選擇':'🖼 Choose from Photos','✎ 純文字回憶':'✎ Text-only Memory',
    '章節編輯器':'Chapter Editor','章名':'Chapter title','這章要回答的問題':'Question this chapter should answer','寫作提示':'Writing Tip','先寫一個看得見的場景，再寫當時的想法。不要急著替過去的自己下結論。':'Start with a visible scene, then write what you thought at the time. Do not rush to judge your past self.','從照片找故事':'Find a Story from Photos','正文':'Manuscript','從一個場景開始……':'Start from a scene…',
    '素材庫':'Material Library','還不知道放哪一章的故事，先留在這裡。':'Keep stories here until you know which chapter they belong in.','＋ 新增素材':'+ Add Material',
    '引用與借鏡':'References & Perspectives','保存可能與你的故事形成對話的觀點；正式寫入前再確認來源與脈絡。':'Save ideas that may enter into dialogue with your story; verify the source and context before using them in the manuscript.','＋ 新增來源':'+ Add Source',
    '修稿檢查':'Revision Check','修稿工作室':'Revision Studio','這裡只做簡單提示，不替你判斷文章好壞。':'This provides simple prompts without judging whether your writing is good or bad.','重新檢查':'Check Again',
    '全書定位':'Book Positioning','當故事很多時，用這裡提醒自己：這本書真正想留下什麼？':'When you have many stories, use this space to remember what the book truly wants to leave behind.','暫定書名':'Working title','這本書最核心的一句話':'The book’s core sentence','希望讀者讀完得到什麼？':'What should readers take away?',
    '原始文字':'Raw Text','保留未整理的完整文字。修改會自動存在目前瀏覽器。':'Keep the complete unorganized text here. Changes are saved automatically in this browser.','貼上完整原始書稿……':'Paste the complete raw manuscript…',
    '備份與匯出':'Backup & Export','網站資料存在瀏覽器，不等於雲端同步。請定期備份。':'Website data stored in the browser is not the same as cloud sync. Back up regularly.','完整文字工作室備份':'Complete Writing Studio Backup','包含章節、正文、素材、引用與全書定位。照片回憶可直接在「照片回憶」頁籤匯出 JSON。':'Includes chapters, manuscript, materials, references, and book positioning. Photo memories can be exported as JSON from the Photo Memories tab.','下載 JSON':'Download JSON','匯入 JSON':'Import JSON','匯出書稿 TXT':'Export Manuscript TXT',
    '⌂ 今日工作台':'⌂ Today’s Workspace','◷ 人生時間軸':'◷ Life Timeline','▧ 照片回憶':'▧ Photo Memories','≡ 原始文字':'≡ Raw Text','◇ 素材庫':'◇ Material Library','▦ 素材整理台':'▦ Material Triage','✦ 故事工作台':'✦ Story Workspace','◎ 全書定位':'◎ Book Positioning','☷ 章節地圖':'☷ Chapter Map','✎ 章節編輯器':'✎ Chapter Editor','❝ 引用與借鏡':'❝ References','⚑ 修稿檢查':'⚑ Revision','⇩ 備份與匯出':'⇩ Backup & Export',
    '01 · 整理人生':'01 · Organize Life','02 · 建立素材':'02 · Build Materials','03 · 設計一本書':'03 · Design the Book','04 · 開始寫作':'04 · Start Writing','05 · 保存':'05 · Preserve',
    '今天，從哪裡繼續？':'Where would you like to continue today?','不需要每天重新規劃人生。回到一段還沒寫完的故事，或換一種方式整理它，就已經是在往前走。':'You do not need to redesign your life every day. Returning to an unfinished story—or organizing it in a different way—is already progress.',
    '接著寫':'Continue Writing','回到上次停下來的地方，不需要重新找方向。':'Return to where you stopped last time. You do not need to find your direction again.','如果今天不想接著寫':'If You Don’t Want to Keep Writing Today','也可以換一種工作，不需要每次都推正文。':'Switch to a different kind of work. You do not have to advance the manuscript every time.',
    '我想記住一段人生':'I want to remember part of my life','有日期、有照片，或只是突然想到一件往事。先保存，不必判斷它是否值得寫進書。':'A date, a photo, or a memory that suddenly came back. Save it first; do not decide yet whether it belongs in the book.',
    '人生時間軸 →':'Life Timeline →','照片回憶 →':'Photo Memories →','我有一個故事，但不知道放哪裡':'I have a story but don’t know where it belongs','先收進素材庫。它可以只是事件、畫面或一句還說不清楚的想法。':'Put it in the material library first. It can be an event, an image, or an idea you cannot yet fully explain.','＋ 新增素材':'+ Add Material','故事工作台 →':'Story Workspace →',
    '我想整理這本書到底要說什麼':'I want to clarify what this book is really saying','故事很多時，不要急著全寫。先找全書核心，再安排章節要回答的問題。':'When there are many stories, do not rush to write them all. Find the book’s core first, then decide what each chapter should answer.','全書定位 →':'Book Positioning →','章節地圖 →':'Chapter Map →',
    '我想換成編輯模式':'I want to switch to editing mode','不一定要增加新內容，也可以補畫面、查引用，或讀一次故事缺口。':'You do not need to add new content. You can strengthen scenes, check references, or review gaps in the story.','引用與借鏡 →':'References →','修稿工作室 →':'Revision Studio →',
    '另一個值得處理的地方':'Another Useful Place to Work On','和「接著寫」分開，這裡只提示一個旁支工作。':'Separate from “Continue Writing,” this suggests just one side task.','你現在的位置':'Where You Are Now','不是完成度評分，只是讓你看見資料正在從「人生」慢慢走向「一本書」。':'This is not a completion score. It simply shows how your life material is gradually becoming a book.',
    '人生時間軸':'Life Timeline','把「發生了什麼」和「最後得到什麼」放在一起。已確認的可以拿去寫履歷或面試；待確認與有矛盾的項目則留給自己補證據。':'Put “what happened” and “what came from it” together. Confirmed items can support resumes or interviews; uncertain or conflicting items can stay here until you add evidence.','全部事件':'All Events','已確認':'Confirmed','部分確認':'Partly Confirmed','待確認／有矛盾':'Needs Review / Conflict','搜尋時間、經歷、能力、成果……':'Search time, experience, skills, outcomes…','時間：早 → 晚':'Time: Oldest → Newest','時間：晚 → 早':'Time: Newest → Oldest','＋ 新增事件':'+ Add Event','匯出 JSON':'Export JSON','✓ 已儲存':'✓ Saved',
    '序號':'No.','經歷分類':'Experience Category','時間':'Time','身分／經歷':'Role / Experience','履歷／面試可以怎麼用':'How to Use in Resume / Interview','成果／能力':'Outcome / Skill','確認狀態':'Verification Status','故事':'Story','＋ 故事素材':'+ Story Material','刪除':'Delete',
    '搜尋素材、經歷分類、證據、感受、理解、標籤、時間……':'Search materials, categories, evidence, feelings, reflections, tags, time…','全部':'All','時間 ↑（早 → 晚）':'Time ↑ (Old → New)','時間 ↓（晚 → 早）':'Time ↓ (New → Old)','依狀態':'By Status','依標題':'By Title','▤ 精簡':'▤ Compact','▦ 卡片':'▦ Cards','尚無標籤':'No tags','時間待補':'Time needed','未命名素材':'Untitled material','未標籤':'No tags','時間精度':'Time Precision','寫作狀態':'Writing Status','所屬篇章':'Chapter','來源時間軸':'Source Timeline','素材標題':'Material Title','機師特質標籤':'Pilot-trait Tags','請從機師特質中選擇':'Choose from pilot traits','素材內容／事件':'Material / Event','發生了什麼？先保留具體事件、場景與事實。':'What happened? Keep concrete events, scenes, and facts first.','證據／佐證':'Evidence','當時感受':'Feelings Then','現在理解':'Understanding Now','來源：':'Source: ','儲存中…':'Saving…','沒有符合條件的素材。':'No matching materials.',
    '核心定位':'Core Positioning','讀者與問題':'Readers & Problems','作者定位':'Author Positioning','全書結構':'Book Structure','先回答：這是一本什麼書？為什麼值得讀？':'First answer: What kind of book is this, and why is it worth reading?','界定你正在對誰說話，以及這本書真正想解決什麼困惑。':'Define who you are speaking to and what confusion this book is truly trying to resolve.','不是履歷堆疊，而是回答：為什麼這個題目由你來寫？':'Not a pile of credentials, but an answer to: Why are you the person to write this?','把核心主張落到章節與閱讀順序。':'Turn the core argument into chapters and reading order.','尚未設定書名':'Book title not set','先寫下一句：這本書想陪讀者走到哪裡？':'Write one sentence first: Where does this book want to take the reader?','已填寫':'completed','匯入全書定位':'Import Book Positioning','匯出全書定位':'Export Book Positioning',
    '作者介紹':'Author Introduction','一、書名':'1. Title','二、副標題':'2. Subtitle','三、書籍類型':'3. Genre','四、核心概念':'4. Core Concept','五、一句話介紹':'5. One-line Description','六、書籍主張':'6. Book Claims','七、目標讀者':'7. Target Readers','八、讀者痛點':'8. Reader Pain Points','九、內容特色':'9. Content Features','十、作者背景與寫作優勢':'10. Author Background & Writing Strengths','十一、全書架構':'11. Book Structure','出版企劃大綱':'Publishing Proposal Outline','每一格都可以直接編輯，輸入後會自動儲存。':'Each field can be edited directly and is saved automatically.','在這裡輸入內容……':'Enter content here…',
    '正在修哪一章？':'Which chapter are you revising?','重新讀這一章':'Review This Chapter','回章節編輯器':'Back to Chapter Editor','一次只修 1–2 件事':'Revise only 1–2 things at a time','不是 7 項都要滿分':'Not all 7 items need to be perfect','具體細節比形容詞更有畫面':'Concrete details create stronger scenes than adjectives',
    '章名工作台':'Chapter Title Lab','展開':'Expand','收起':'Collapse','這章真正要回答的問題':'The question this chapter truly answers','從照片找畫面':'Find Scenes from Photos','從素材找故事':'Find Stories from Materials','加入引用與借鏡':'Add References','去修稿工作室':'Go to Revision Studio'
  };

  const REGEX_RULES=[
    [/^(\d+) 筆時間軸$/,(_,n)=>`${n} timeline items`],
    [/^(\d+) 筆素材$/,(_,n)=>`${n} materials`],
    [/^(\d+) 個章節$/,(_,n)=>`${n} chapters`],
    [/^(\d+) 章已有正文$/,(_,n)=>`${n} chapters drafted`],
    [/^(\d+) 筆借鏡$/,(_,n)=>`${n} references`],
    [/^第 (\d+) 章$/,(_,n)=>`Chapter ${n}`],
    [/^(\d+) 字正文$/,(_,n)=>`${n} manuscript characters`],
    [/^(\d+) 字 · (\d+) 段$/,(_,a,b)=>`${a} characters · ${b} paragraphs`],
    [/^已連結 (\d+) 筆$/,(_,n)=>`${n} linked`],
    [/^(\d+) \/ (\d+) 已填寫$/,(_,a,b)=>`${a} / ${b} completed`]
  ];

  function translateText(text){
    if(locale!=='en')return text;
    const raw=String(text);
    const trimmed=raw.trim();
    if(!trimmed)return raw;
    let translated=ZH_TO_EN[trimmed];
    if(!translated){
      for(const [re,fn] of REGEX_RULES){if(re.test(trimmed)){translated=trimmed.replace(re,fn);break}}
    }
    if(!translated)return raw;
    const start=raw.match(/^\s*/)?.[0]||'';
    const end=raw.match(/\s*$/)?.[0]||'';
    return start+translated+end;
  }

  function shouldSkipTextNode(node){
    const p=node.parentElement;
    if(!p)return true;
    return !!p.closest('script,style,textarea,option,[contenteditable="true"],code,pre');
  }

  function translateElement(el){
    if(locale!=='en'||!(el instanceof Element))return;
    if(el.matches('input[placeholder],textarea[placeholder]')){
      const v=el.getAttribute('placeholder');
      const next=translateText(v);
      if(next!==v)el.setAttribute('placeholder',next);
    }
    if(el.hasAttribute('title')){
      const v=el.getAttribute('title');
      const next=translateText(v);
      if(next!==v)el.setAttribute('title',next);
    }
  }

  function translateSubtree(root=document.body){
    if(locale!=='en'||!root)return;
    if(root instanceof Element)translateElement(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      if(shouldSkipTextNode(node))continue;
      const next=translateText(node.nodeValue);
      if(next!==node.nodeValue)node.nodeValue=next;
    }
    if(root.querySelectorAll)root.querySelectorAll('input[placeholder],textarea[placeholder],[title]').forEach(translateElement);
    document.documentElement.lang='en';
    document.title='Life Archive | Private Writing Studio';
  }

  function mountSwitcher(){
    if(document.getElementById('languageSwitcher'))return;
    const header=document.querySelector('.top');
    if(!header)return;
    const wrap=document.createElement('div');
    wrap.id='languageSwitcher';
    wrap.style.cssText='display:flex;gap:6px;align-items:center;margin-left:auto;margin-right:8px';
    const zh=document.createElement('button');
    const en=document.createElement('button');
    zh.type=en.type='button';zh.className=en.className='btn';
    zh.textContent='中文';en.textContent='EN';
    [zh,en].forEach(b=>b.style.cssText='padding:7px 9px;font-size:11px');
    (locale==='en'?en:zh).style.cssText+=';background:var(--side);color:#fff;border-color:var(--side)';
    function change(next){
      localStorage.setItem(KEY,next);
      const url=new URL(location.href);
      if(next==='en')url.searchParams.set('lang','en'); else url.searchParams.delete('lang');
      location.href=url.toString();
    }
    zh.onclick=()=>change('zh');en.onclick=()=>change('en');
    wrap.append(zh,en);
    const backup=document.getElementById('backupTop');
    header.insertBefore(wrap,backup||null);
  }

  function init(){
    mountSwitcher();
    translateSubtree(document.body);
    if(locale==='en'){
      const observer=new MutationObserver(records=>{
        for(const record of records){
          record.addedNodes.forEach(node=>{
            if(node.nodeType===Node.TEXT_NODE){if(!shouldSkipTextNode(node))node.nodeValue=translateText(node.nodeValue)}
            else if(node.nodeType===Node.ELEMENT_NODE)translateSubtree(node);
          });
        }
      });
      observer.observe(document.body,{childList:true,subtree:true});
    }
  }

  window.LifeArchiveI18n={locale,t:translateText,translate:translateSubtree};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
