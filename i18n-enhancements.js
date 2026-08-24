(()=>{
  const base=window.LifeArchiveI18n;
  if(!base||base.locale!=='en')return;

  const ZH={
    // Core product language
    '私人書稿工作室':'Private Writing Studio',
    '先保存人生，再慢慢把它寫成一本書。':'Capture your life first. Shape it into a book, one story at a time.',
    '你可以整理初稿、安排章節、建立故事卡、寫正文，也可以直接從舊照片找回當時發生的事情。':'Collect notes, shape chapters, build a story library, and draft your manuscript. You can also use old photos to recover moments you might otherwise forget.',
    '素材庫':'Story Library','素材整理台':'Story Extractor','引用與借鏡':'References & Insights','全書定位':'Book Direction','修稿檢查':'Revision Studio',
    '故事素材':'Story Ideas','完整文字工作室備份':'Full Studio Backup','待整理初稿':'Source Text','整段建立為素材':'Save as Story Idea',
    '開始整理初稿':'Extract Story Ideas','打開照片回憶':'Browse Photo Memories','從照片找故事':'Browse Photo Memories','重新檢查':'Review Again',

    // Dashboard
    '上次停在這一章':'Last open chapter','這章正在回答':'This chapter is exploring','上次停在這裡':'Last line','回到這一章':'Continue Chapter','開始這一章':'Start Chapter',
    '目前還沒有正在寫的章節':'No active chapter yet','不用急著從正文開始。':'You do not have to start with the manuscript.','可以先保存人生、累積素材，或建立第一個章節骨架。':'Capture a memory, collect story ideas, or sketch your first chapter before you start drafting.','前往章節地圖':'Open Chapter Map',
    '先把舊稿拆成可使用的素材':'Turn old drafts into story ideas','先不要急著增加更多素材':'Pause collecting and find the book’s direction','把方向變成章節骨架':'Turn your direction into a chapter map','挑一章，先寫出第一版':'Choose one chapter and draft a first version','替這一章留下一個真正的問題':'Give this chapter a real question','先不要急著再加字，讀一次缺口':'Pause drafting and review the gaps','下一段先補一個看得見的畫面':'Add one concrete scene next','把回憶變成可以使用的故事素材':'Turn a memory into a usable story idea','先保存一段人生，不必先想書':'Capture one moment. Do not think about the book yet.',
    '前往文字拆解台':'Open Story Extractor','前往全書定位':'Open Book Direction','建立章節地圖':'Build Chapter Map','開始章節正文':'Start Drafting','整理核心問題':'Refine the Core Question','去修稿工作室':'Open Revision Studio','回章節補畫面':'Add a Scene','打開素材庫':'Open Story Library','打開人生時間軸':'Open Life Timeline',
    '還沒有資料也沒關係，從一段回憶開始':'No data yet—that is fine. Start with one memory.','還沒有素材':'No story ideas yet','全書定位已開始':'Book direction started','尚未整理全書方向':'Book direction not started','先有章節骨架，再開始寫':'Build a chapter map before drafting','已設定雲端同步；仍建議定期匯出備份':'Cloud sync is enabled; regular exports are still recommended.','文字會自動儲存在本機；建議定期匯出備份':'Text is saved locally automatically. Export a backup regularly.','已開始':'Started','尚未開始':'Not started','進行中':'In progress','已設定':'Enabled','可隨時備份':'Back up anytime',

    // Timeline
    '把「發生了什麼」和「最後得到什麼」放在一起。已確認的可以拿去寫履歷或面試；待確認與有矛盾的項目則留給自己補證據。':'Keep what happened, what came from it, and how well it is verified in one place. Confirmed entries can support resumes or interviews; uncertain entries stay here until you add evidence.',
    '待確認／有矛盾':'Needs Review','新增的空白事件會暫時留在最上方；填完時間並離開欄位後，會自動移到正確位置。支援 2019、2019-10、2019/10/03、2019年10月、民國108年等格式。':'New blank entries stay at the top temporarily. After you enter a date and leave the field, the entry moves into chronological order automatically.',
    '履歷／面試':'Resume / Interview','待補資料／矛盾說明':'Missing evidence / conflict note','沒有符合條件的事件。':'No matching timeline entries.','刪除這筆時間軸事件？':'Delete this timeline entry?',

    // Story library / materials
    '搜尋素材、經歷分類、證據、感受、理解、標籤、時間……':'Search stories, categories, evidence, feelings, reflections, tags, or dates…',
    '素材標題':'Story Title','機師特質標籤':'Pilot Trait Tags','素材內容／事件':'Story / Event','素材標題':'Story Title','未命名素材':'Untitled Story','未指定篇章':'Not Assigned','未連結時間軸':'No Timeline Link','來源時間軸':'Timeline Source','所屬篇章':'Chapter','寫作狀態':'Writing Stage','時間精度':'Date Precision',
    '發生了什麼？先保留具體事件、場景與事實。':'What happened? Start with concrete events, scenes, and facts.','當時真正感受到什麼？先寫當時，不急著用現在的理解解釋。':'What did you actually feel then? Stay with the moment before interpreting it from today’s perspective.','現在回頭看，這件事代表什麼？學到了什麼？':'Looking back now, what does this event mean to you? What changed in your understanding?',
    '證據／佐證':'Evidence','當時感受':'What I Felt Then','現在理解':'What I Understand Now','刪除這筆素材？':'Delete this story idea?','沒有符合條件的素材。':'No matching story ideas.','尚無標籤':'No tags','未標籤':'No tags','時間待補':'Date needed',

    // Photo memories
    '本機照片模式':'Photos Stay on This Device','＋ 新增回憶':'+ Add Memory','純文字回憶':'Text-only Memory','替這段回憶取名字':'Name this memory','地點':'Place','感受':'Feeling','標籤':'Tags','關聯章節':'Linked Chapters','那時候，我在做什麼？':'What was I doing then?','目前還沒有回憶。按上方「＋ 新增回憶」開始第一筆。':'No memories yet. Use “+ Add Memory” to create your first one.','刪除這筆回憶？':'Delete this memory?','照片回憶資料庫開啟失敗，請重新整理後再試。':'Could not open the photo-memory database. Reload the page and try again.',

    // Book direction
    '核心定位':'Core Direction','讀者與問題':'Readers & Questions','作者定位':'Author Perspective','全書結構':'Book Structure','尚未設定書名':'Untitled Book','先寫下一句：這本書想陪讀者走到哪裡？':'Start with one sentence: where should this book take the reader?','匯入全書定位':'Import Book Direction','匯出全書定位':'Export Book Direction',
    '作者介紹':'About the Author','一、書名':'1. Title','二、副標題':'2. Subtitle','三、書籍類型':'3. Genre','四、核心概念':'4. Core Concept','五、一句話介紹':'5. One-Sentence Pitch','六、書籍主張':'6. Core Claims','七、目標讀者':'7. Target Readers','八、讀者痛點':'8. Reader Needs & Questions','九、內容特色':'9. What Makes This Book Distinct','十、作者背景與寫作優勢':'10. Author Background & Writing Strengths','十一、全書架構':'11. Book Structure',
    '出版企劃大綱':'Book Proposal','每一格都可以直接編輯，輸入後會自動儲存。':'Edit any field directly. Changes are saved automatically.','在這裡輸入內容……':'Write here…','這裡只處理「全書定位」欄位，不會取代章節、正文、素材或照片。匯入檔內容不會寫進公開 GitHub 原始碼。':'This import only updates Book Direction fields. It will not replace chapters, manuscript text, story ideas, or photos, and imported content is not written into the public GitHub source.',
    '建議使用順序：先定「書名／一句話介紹／核心概念」，再處理讀者與痛點，最後回頭整理作者定位與全書架構。所有欄位仍沿用原本的自動儲存資料，不會另開一份。':'Suggested order: define the title, one-sentence pitch, and core concept first; then clarify readers and their questions; finally refine the author perspective and overall structure. Everything continues to use the same saved data.',

    // Chapter editor
    '章名工作台':'Chapter Title Lab','這章真正要回答的問題':'The question this chapter is really exploring','如果章名是「門」，這個問題就是你寫作時的方向。不是摘要，而是讀者一路讀下去想知道的答案。':'Think of the title as the door and this question as your compass. It is not a summary; it is what keeps the reader moving through the chapter.',
    '從照片找畫面':'Find a Scene in Photos','從素材找故事':'Browse Story Library','加入引用與借鏡':'Add a Reference or Insight','去修稿工作室':'Open Revision Studio','分析中':'Analyzing','還沒有章名':'No title yet','尚未形成明顯類型':'No clear title style yet','問題句':'Question','矛盾句':'Tension','畫面句':'Scene',
    '章名三題檢查':'Three Checks for a Chapter Title','會想知道發生什麼嗎？':'Does it make you want to know what happened?','讀完後會有第二層意思嗎？':'Will it gain a second meaning after the chapter?','像這本書，而不是心得報告嗎？':'Does it sound like this book—not a school reflection?','摘要型':'Summary-style','畫面型':'Scene-style',
    '先用暫定章名也可以，等正文長出來再回來命名。':'A working title is enough for now. Come back after the draft has grown.','現在比較像「心得結論」，可以試著把答案拿掉，留下衝突、問題或一個具體畫面。':'This reads more like a conclusion. Try removing the answer and keeping the tension, question, or a concrete scene.','章名偏長；看看是否同時塞了背景、事件、結果和道理，能不能只留下最有張力的一層。':'The title is long. Check whether it is carrying background, event, outcome, and lesson all at once; keep only the layer with the most tension.','很短沒有問題，但目前資訊較少；確認它是否仍能勾起好奇。':'A short title is fine. Just make sure it still creates curiosity.','目前已經有明顯的閱讀鉤子。再問一次：讀完正文後，這句話會不會多一層意思？':'There is already a clear hook. One more check: will this line mean something more after the reader finishes the chapter?','目前比較像中性描述。可以試著改成「矛盾句、問題句、畫面句」其中一種，再比較哪一個最像這章。':'This is currently neutral and descriptive. Try a tension title, a question, or a scene, then compare which one best fits the chapter.',

    // Revision studio
    '修稿不是把文章變得更漂亮，而是讓讀者更靠近當時的你。先看見畫面，再感受到拉扯，最後才理解這段經歷為什麼值得留下。':'Revision is not about making the prose prettier. It is about bringing the reader closer to who you were in that moment: first let them see the scene, then feel the tension, and only then understand why the experience matters.',
    '一次只修 1–2 件事':'Revise only 1–2 things at a time','不是 7 項都要滿分':'This is not a seven-item scorecard','具體細節比形容詞更有畫面':'Concrete details create stronger scenes than adjectives','正在修哪一章？':'Which chapter are you revising?','重新讀這一章':'Review This Chapter','回章節編輯器':'Back to Chapter Editor','尚無章節':'No chapters yet','已有線索':'Present','可再補':'Needs more','本輪只修一件事':'Focus on one thing this round','本輪只修一到兩件事':'Focus on one or two things this round','這輪先修':'Focus first',
    '進入現場':'Enter the Scene','場景':'Scene','發生問題':'Tension Appears','衝突':'Tension','做出行動':'Take Action','行動':'Action','事情落地':'Outcome','結果':'Outcome','回到當時':'Return to Then','當時的我':'Who I Was Then','重新理解':'Reinterpret','現在的理解':'What I Understand Now','留下意義':'Why It Matters','全書連結':'Connection to the Book',
    '讀者知道事情在哪裡發生、你正在做什麼嗎？':'Can the reader tell where this is happening and what you are doing?','這個故事裡，真正讓你卡住、必須選擇或改變的是什麼？':'What truly forced you to choose, change, or confront uncertainty in this story?','面對問題，你實際做了什麼？':'What did you actually do when the problem appeared?','事情最後怎麼收尾？結果和你原本預期一樣嗎？':'How did it end? Was the outcome what you expected?','當時的你在怕什麼、相信什麼、期待什麼？':'What were you afraid of, believing, or hoping for at the time?','如果今天重新看這件事，你的理解有什麼不同？':'Looking back today, what do you understand differently?','這個故事為什麼值得放進這本書，而不只是留在日記裡？':'Why does this story belong in the book rather than only in a diary?',
    '畫面細節｜如果這是一幕電影，鏡頭先拍到什麼？':'Scene Detail | If this were a film, what would the camera see first?','不用把五感全部寫進去。挑 1–2 個你真的記得的細節，就比「我很緊張／我很開心」更能把讀者帶進現場。':'You do not need all five senses. One or two details you genuinely remember will bring the reader into the moment more effectively than simply saying “I was nervous” or “I was happy.”','看看「摘要 → 畫面」示範':'See a Summary → Scene Example','摘要版':'Summary','有畫面的版本':'Scene Version','看見':'See','聽見':'Hear','動作':'Movement','物件':'Object','身體':'Body',

    // References
    '這裡不是先蒐集一大堆參考文獻，而是保存「某個外部觀點如何幫我重新理解自己的故事」。先用自己的話記下想法；真的要放進書裡時，再回頭確認原文、頁碼與脈絡。':'This is not a bibliography dump. Save how an outside idea helps you understand your own story differently. Capture the idea in your own words first; verify the original wording, page, and context only when you decide to use it in the book.',
    '我看到了什麼？':'What did I find?','它真正說了什麼？':'What is the core idea?','它讓我想到什麼？':'What does it connect to in my life?','我會怎麼用？':'How might I use it?','看一個示範':'See an Example','＋ 新增借鏡卡':'+ Add Insight Card','來源':'Source','核心觀點':'Core Idea','它讓我想到':'It Connects Me To','我可能怎麼用':'Possible Use',
    '來源類型':'Source Type','來源名稱':'Source Name','作者／出處':'Author / Publisher','網址／識別資訊':'URL / Identifier','這個來源真正讓我記住的核心觀點是什麼？':'What is the core idea I want to remember from this source?','它讓我想到自己的哪段故事、經驗或原本的想法？':'Which story, experience, or prior belief of mine does this connect to?','如果寫進書裡，我想拿它做什麼？':'If I use this in the book, what role should it play?','可能放在哪一章？':'Possible Chapter','來源確認狀態':'Verification Status','短摘錄':'Short Excerpt','頁碼／時間碼／位置':'Page / Timestamp / Location','刪除這張借鏡卡':'Delete This Insight Card','還沒有引用與借鏡。':'No references or insights yet.',

    // Data safety & cloud
    '資料安全':'Data Safety','看清楚哪些資料有雲端保護，哪些仍只存在這台裝置。':'See what is protected by cloud sync and what still exists only on this device.','僅此裝置':'This Device Only','尚未登入':'Not Signed In','已建立雲端同步':'Cloud Sync Ready','等待首次比對':'Waiting for First Sync','正在同步':'Syncing','雲端同步已啟用':'Cloud Sync On','尚未啟用雲端同步':'Cloud Sync Off','書稿與章節':'Manuscript & Chapters','故事素材':'Story Ideas','已有內容':'Has Content','尚未開始':'Not Started','照片回憶':'Photo Memories','IndexedDB 本機保存':'Stored Locally in IndexedDB','前往備份與匯出':'Open Backup & Export','照片要特別注意：':'Important note about photos:','◉ 資料安全':'◉ Data Safety','關閉':'Close','收合':'Collapse',
    'Google 登入':'Sign in with Google','立即同步':'Sync Now','從資料庫載入':'Load from Cloud','登出':'Sign Out','尚未登入；本機自動儲存仍正常':'Not signed in. Local autosave is still working.','正在開啟 Google 登入…':'Opening Google sign-in…','正在前往 Google 登入頁面…':'Opening Google sign-in…','資料庫已是最新狀態':'Cloud data is up to date','目前沒有本機書稿資料可同步':'There is no local writing data to sync.','新的資料庫目前沒有資料；舊整包備份仍保留':'No data is stored in the new cloud collections yet. Your previous backup remains intact.','已取消從資料庫載入':'Cloud restore canceled',

    // Common UI states
    '尚未設定核心問題':'Core question not set','尚無章節':'No chapters yet','尚未填來源':'Source not entered','未指定篇章':'Not Assigned','還沒決定放哪一章':'Not assigned yet','刪除':'Delete','儲存中…':'Saving…','✓ 已儲存':'✓ Saved','✓ 已自動儲存':'✓ Saved automatically'
  };

  const EN={
    'Save your life first. Turn it into a book over time.':'Capture your life first. Shape it into a book, one story at a time.',
    'Organize drafts, plan chapters, build story cards, write the manuscript, or recover memories directly from old photos.':'Collect notes, shape chapters, build a story library, and draft your manuscript. You can also use old photos to recover moments you might otherwise forget.',
    'Material Library':'Story Library','Material Triage':'Story Extractor','References & Perspectives':'References & Insights','Book Positioning':'Book Direction','Revision Check':'Revision Studio','Story materials':'Story Ideas','Draft to organize':'Source Text','Turn Entire Draft into Material':'Save as Story Idea','05 · Preserve':'05 · Save & Backup','Source to Verify':'Needs Verification','Source Verified':'Verified','Partly Confirmed':'Partially Verified','Book title not set':'Untitled Book','Publishing Proposal Outline':'Book Proposal','One-line Description':'One-Sentence Pitch','Reader Pain Points':'Reader Needs & Questions'
  };

  const RULES=[
    [/^(\d+) 筆時間軸$/,(_,n)=>`${n} timeline ${n==='1'?'entry':'entries'}`],
    [/^(\d+) 筆素材$/,(_,n)=>`${n} story ${n==='1'?'idea':'ideas'}`],
    [/^(\d+) 筆故事素材$/,(_,n)=>`${n} story ${n==='1'?'idea':'ideas'}`],
    [/^(\d+) 個章節$/,(_,n)=>`${n} ${n==='1'?'chapter':'chapters'}`],
    [/^(\d+) 章已有正文$/,(_,n)=>`${n} ${n==='1'?'chapter has':'chapters have'} a draft`],
    [/^(\d+) 筆借鏡$/,(_,n)=>`${n} ${n==='1'?'reference':'references'}`],
    [/^第 (\d+) 章$/,(_,n)=>`Chapter ${n}`],
    [/^第 (\d+) 章｜(.+)$/,(_,n,title)=>`Chapter ${n} | ${title}`],
    [/^(\d+) 字正文$/,(_,n)=>`${Number(n).toLocaleString()} characters drafted`],
    [/^(\d+) 字 · (\d+) 段$/,(_,a,b)=>`${Number(a).toLocaleString()} characters · ${b} ${b==='1'?'paragraph':'paragraphs'}`],
    [/^已連結 (\d+) 筆$/,(_,n)=>`${n} linked`],
    [/^(\d+) \/ (\d+) 已填寫$/,(_,a,b)=>`${a} / ${b} completed`],
    [/^(\d+) 筆事件$/,(_,n)=>`${n} timeline ${n==='1'?'entry':'entries'}`],
    [/^已同步 (\d+) 項變更｜(.+)$/,(_,n,t)=>`Synced ${n} ${n==='1'?'change':'changes'} · ${t}`],
    [/^已登入 (.+)｜Firestore collections 模式$/,(_,email)=>`Signed in as ${email} · Firestore collections`],
    [/^已登入 (.+)$/,(_,email)=>`Signed in as ${email}`],
    [/^資料庫同步失敗：(.+)$/,(_,e)=>`Cloud sync failed: ${e}`],
    [/^資料庫讀取失敗：(.+)$/,(_,e)=>`Cloud restore failed: ${e}`],
    [/^登入失敗：(.+)$/,(_,e)=>`Sign-in failed: ${e}`],
    [/^Google 登入返回失敗：(.+)$/,(_,e)=>`Google sign-in failed after redirect: ${e}`],
    [/^無法開啟 Google 登入：(.+)$/,(_,e)=>`Could not open Google sign-in: ${e}`],
    [/^你已有 ([\d,]+) 字原始文字，但素材還不多。先拆故事，比繼續堆文字更容易看見全書結構。$/,(_,n)=>`You already have ${n} characters of source text but only a few story ideas. Extracting stories now will reveal the book’s structure more clearly than adding more raw text.`],
    [/^你已累積 (\d+) 筆素材，可以開始問：這本書真正想留下什麼？$/,(_,n)=>`You have ${n} story ideas. This is a good moment to ask what the book is really trying to leave with the reader.`],
    [/^這一章目前已有 ([\d,]+) 字。可以換到修稿工作室，看畫面、衝突、行動與理解哪一層最值得補。$/,(_,n)=>`This chapter already has ${n} characters. Open Revision Studio to see whether scene, tension, action, or reflection needs the most work.`],
    [/^(\d+) 筆時間軸 · ([\d,]+) 字原始文字$/,(_,a,b)=>`${a} timeline ${a==='1'?'entry':'entries'} · ${b} source characters`],
    [/^(\d+) 個章節 · 全書定位已開始$/,(_,n)=>`${n} ${n==='1'?'chapter':'chapters'} · Book direction started`],
    [/^(\d+) 個章節 · 全書定位已待整理$/,(_,n)=>`${n} ${n==='1'?'chapter':'chapters'} · Book direction needs work`],
    [/^(\d+) \/ (\d+) 章已有正文$/,(_,a,b)=>`${a} of ${b} chapters drafted`],
    [/^目前抓到 (\d+) 種畫面線索。(.+)$/,(_,n,rest)=>`Found ${n} kinds of scene detail. ${local(rest)}`],
    [/^已有線索 (\d+) 項｜展開看完整檢查$/,(_,n)=>`${n} signals present · Open full review`]
  ];

  function local(text){
    const raw=String(text??'');
    const trimmed=raw.trim();
    if(!trimmed)return raw;
    let out=ZH[trimmed]||EN[trimmed];
    if(!out){
      for(const [re,fn] of RULES){
        if(re.test(trimmed)){out=trimmed.replace(re,fn);break}
      }
    }
    if(!out)return raw;
    const lead=raw.match(/^\s*/)?.[0]||'';
    const tail=raw.match(/\s*$/)?.[0]||'';
    return lead+out+tail;
  }

  const originalT=base.t.bind(base);
  const originalTranslate=base.translate.bind(base);
  function enhancedT(text){
    const direct=local(text);
    if(direct!==text)return direct;
    const first=originalT(text);
    return local(first);
  }

  function skipNode(node){
    const p=node.parentElement;
    return !p||!!p.closest('script,style,textarea,code,pre,[contenteditable="true"]');
  }

  function translateOption(option){
    if(!(option instanceof HTMLOptionElement))return;
    const original=option.dataset.enSource||option.textContent.trim();
    if(!option.dataset.enSource)option.dataset.enSource=original;
    const translated=enhancedT(original);
    if(translated!==original)option.textContent=translated;
  }

  function attrs(el){
    if(!(el instanceof Element))return;
    ['placeholder','title','aria-label'].forEach(name=>{
      if(!el.hasAttribute(name))return;
      const value=el.getAttribute(name)||'';
      const next=enhancedT(value);
      if(next!==value)el.setAttribute(name,next);
    });
    if(el instanceof HTMLOptionElement)translateOption(el);
  }

  function polish(root=document.body){
    if(!root)return;
    if(root instanceof Element)attrs(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      if(skipNode(node))continue;
      const next=enhancedT(node.nodeValue);
      if(next!==node.nodeValue)node.nodeValue=next;
    }
    root.querySelectorAll?.('input[placeholder],textarea[placeholder],[title],[aria-label],option').forEach(attrs);
    document.documentElement.lang='en';
    document.documentElement.dataset.locale='en';
    document.title='Life Archive | Private Writing Studio';
  }

  function dialogText(message){
    const raw=String(message??'');
    const exact=enhancedT(raw);
    if(exact!==raw)return exact;
    const load=raw.match(/^將從 Firestore 載入 (\d+) 章、(\d+) 筆素材。\n\n這會取代這台裝置目前的文字工作室資料，但 Firestore 與舊整包備份都不會被刪除。\n\n確定載入？$/);
    if(load)return `Load ${load[1]} chapters and ${load[2]} story ideas from Firestore?\n\nThis will replace the writing-studio data currently stored on this device. Your Firestore data and previous full backup will not be deleted.\n\nContinue?`;
    const linked=raw.match(/^這筆時間軸已連結「(.+)」。仍要再建立一筆素材嗎？$/);
    if(linked)return `This timeline entry is already linked to “${linked[1]}”. Create another story idea anyway?`;
    return raw;
  }

  const nativeAlert=window.alert?.bind(window);
  const nativeConfirm=window.confirm?.bind(window);
  const nativePrompt=window.prompt?.bind(window);
  if(nativeAlert)window.alert=(m)=>nativeAlert(dialogText(m));
  if(nativeConfirm)window.confirm=(m)=>nativeConfirm(dialogText(m));
  if(nativePrompt)window.prompt=(m,d)=>nativePrompt(dialogText(m),d);

  base.t=enhancedT;
  base.translate=(root)=>{originalTranslate(root);polish(root)};
  window.LifeArchiveI18n=base;

  // English typography and slightly clearer language switcher.
  const style=document.createElement('style');
  style.id='lifeArchiveEnglishPolish';
  style.textContent=`
    html[data-locale="en"] body{font-family:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",sans-serif}
    html[data-locale="en"] .hero h1,html[data-locale="en"] .heading h1,html[data-locale="en"] .dw-hero h1,html[data-locale="en"] .dw-section-head h2,html[data-locale="en"] .ce-hero h1,html[data-locale="en"] .rev-studio-hero h1{letter-spacing:-.025em}
    html[data-locale="en"] #nav button{letter-spacing:-.005em}
    html[data-locale="en"] .workflow-group-label{letter-spacing:.09em!important}
    html[data-locale="en"] #languageSwitcher button{min-width:38px}
    @media(max-width:850px){html[data-locale="en"] .top{gap:7px}html[data-locale="en"] #languageSwitcher{margin-right:2px!important}}
  `;
  document.head.appendChild(style);

  polish(document.body);
  const observer=new MutationObserver(records=>{
    records.forEach(record=>{
      if(record.type==='characterData'){
        const node=record.target;
        if(!skipNode(node)){
          const next=enhancedT(node.nodeValue);
          if(next!==node.nodeValue)node.nodeValue=next;
        }
        return;
      }
      if(record.type==='attributes'){
        attrs(record.target);
        return;
      }
      record.addedNodes.forEach(node=>{
        if(node.nodeType===Node.TEXT_NODE){
          if(!skipNode(node)){
            const next=enhancedT(node.nodeValue);
            if(next!==node.nodeValue)node.nodeValue=next;
          }
        }else if(node.nodeType===Node.ELEMENT_NODE){
          polish(node);
        }
      });
    });
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
})();