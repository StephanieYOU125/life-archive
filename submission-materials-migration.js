(()=>{
  const STORAGE_KEY='life-archive-writing-studio-v1';
  const MIGRATION_KEY='submissionMaterials20260817';
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);

  let state={};
  try{state=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch{return}
  state.chapters=Array.isArray(state.chapters)?state.chapters:[];
  state.materials=Array.isArray(state.materials)?state.materials:[];
  state.migration=state.migration&&typeof state.migration==='object'?state.migration:{};
  if(state.migration[MIGRATION_KEY]) return;

  const chapterPlan=[
    ['序章｜人生不是等到想清楚，才可以開始','當人生沒有標準答案時，我們需要的究竟是更確定，還是一套能夠安全試錯的方法？'],

    ['第一部 01｜我不知道適合什麼，所以選了一條最明確的路','當我還不知道自己是誰時，為什麼會把「最明確」誤認成「最適合」？'],
    ['第一部 02｜制度可以保護我，但不能替我判斷','資訊、規則與權威都存在時，我如何學會 cross-check，並對自己的判斷負責？'],
    ['第一部 03｜犯錯、被看見之後，我還能不能繼續？','如果安全不是永遠不出錯，那犯錯後如何恢復、誠實回報並繼續行動？'],

    ['第二部 04｜我的身體，是第一套不會說謊的警報系統','努力與堅持什麼時候會越過自己的 operating envelope？'],
    ['第二部 05｜真正的保護自己，是先學會安全倒下','哪些失敗可以透過受身、備援與多重防線降低代價？哪些錯誤不能真的發生？'],
    ['第二部 06｜完成不等於方法正確','疲勞、目標固著與「撐到底」如何讓原本的能力失效？'],

    ['第三部 07｜第一次走出去，不必先把所有支架拆掉','第一次離開熟悉環境時，如何利用團體、行程與最低安全底線，讓自己接近未知？'],
    ['第三部 08｜留下最低安全底線，再讓未知發生','獨旅、陌生邀請與臨時決定之間，如何做到 Trust but Verify？'],
    ['第三部 09｜退出，也可以是正確答案','什麼時候該 abort、回頭、重新進入？沉沒成本是否正在替我做決定？'],

    ['第四部 10｜救人以前，先建立安全空間','處理危機時，為什麼不能只盯著眼前最急的問題？'],
    ['第四部 11｜計畫沒有錯，但現場已經變了','當環境改變時，如何靠情境意識、回饋與 cross-monitoring 更新原本計畫？'],
    ['第四部 12｜事情同時湧進來時，我不能只問誰最急','工作負荷、風險排序、溝通與權威梯度如何共同影響決策？'],

    ['第五部 13｜我不再只靠自己的腦袋','如果人本來就會忘記，如何把 SQL、範本、提醒、筆記與 checklist 變成外部記憶？'],
    ['第五部 14｜很努力以前，我應該先確認前提','資格不符、聽不懂與能力落差出現時，如何找到真正的 root cause，而不是只增加努力？'],
    ['第五部 15｜模型算出答案，不代表答案就是真的','資料、AI 與自動化工具如何驗證？Human-in-the-loop 為什麼仍然必要？'],

    ['第六部 16｜兩個月，不足以學完一個領域，但足以做一次測試','資源有限時，如何把大型目標做成 time-boxed experiment？'],
    ['第六部 17｜住進別人的世界後，我才知道什麼適合自己','真正進入一個環境之後，生活感受、界線與 environmental fit 會提供哪些想像得不到的資訊？'],
    ['第六部 18｜尊重權威，不等於把自己的判斷交出去','面對老師、制度、名氣與重大機會時，如何保留 assertiveness、責任與重新選擇的能力？'],

    ['終章｜我沒有找到標準答案，只找到一套可以繼續走的方法','三十歲仍然沒有完整答案時，我已經學會哪些可以反覆使用的判斷與修正方法？']
  ];

  const materials=[
    ['挑戰01｜報考中央警察大學','不知道自己適合什麼時，選擇制度明確、畢業後職涯出口清楚的道路。核心：Risk Transfer。反思不是「警大是不是選對」，而是當時把不確定性交給制度，降低了哪些風險，又忽略了哪些生活適配問題。','發展中'],
    ['挑戰02｜相信集合時間而遲到','因相信同學提供的集合時間而在全大隊面前遲到。核心：Cross-check、Information Verification。別人的好意不能取代自己對關鍵資訊的確認。','發展中'],
    ['挑戰03｜第一份「沒有藉口」作業','面對犯錯、理由與責任的早期經驗。可討論 Reporting Culture、Honesty、Just Culture：承擔責任不等於抹除脈絡，好的系統需要知道錯誤是怎麼發生的。','靈感箱'],
    ['挑戰04｜休士頓警政交流','第一次飛到遙遠的地方，走進不同警察制度與文化。核心：Risk Trade-off、SOP、工具與制度；同樣叫警察，工作方法與價值可能完全不同。','靈感箱'],
    ['挑戰05｜韶韻獎：即使有人說我走音，我還是唱完','在公開表現與被評價中繼續完成。核心：Psychological Safety、Recovery from Error。可寫從害怕出糗到允許自己在不完美中完成。','靈感箱'],

    ['挑戰06｜三千公尺昏倒、銀牌到金牌','太想追上前方、偏離自己的節奏，最後失去意識。核心：Warning Signs、Goal Fixation、Operating Envelope。意志力沒有風險判斷，也可能把人帶向危險。','發展中'],
    ['挑戰07｜柔道受身：先學會怎麼跌','想學會摔人以前，先反覆練習如何安全倒下。核心：Fail-safe、Resilience。真正的安全不是保證不跌倒，而是降低跌倒的代價。','發展中'],
    ['挑戰08｜射擊訓練的非預期擊發','有些錯誤不能靠事後補救。核心：Multiple Barriers、Stop Work。適合討論高後果事件為什麼需要多重防線與立即停止權。','靈感箱'],
    ['挑戰09｜跨年勤務後跑全程馬拉松','完成 42 公里不代表準備方式正確。核心：Fatigue Management。把身體狀態納入能力評估，而不是只看「平常做不做得到」。','靈感箱'],
    ['挑戰10｜後空翻：看不見身後仍決定往後跳','不是直接把自己丟進風險，而是在教練、墊子與漸進訓練下接近恐懼。核心：Controlled Exposure、Progressive Training。','靈感箱'],

    ['挑戰11｜第一次英法旅行','第一次遠行不是完全單打獨鬥，而是在團體旅行的支架下走進陌生世界。核心：Scaffolding。第一次不必同時移除所有保護。','靈感箱'],
    ['挑戰12｜日本臨時獨旅','只先準備必要底線，到了當地再決定住宿與行程。核心：Minimum Safe Baseline。安全不是把未知消除，而是先守住不能失去的底線。','發展中'],
    ['挑戰13｜北海道收到陌生人的邀請','旅行中遇到 Jerry 等人的邀請與臨時變化。核心：Trust but Verify。可以接受未知，但仍需持續確認資訊、界線與退路。','靈感箱'],
    ['挑戰14｜潛水五公尺恐慌後退出再回去','水下慌張時先離開，調整裝備與狀態後重新進入，最後看見海龜。核心：Abort、Recovery、Re-entry。退出不等於失敗。','發展中'],
    ['挑戰15｜玉山與空拍機返航','已投入時間與期待時，仍需要依條件做 Go/No-Go 或返航。核心：Abort Criteria、Sunk Cost。','靈感箱'],

    ['挑戰16｜國道失智婦人救援：先建立安全空間','在高速車流中救援時，先用警示設備、交通錐與安全區降低二次事故。核心：Hazard Control、Buffer Zone。','發展中'],
    ['挑戰17｜國道後方警戒：真正把人帶回來的不是我','團隊中有人救人、有人警戒後方、有人維持安全。核心：CRM、Cross-monitoring、Role Allocation。安全不是靠一個英雄。','發展中'],
    ['挑戰18｜交整督導與號誌回堵','原本計畫在現場條件改變後不一定仍有效。核心：Feedback Loop、Situational Awareness。看到回堵就要更新判斷，而不是執著原方案。','靈感箱'],
    ['挑戰19｜多項公務同時湧入','面對議員索資、勤務、行政工作與其他時效任務，重新排優先順序。核心：Workload Management、Risk Prioritization。','靈感箱'],
    ['挑戰20｜從不敢公開說話到向市長／副市長簡報','從害怕在人前說話，到需要清楚報告資料與現況。核心：Information Integrity、Authority Gradient。','靈感箱'],

    ['挑戰21｜自學 SQL，把一次性工作變成可重用系統','議會或行政需求不會等自己慢慢學會，因此把查詢與處理方式建立成可重複使用的系統。核心：Standardization、Reusable System。','發展中'],
    ['挑戰22｜鬧鐘、筆記與外部記憶','不再要求自己永遠記得，而是用提醒、筆記與 checklist 補足人的記憶限制。核心：Human Factors。','靈感箱'],
    ['挑戰23｜第一次臺大報名資格不符','很努力以前先確認 precondition。核心：Precondition Check。錯誤前提下投入越多，不一定越接近目標。','靈感箱'],
    ['挑戰24｜研究所聽不懂，回頭補基礎','一直往前學沒有用時，找出自己從哪裡開始聽不懂。核心：Root Cause、Fault Isolation。跨領域首先是承認缺口。','發展中'],
    ['挑戰25｜AI／電腦視覺論文：模型有答案不代表是真的','用電腦視覺與軌跡分析研究行人安全，同時需要驗證模型輸出與限制。核心：Automation Bias、Validation、Human-in-the-loop。','發展中'],

    ['挑戰26｜兩個月跨考 AI／ML 公費留學','利用臺大課程建立線性代數與程式架構，在時間有限下進行正式嘗試。核心：Resource Allocation、Time-boxed Experiment。','發展中'],
    ['挑戰27｜日本交換與國際共居','真正住進不同文化與生活環境，才知道自己對噪音、界線、合作與生活方式的需求。核心：Adaptability、Environmental Fit。','發展中'],
    ['挑戰28｜迪士尼／關係中的自己','某些看起來很甜、很理想的經驗，真正進入後可能帶來不同感受。核心：Authenticity、Boundary、Consent。涉及真實他人時應先決定是否願意深入寫。','靈感箱'],
    ['挑戰29｜投稿爭議與拒絕授權','尊重老師或權威，不代表放棄自己的判斷與授權責任。核心：Assertiveness、Authority Gradient、Responsibility。','發展中'],
    ['挑戰30｜東大博士 vs 培訓機師','兩條看起來都很好的道路不能同時擁有。核心：Reversibility、Opportunity Cost、Commitment。重點不是選哪個，而是如何把全書累積的風險、資訊、停止條件與價值排序用在自己身上。','發展中'],

    ['方法素材｜人生安全實驗六步驟','1 確認想測試的問題；2 設定最小可行嘗試；3 辨識風險與底線；4 保留備援方案；5 記錄能力、情緒、身體、投入意願與實際代價等真實回饋；6 根據資訊決定繼續、修正或停止。','可寫作'],
    ['方法素材｜單章六段式','每章可依序寫：挑戰開始前 → 真實場景 → 困難與偏差 → 結果與代價 → Safety Systems 觀點 → 給讀者的一次嘗試。避免只寫事件履歷，要讓讀者看到原本假設如何被現實修正。','可寫作'],
    ['主題素材｜警大四年真正留下的紀律','6:20 點名實際要更早到、內務、冰箱清空、軍訓口令、團體規範與德育獎等不是單一事件，而是長期累積。核心：真正的紀律，是沒有人提醒時仍能管理自己。適合放第一部結尾或穿插。','靈感箱'],
    ['主題素材｜從讀別人的論文，到相信自己也能研究','工作後常去圖書館閱讀不同領域論文，開始欣賞研究對資料來源、方法與限制的誠實交代，也逐漸相信研究不是天才專利，而是願意長時間把問題想清楚。可作研究所篇的前導。','靈感箱'],
    ['主題素材｜開始記錄生活，而不只追求效率','從只注意任務與成果，到開始拍美食、夕陽、街景、剪影片與寫作。這不是單一挑戰，但可以作旅行或海外生活章的散文段落，呈現價值觀改變。','靈感箱'],
    ['主題素材｜人生不是工程系統','Safety Systems Designer 不是要把人生控制到沒有意外。有些重要的事無法計算，偶然、感情與沒有照計畫發生的事件可能反而成為最珍貴的部分。不行動本身也有風險。','可寫作'],
    ['主題素材｜我最後想保留的是重新選擇的能力','從「我能不能做到？」轉向「如果做不到，我還能不能繼續往前？」安全不是零風險，而是在結果不如預期時仍保有調整、停止與重新選擇的能力。可作序章或終章回扣。','可寫作']
  ];

  const normalized=s=>String(s||'').replace(/\s+/g,'').replace(/[｜:：]/g,'').toLowerCase();

  const existingChapters=state.chapters.slice();
  const used=new Set();
  const curated=[];
  for(const [title,question] of chapterPlan){
    const key=normalized(title.replace(/^(序章|終章|第[一二三四五六]部\s*\d+)[｜\s]*/,'').slice(0,16));
    let matchIndex=existingChapters.findIndex((c,i)=>!used.has(i)&&normalized(c.title).includes(key)&&key.length>5);
    if(matchIndex>=0){
      used.add(matchIndex);
      const old=existingChapters[matchIndex];
      curated.push({...old,title,question:old.question||question,submissionPlan:true});
    }else{
      curated.push({id:uid(),title,question,draft:'',submissionPlan:true});
    }
  }
  const unmatched=existingChapters.filter((_,i)=>!used.has(i)).filter(c=>{
    const t=String(c.title||'').trim();
    const d=String(c.draft||'').trim();
    return d || (t && t!=='第一章');
  });
  state.chapters=[...curated,...unmatched];

  const existingMaterialKeys=new Set(state.materials.map(m=>normalized(m.title)));
  for(const [title,content,stage] of materials){
    if(existingMaterialKeys.has(normalized(title))) continue;
    state.materials.push({id:uid(),title,content,stage,source:'投稿準備.docx',submissionImport:true});
    existingMaterialKeys.add(normalized(title));
  }

  state.migration[MIGRATION_KEY]={appliedAt:new Date().toISOString(),chapterPlan:20,materialsAdded:materials.length,source:'投稿準備.docx'};
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
})();
