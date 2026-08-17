const REVISION_CHECKS=[
  {
    key:'scene',
    title:'1｜場景',
    question:'讀者看得到事情發生在哪裡、你在做什麼嗎？',
    why:'先讓讀者進入現場，再談你的理解。',
    prompt:'可以補：時間、地點、人物、動作、看見／聽見／身體感受。',
    test:text=>/(那天|當時|那時|早上|晚上|下午|走進|走到|站在|坐在|看見|看到|聽見|拿著|打開|穿著|現場|辦公室|教室|車上|路口|房間|機場|車站)/.test(text)
  },
  {
    key:'conflict',
    title:'2｜核心問題／衝突',
    question:'這個故事裡，真正讓你卡住、必須選擇或改變的是什麼？',
    why:'沒有問題或拉扯，故事容易變成事件紀錄。',
    prompt:'可以補：我原本以為……但……／我必須在 A 與 B 之間決定……／最大的困難是……',
    test:text=>/(但是|但我|然而|卻|困難|問題|衝突|壓力|風險|擔心|害怕|猶豫|不知道|必須|沒想到|來不及|無法|失敗|限制|兩難)/.test(text)
  },
  {
    key:'action',
    title:'3｜我的行動',
    question:'面對這個問題，你實際做了什麼？',
    why:'讓讀者看到你不是只「有一個想法」，而是真的做出選擇。',
    prompt:'可以補：我先……接著……／我決定……／我去詢問……／我改變了……',
    test:text=>/(我先|我開始|我決定|我選擇|我去|我把|我問|我詢問|我聯絡|我嘗試|我改|我提出|我回到|我繼續|於是我|因此我|接著我)/.test(text)
  },
  {
    key:'result',
    title:'4｜結果',
    question:'事情最後發生了什麼？結果和你原本預期一樣嗎？',
    why:'結果讓故事有落點，也讓後面的反思有所依據。',
    prompt:'可以補：最後……／結果……／事情沒有如我預期……／這個選擇帶來……',
    test:text=>/(最後|結果|最終|因此|後來|成功|失敗|完成|獲得|得到|改善|改變|沒有如|沒有成功|達成|解決)/.test(text)
  },
  {
    key:'then',
    title:'5｜當時的我',
    question:'當時的你怎麼理解這件事？你在怕什麼、相信什麼、期待什麼？',
    why:'把「事件」變成「你的故事」。',
    prompt:'可以補：當時我以為……／我那時最在意的是……／我其實有點……',
    test:text=>/(當時我|那時我|我以為|我覺得|我認為|我擔心|我害怕|我期待|我希望|我在意|我很|我其實|對我來說)/.test(text)
  },
  {
    key:'now',
    title:'6｜現在的理解',
    question:'如果今天重新看這件事，你的理解有什麼不同？',
    why:'這通常是一本回顧型作品真正有價值的地方。',
    prompt:'可以補：後來我才理解……／現在回頭看……／原來……／我重新定義了……',
    test:text=>/(後來我才|現在回頭看|現在我|我才發現|我發現|我理解|我開始理解|原來|重新理解|重新看|重新定義|我學會|讓我明白)/.test(text)
  },
  {
    key:'theme',
    title:'7｜與全書的關係',
    question:'這個故事為什麼值得放進這本書，而不只是留在日記裡？',
    why:'幫你判斷這一章是否正在服務整本書的核心。',
    prompt:'可以補：這件事讓我開始思考……／它和這本書想談的……有關／這成為我之後……的起點。',
    test:(text,state)=>{
      const proposal=state?.publishingProposal||{};
      const anchors=[state?.core,proposal?.concept,proposal?.oneLiner,proposal?.claims].filter(Boolean).join(' ');
      if(!anchors.trim()) return /(這本書|人生|選擇|嘗試|系統|安全|方向|成長|理解自己|後來的我|成為)/.test(text);
      const words=anchors.replace(/[，。！？、；：「」『』（）()]/g,' ').split(/\s+/).filter(x=>x.length>=2).slice(0,24);
      return words.some(w=>text.includes(w)) || /(這本書|這件事讓我|成為.*起點|開始思考)/.test(text);
    }
  }
];

let selectedChapterId='';

function appState(){
  if(window.LifeArchiveStateBridge?.get) return window.LifeArchiveStateBridge.get()||{};
  try{return JSON.parse(localStorage.getItem('life-archive-writing-studio-v1')||'{}')||{}}catch{return {}}
}

function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function addStyles(){
  if(document.getElementById('revisionEditorStyles'))return;
  const s=document.createElement('style');
  s.id='revisionEditorStyles';
  s.textContent=`
    #v-diagnosis{max-width:1220px}
    .rev-hero{background:linear-gradient(145deg,#2b2623,#453233);color:#fff;border-radius:22px;padding:25px 27px;margin-bottom:16px}
    .rev-hero h1{font-family:Georgia,"Noto Serif TC",serif;font-size:34px;margin:6px 0 8px}.rev-hero>p{color:#ded4cf;line-height:1.75;margin:0;max-width:860px}
    .rev-flow{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:18px}.rev-flow-item{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:12px}.rev-flow-item b{display:block;font-size:12px;margin-bottom:5px}.rev-flow-item span{font-size:11px;line-height:1.55;color:#d8ceca}
    .rev-controls{display:flex;gap:10px;align-items:end;flex-wrap:wrap;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:15px;margin-bottom:12px}.rev-controls label{display:grid;gap:5px;flex:1;min-width:240px}.rev-controls label span{font-size:11px;color:var(--muted);font-weight:800}.rev-controls select{border:1px solid var(--line);background:#fff;border-radius:10px;padding:10px 11px}
    .rev-summary{display:grid;grid-template-columns:170px 1fr;gap:12px;margin-bottom:12px}.rev-score{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:17px}.rev-score strong{display:block;font-size:34px}.rev-score small{color:var(--muted);line-height:1.5}.rev-note{background:#f8f2eb;border:1px dashed #d9c8bb;border-radius:16px;padding:15px 17px;color:#665b54;font-size:12px;line-height:1.75}
    .rev-cards{display:grid;gap:10px}.rev-card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px 17px;display:grid;grid-template-columns:135px 1fr auto;gap:14px;align-items:start}.rev-card .rev-title{font-weight:900}.rev-card h3{margin:0 0 5px;font-size:14px}.rev-card p{margin:0;color:#5f5650;line-height:1.65;font-size:12px}.rev-card .rev-prompt{margin-top:8px;background:#f8f5f0;border-radius:10px;padding:9px 10px;color:var(--muted)}.rev-status{font-size:10px;font-weight:900;border-radius:99px;padding:6px 9px;white-space:nowrap;background:#eee7df;color:#6e665f}.rev-status.ok{background:#e3efe5;color:#356044}.rev-status.partial{background:#f5ecd2;color:#7a6427}
    .rev-demo{display:none;background:#fffdf9;border:1px solid var(--line);border-radius:16px;padding:17px;margin:12px 0}.rev-demo.show{display:block}.rev-demo strong{display:block;margin-bottom:8px}.rev-demo p{font-size:12px;line-height:1.75;color:#5f5650;margin:6px 0}.rev-empty{padding:28px;text-align:center;border:1px dashed var(--line);border-radius:16px;color:var(--muted);line-height:1.8}
    @media(max-width:850px){.rev-hero{padding:20px}.rev-hero h1{font-size:28px}.rev-flow{grid-template-columns:1fr 1fr}.rev-summary{grid-template-columns:1fr}.rev-card{grid-template-columns:1fr}.rev-status{justify-self:start}.rev-controls select{font-size:16px}}
  `;
  document.head.appendChild(s);
}

function buildShell(){
  const section=document.getElementById('v-diagnosis');
  if(!section)return false;
  if(section.dataset.revisionV2==='1')return true;
  section.dataset.revisionV2='1';
  section.innerHTML=`
    <div class="rev-hero">
      <span class="eyebrow" style="color:#e6c8c1">DRAFT → CHECK THE GAPS → REVISE ONE THING AT A TIME</span>
      <h1>修稿檢查</h1>
      <p>先完成初稿，再來找缺口。這裡不是替文章打分數，而是提醒你：故事現在缺的是畫面、衝突、行動、結果，還是理解？一次只補一兩項，不需要整篇重寫。</p>
      <div class="rev-flow">
        <div class="rev-flow-item"><b>1｜先寫完</b><span>先有一版正文，不要邊寫邊追求完美。</span></div>
        <div class="rev-flow-item"><b>2｜選一章</b><span>挑目前想修的章節，不用一次檢查整本書。</span></div>
        <div class="rev-flow-item"><b>3｜找缺口</b><span>看哪一兩項顯示「可再補強」。</span></div>
        <div class="rev-flow-item"><b>4｜回去補</b><span>只補那一項，再回來重新檢查。</span></div>
      </div>
    </div>
    <div class="rev-controls">
      <label><span>這次要檢查哪一章？</span><select id="revChapter"></select></label>
      <button class="btn primary" id="revRun" type="button">重新檢查</button>
      <button class="btn" id="revDemoBtn" type="button">看一個示範</button>
    </div>
    <div class="rev-demo" id="revDemo">
      <strong>示範：一段只有「事件摘要」的文字，可以怎麼修？</strong>
      <p><b>原稿：</b>我第一次獨自旅行時遇到很多臨時狀況，但最後還是順利完成旅程，也讓我變得更獨立。</p>
      <p><b>場景：</b>補一個具體時刻，例如抵達車站後才發現原本的計畫行不通。</p>
      <p><b>衝突：</b>說清楚當時真正的問題，例如時間有限、資訊不足，卻必須自己決定下一步。</p>
      <p><b>行動／結果：</b>寫你實際做了什麼，以及事情最後怎麼收尾。</p>
      <p><b>現在的理解：</b>不要只寫「我變獨立」，而是說明你今天如何重新理解那次選擇。</p>
    </div>
    <div id="revOutput"></div>`;
  document.getElementById('revRun')?.addEventListener('click',runCheck);
  document.getElementById('revDemoBtn')?.addEventListener('click',()=>document.getElementById('revDemo')?.classList.toggle('show'));
  document.getElementById('revChapter')?.addEventListener('change',e=>{selectedChapterId=e.target.value;runCheck()});
  return true;
}

function populateChapters(){
  const select=document.getElementById('revChapter');if(!select)return;
  const s=appState();const chapters=Array.isArray(s.chapters)?s.chapters:[];
  if(!chapters.length){select.innerHTML='<option value="">尚無章節</option>';return}
  const editorSelected=document.getElementById('chapterSelect')?.value;
  if(!selectedChapterId)selectedChapterId=editorSelected||chapters[0].id;
  if(!chapters.some(c=>c.id===selectedChapterId))selectedChapterId=chapters[0].id;
  select.innerHTML=chapters.map((c,i)=>`<option value="${esc(c.id)}"${c.id===selectedChapterId?' selected':''}>第 ${i+1} 章｜${esc(c.title||'未命名章節')}</option>`).join('');
}

function strength(text){
  const len=text.trim().length;
  if(!len)return 'empty';
  if(len<120)return 'short';
  return 'normal';
}

function runCheck(){
  populateChapters();
  const output=document.getElementById('revOutput');if(!output)return;
  const s=appState();const chapters=Array.isArray(s.chapters)?s.chapters:[];
  const chapter=chapters.find(c=>c.id===selectedChapterId)||chapters[0];
  if(!chapter){output.innerHTML='<div class="rev-empty">還沒有章節。先到「章節地圖」建立章節，再到「章節編輯器」寫一版正文。</div>';return}
  const text=String(chapter.draft||'');
  if(!text.trim()){
    output.innerHTML=`<div class="rev-empty"><strong>${esc(chapter.title||'這一章')}目前還沒有正文。</strong><br>修稿檢查最適合用在「已經有一版初稿」之後。先去章節編輯器寫一版，再回來檢查。</div>`;
    return;
  }
  const results=REVISION_CHECKS.map(check=>({...check,ok:!!check.test(text,s)}));
  const okCount=results.filter(x=>x.ok).length;
  const bodyStrength=strength(text);
  const statusText=bodyStrength==='short'?'正文還很短，結果僅供找方向':`目前抓到 ${okCount} / ${results.length} 項寫作線索`;
  output.innerHTML=`
    <div class="rev-summary">
      <div class="rev-score"><strong>${okCount} / ${results.length}</strong><small>${esc(statusText)}</small></div>
      <div class="rev-note"><strong>怎麼看這個結果？</strong><br>「已有線索」不代表寫得好，「可再補強」也不代表一定要補。程式只是用文字線索提醒你可能缺少哪一層。真正的判斷仍然是：這一段是否值得讀者停下來看，以及它是否服務這本書真正想說的事情。</div>
    </div>
    <div class="rev-cards">${results.map(r=>`
      <article class="rev-card">
        <div class="rev-title">${esc(r.title)}</div>
        <div><h3>${esc(r.question)}</h3><p>${esc(r.why)}</p><p class="rev-prompt">${esc(r.prompt)}</p></div>
        <span class="rev-status ${r.ok?'ok':bodyStrength==='short'?'partial':''}">${r.ok?'已有線索':'可再補強'}</span>
      </article>`).join('')}</div>`;
}

function init(){addStyles();if(!buildShell())return;populateChapters();runCheck()}
window.LifeArchiveRevisionEditor={run:runCheck};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
