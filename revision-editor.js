const REVISION_CHECKS=[
  {
    key:'scene',label:'進入現場',short:'場景',icon:'◉',
    question:'讀者知道事情在哪裡發生、你正在做什麼嗎？',
    why:'先讓讀者站到你身邊，再談後來的理解。',
    prompt:'先抓一個具體時刻：時間、地點、人物與正在發生的動作。',
    test:text=>/(那天|當時|那時|早上|晚上|下午|凌晨|走進|走到|站在|坐在|看見|看到|聽見|拿著|打開|穿著|現場|辦公室|教室|車上|路口|房間|機場|車站|月台|門口|走廊)/.test(text)
  },
  {
    key:'conflict',label:'發生問題',short:'衝突',icon:'↯',
    question:'這個故事裡，真正讓你卡住、必須選擇或改變的是什麼？',
    why:'沒有拉扯，故事容易只剩下「事情的紀錄」。',
    prompt:'試著寫成：我原本以為……但……／我必須在 A 與 B 之間決定……',
    test:text=>/(但是|但我|然而|卻|困難|問題|衝突|壓力|風險|擔心|害怕|猶豫|不知道|必須|沒想到|來不及|無法|失敗|限制|兩難)/.test(text)
  },
  {
    key:'action',label:'做出行動',short:'行動',icon:'→',
    question:'面對問題，你實際做了什麼？',
    why:'讓讀者看見選擇發生的瞬間，而不是只讀到你的結論。',
    prompt:'可以補：我先……接著……／我決定……／我去詢問……／我改變了……',
    test:text=>/(我先|我開始|我決定|我選擇|我去|我把|我問|我詢問|我聯絡|我嘗試|我改|我提出|我回到|我繼續|於是我|因此我|接著我)/.test(text)
  },
  {
    key:'result',label:'事情落地',short:'結果',icon:'✓',
    question:'事情最後怎麼收尾？結果和你原本預期一樣嗎？',
    why:'結果讓故事有落點，也讓後面的反思有依據。',
    prompt:'可以補：最後……／結果……／事情沒有如我預期……／這個選擇帶來……',
    test:text=>/(最後|結果|最終|因此|後來|成功|失敗|完成|獲得|得到|改善|改變|沒有如|沒有成功|達成|解決)/.test(text)
  },
  {
    key:'then',label:'回到當時',short:'當時的我',icon:'♡',
    question:'當時的你在怕什麼、相信什麼、期待什麼？',
    why:'真正讓「事件」變成「你的故事」的是當時那個人的內在世界。',
    prompt:'可以補：當時我以為……／我那時最在意的是……／我其實有點……',
    test:text=>/(當時我|那時我|我以為|我覺得|我認為|我擔心|我害怕|我期待|我希望|我在意|我很|我其實|對我來說)/.test(text)
  },
  {
    key:'now',label:'重新理解',short:'現在的理解',icon:'◎',
    question:'如果今天重新看這件事，你的理解有什麼不同？',
    why:'回顧型作品最有價值的地方，常常不是發生了什麼，而是你現在怎麼看。',
    prompt:'可以補：後來我才理解……／現在回頭看……／原來……／我重新定義了……',
    test:text=>/(後來我才|現在回頭看|現在我|我才發現|我發現|我理解|我開始理解|原來|重新理解|重新看|重新定義|我學會|讓我明白)/.test(text)
  },
  {
    key:'theme',label:'留下意義',short:'全書連結',icon:'✦',
    question:'這個故事為什麼值得放進這本書，而不只是留在日記裡？',
    why:'不是每段人生都要變成章節；這一項幫你確認它和全書真正想說的事情有沒有關係。',
    prompt:'可以補：這件事讓我開始思考……／它和這本書想談的……有關／這成為我之後……的起點。',
    test:(text,state)=>{
      const proposal=state?.publishingProposal||{};
      const anchors=[state?.core,proposal?.concept,proposal?.oneLiner,proposal?.claims].filter(Boolean).join(' ');
      if(!anchors.trim())return /(這本書|人生|選擇|嘗試|系統|安全|方向|成長|理解自己|後來的我|成為|開始思考)/.test(text);
      const words=anchors.replace(/[，。！？、；：「」『』（）()]/g,' ').split(/\s+/).filter(x=>x.length>=2).slice(0,24);
      return words.some(w=>text.includes(w))||/(這本書|這件事讓我|成為.*起點|開始思考)/.test(text);
    }
  }
];

const SCENE_DETAILS=[
  {key:'visual',icon:'👁',label:'看見',hint:'光線、顏色、空間、人物、位置',test:text=>/(看見|看到|眼前|燈|光|黑|亮|顏色|紅色|白色|制服|天空|月台|螢幕|車燈|人群|桌上|窗外|門口)/.test(text)},
  {key:'sound',icon:'👂',label:'聽見',hint:'廣播、車聲、腳步、對話、環境聲',test:text=>/(聽見|聽到|聲音|廣播|車聲|腳步|鈴聲|喊|說道|問我|電話|警笛|喇叭|雨聲)/.test(text)},
  {key:'movement',icon:'✋',label:'動作',hint:'手、腳、視線、移動與當下反應',test:text=>/(拿著|握著|拖著|跑|走|停下|回頭|抬頭|低頭|打開|關上|按下|翻開|看著|盯著|伸手|坐下|站起|騎著)/.test(text)},
  {key:'object',icon:'◇',label:'物件',hint:'能代表那個時刻的一個具體東西',test:text=>/(手機|行李|制服|指揮棒|交通錐|文件|筆記|電腦|車票|地圖|鑰匙|雨傘|杯子|書|背包|螢幕|警車|冰箱|桌子)/.test(text)},
  {key:'body',icon:'♥',label:'身體',hint:'心跳、呼吸、手汗、疲累、冷熱、疼痛',test:text=>/(心跳|呼吸|手汗|發抖|顫抖|疲累|疲憊|累|冷|熱|發燙|胸口|胃|頭痛|僵住|緊繃|冒汗|喘)/.test(text)}
];

let selectedChapterId='';

function appState(){
  if(window.LifeArchiveStateBridge?.get)return window.LifeArchiveStateBridge.get()||{};
  try{return JSON.parse(localStorage.getItem('life-archive-writing-studio-v1')||'{}')||{}}catch{return {}}
}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function addStyles(){
  if(document.getElementById('revisionEditorStyles'))return;
  const s=document.createElement('style');s.id='revisionEditorStyles';
  s.textContent=`
    #v-diagnosis{max-width:1180px}
    .rev-studio-hero{position:relative;overflow:hidden;background:linear-gradient(145deg,#2b2623,#463334);color:#fff;border-radius:25px;padding:29px 31px;margin-bottom:14px;box-shadow:0 16px 42px rgba(50,40,30,.09)}
    .rev-studio-hero:after{content:'✎';position:absolute;right:25px;top:5px;font-family:Georgia,serif;font-size:115px;color:rgba(255,255,255,.035);transform:rotate(-8deg)}
    .rev-studio-hero h1{font-family:Georgia,"Noto Serif TC",serif;font-size:37px;margin:7px 0 9px;position:relative;z-index:1}.rev-studio-hero>p{max-width:800px;color:#ddd3ce;line-height:1.8;margin:0;position:relative;z-index:1}
    .rev-micro{font-size:10px;letter-spacing:.15em;color:#e5c5bf;font-weight:900}.rev-philosophy{display:flex;gap:8px;flex-wrap:wrap;margin-top:17px;position:relative;z-index:1}.rev-philosophy span{font-size:10px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.1);padding:6px 9px;border-radius:999px;color:#ddd3ce}
    .rev-toolbar{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:14px 15px;display:flex;gap:9px;align-items:end;flex-wrap:wrap;margin-bottom:13px}.rev-toolbar label{display:grid;gap:5px;flex:1;min-width:250px}.rev-toolbar label span{font-size:10px;font-weight:900;color:var(--muted);letter-spacing:.04em}.rev-toolbar select{width:100%;border:1px solid var(--line);background:#fff;border-radius:10px;padding:10px 11px}
    .rev-story-map{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:17px 18px;margin-bottom:13px}.rev-map-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:14px}.rev-map-head strong{font-family:Georgia,"Noto Serif TC",serif;font-size:18px}.rev-map-head span{font-size:11px;color:var(--muted)}.rev-path{display:grid;grid-template-columns:repeat(7,1fr);position:relative}.rev-path:before{content:'';position:absolute;left:6%;right:6%;top:17px;height:1px;background:var(--line)}.rev-node{position:relative;z-index:1;text-align:center}.rev-dot{width:34px;height:34px;margin:0 auto 7px;border-radius:50%;border:1px solid var(--line);background:#f7f3ed;display:grid;place-items:center;color:#9b9189;font-size:12px;font-weight:900}.rev-node.ok .rev-dot{background:#e6efe7;border-color:#cadecf;color:#356044}.rev-node.need .rev-dot{background:#f5e8e9;border-color:#dfc5c9;color:var(--accent)}.rev-node b{display:block;font-size:10px}.rev-node small{font-size:9px;color:var(--muted)}
    .rev-focus-label{display:flex;justify-content:space-between;gap:12px;align-items:end;margin:19px 1px 9px}.rev-focus-label h2{font-family:Georgia,"Noto Serif TC",serif;font-size:22px;margin:0}.rev-focus-label p{font-size:11px;color:var(--muted);margin:0}
    .rev-focus-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.rev-focus-card{background:var(--panel);border:1px solid var(--line);border-radius:19px;padding:18px;position:relative;overflow:hidden}.rev-focus-card.priority{border-color:#d8b7bd;box-shadow:0 10px 26px rgba(96,55,62,.06)}.rev-focus-card .rev-num{font-size:9px;letter-spacing:.12em;color:var(--accent);font-weight:900}.rev-focus-card h3{font-family:Georgia,"Noto Serif TC",serif;font-size:19px;margin:5px 0 7px}.rev-focus-card>p{font-size:12px;line-height:1.7;color:#5f5650;margin:0}.rev-why{margin-top:10px;padding:10px 11px;border-radius:11px;background:#f8f5f0;font-size:11px!important;color:var(--muted)!important}.rev-status-pill{position:absolute;right:14px;top:14px;font-size:9px;font-weight:900;border-radius:999px;padding:5px 8px;background:#f1e3e5;color:var(--accent)}
    .rev-cinema{grid-column:1/-1;background:linear-gradient(135deg,#fffdf9,#f7f0eb);border:1px solid #d9c6ba;border-radius:20px;padding:19px}.rev-cinema-head{display:grid;grid-template-columns:46px 1fr;gap:12px;align-items:center}.rev-clapper{width:46px;height:46px;border-radius:13px;background:#2c2825;color:#fff;display:grid;place-items:center;font-size:20px}.rev-cinema h3{margin:0 0 4px;font-family:Georgia,"Noto Serif TC",serif;font-size:20px}.rev-cinema-head p{margin:0;color:var(--muted);font-size:11px;line-height:1.6}.rev-senses{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:13px}.rev-sense{background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px}.rev-sense.detected{background:#edf3ed;border-color:#d3e2d5}.rev-sense b{display:block;font-size:11px;margin-bottom:3px}.rev-sense span{font-size:9px;color:var(--muted);line-height:1.45}.rev-cinema-note{margin-top:11px;font-size:10px;color:#796c64;background:#f3ebe4;border-radius:10px;padding:9px 10px}.rev-cinema-note strong{color:var(--accent)}
    .rev-example{display:none;margin-top:13px;border-top:1px dashed #d7c8be;padding-top:13px}.rev-example.show{display:block}.rev-example-grid{display:grid;grid-template-columns:1fr 35px 1fr;gap:9px;align-items:stretch}.rev-example-box{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px}.rev-example-box small{display:block;color:var(--accent);font-size:9px;font-weight:900;margin-bottom:5px}.rev-example-box p{margin:0;font-size:11px;line-height:1.75;color:#514a45}.rev-arrow{display:grid;place-items:center;color:var(--muted)}.rev-example-tip{font-size:10px;color:var(--muted);line-height:1.65;margin-top:8px}
    .rev-existing{margin-top:14px}.rev-existing details{background:var(--panel);border:1px solid var(--line);border-radius:16px}.rev-existing summary{padding:14px 16px;cursor:pointer;font-size:12px;font-weight:900}.rev-existing-list{padding:0 14px 14px;display:grid;gap:7px}.rev-mini{display:grid;grid-template-columns:110px 1fr auto;gap:10px;align-items:start;border-top:1px solid #eee6dc;padding:10px 2px 2px}.rev-mini:first-child{border-top:0}.rev-mini b{font-size:11px}.rev-mini p{margin:0;font-size:10px;line-height:1.6;color:var(--muted)}.rev-mini span{font-size:9px;border-radius:999px;padding:4px 7px;background:#e6efe7;color:#356044;font-weight:900}.rev-empty{background:var(--panel);border:1px dashed var(--line);border-radius:17px;padding:29px;text-align:center;color:var(--muted);line-height:1.8}
    @media(max-width:850px){.rev-studio-hero{padding:22px 20px}.rev-studio-hero h1{font-size:29px}.rev-story-map{overflow-x:auto}.rev-path{min-width:620px}.rev-focus-grid{grid-template-columns:1fr}.rev-senses{grid-template-columns:repeat(2,1fr)}.rev-example-grid{grid-template-columns:1fr}.rev-arrow{transform:rotate(90deg);min-height:24px}.rev-mini{grid-template-columns:1fr auto}.rev-mini p{grid-column:1/-1}.rev-toolbar select{font-size:16px}.rev-cinema{grid-column:1}}
  `;
  document.head.appendChild(s);
}

function buildShell(){
  const section=document.getElementById('v-diagnosis');if(!section)return false;
  section.dataset.revisionV3='1';
  section.innerHTML=`
    <div class="rev-studio-hero">
      <div class="rev-micro">REVISION STUDIO · SEE → FEEL → UNDERSTAND</div>
      <h1>修稿工作室</h1>
      <p>修稿不是把文章變得更漂亮，而是讓讀者更靠近當時的你。先看見畫面，再感受到拉扯，最後才理解這段經歷為什麼值得留下。</p>
      <div class="rev-philosophy"><span>一次只修 1–2 件事</span><span>不是 7 項都要滿分</span><span>具體細節比形容詞更有畫面</span></div>
    </div>
    <div class="rev-toolbar">
      <label><span>正在修哪一章？</span><select id="revChapter"></select></label>
      <button class="btn primary" id="revRun" type="button">重新讀這一章</button>
      <button class="btn" id="revBackEditor" type="button">回章節編輯器</button>
    </div>
    <div id="revOutput"></div>`;
  document.getElementById('revRun')?.addEventListener('click',runCheck);
  document.getElementById('revBackEditor')?.addEventListener('click',openSelectedInEditor);
  document.getElementById('revChapter')?.addEventListener('change',e=>{selectedChapterId=e.target.value;runCheck()});
  return true;
}

function populateChapters(){
  const select=document.getElementById('revChapter');if(!select)return;
  const chapters=Array.isArray(appState().chapters)?appState().chapters:[];
  if(!chapters.length){select.innerHTML='<option value="">尚無章節</option>';return}
  const editorSelected=document.getElementById('chapterSelect')?.value;
  if(!selectedChapterId)selectedChapterId=editorSelected||chapters[0].id;
  if(!chapters.some(c=>String(c.id)===String(selectedChapterId)))selectedChapterId=chapters[0].id;
  select.innerHTML=chapters.map((c,i)=>`<option value="${esc(c.id)}"${String(c.id)===String(selectedChapterId)?' selected':''}>第 ${i+1} 章｜${esc(c.title||'未命名章節')}</option>`).join('');
}

function openSelectedInEditor(){
  if(!selectedChapterId)return;
  window.LifeArchiveNavigate?.('editor');
  requestAnimationFrame(()=>{
    const select=document.getElementById('chapterSelect');
    if(!select)return;
    select.value=String(selectedChapterId);
    select.dispatchEvent(new Event('change',{bubbles:true}));
  });
}

function sceneDetailResults(text){return SCENE_DETAILS.map(x=>({...x,ok:!!x.test(text)}))}
function pathHtml(results){return `<div class="rev-path">${results.map(r=>`<div class="rev-node ${r.ok?'ok':'need'}"><div class="rev-dot">${r.ok?'✓':esc(r.icon)}</div><b>${esc(r.label)}</b><small>${r.ok?'已有線索':'可再補'}</small></div>`).join('')}</div>`}

function cinemaCard(details){
  const count=details.filter(x=>x.ok).length;
  return `<article class="rev-cinema">
    <div class="rev-cinema-head"><div class="rev-clapper">🎬</div><div><h3>畫面細節｜如果這是一幕電影，鏡頭先拍到什麼？</h3><p>不用把五感全部寫進去。挑 1–2 個你真的記得的細節，就比「我很緊張／我很開心」更能把讀者帶進現場。</p></div></div>
    <div class="rev-senses">${details.map(d=>`<div class="rev-sense ${d.ok?'detected':''}"><b>${d.icon} ${esc(d.label)} ${d.ok?'✓':''}</b><span>${esc(d.hint)}</span></div>`).join('')}</div>
    <div class="rev-cinema-note">目前抓到 <strong>${count} 種</strong>畫面線索。${count<2?'這一輪可以先挑一個「物件」或「動作」補進去；不用硬湊五種感官。':'已經有一些可見的細節，不必再堆更多形容詞；確認它們是不是故事真正重要的東西。'}</div>
    <button class="btn" id="revSceneExampleBtn" type="button" style="margin-top:11px">看看「摘要 → 畫面」示範</button>
    <div class="rev-example" id="revSceneExample">
      <div class="rev-example-grid"><div class="rev-example-box"><small>摘要版</small><p>那天我第一次一個人到陌生城市，覺得很緊張。</p></div><div class="rev-arrow">→</div><div class="rev-example-box"><small>有畫面的版本</small><p>車門關上後，我站在月台上看著列車離開。四周的站名我一個也不熟，手裡只剩手機上那張剛截下來的地圖。</p></div></div>
      <div class="rev-example-tip">不是因為用了更多漂亮形容詞，而是多了「列車離開、陌生站名、手機地圖」三個具體東西。</div>
    </div>
  </article>`;
}

function focusCard(r,index){return `<article class="rev-focus-card priority"><span class="rev-status-pill">這輪先修</span><div class="rev-num">FOCUS ${index+1}</div><h3>${esc(r.icon)} ${esc(r.short)}</h3><p><strong>${esc(r.question)}</strong></p><p class="rev-why">${esc(r.prompt)}</p></article>`}

function runCheck(){
  populateChapters();
  const output=document.getElementById('revOutput');if(!output)return;
  const s=appState();const chapters=Array.isArray(s.chapters)?s.chapters:[];
  const chapter=chapters.find(c=>String(c.id)===String(selectedChapterId))||chapters[0];
  if(!chapter){output.innerHTML='<div class="rev-empty">還沒有章節。先到「章節地圖」建立章節，再到「章節編輯器」寫一版正文。</div>';return}
  const text=String(chapter.draft||'');
  if(!text.trim()){
    output.innerHTML=`<div class="rev-empty"><strong>${esc(chapter.title||'這一章')}目前還沒有正文。</strong><br>修稿最適合發生在「已經有一版不完美的初稿」之後。先寫，再回來看缺口。</div>`;
    return;
  }
  const results=REVISION_CHECKS.map(x=>({...x,ok:!!x.test(text,s)}));
  const details=sceneDetailResults(text);const detailCount=details.filter(x=>x.ok).length;
  const okCount=results.filter(x=>x.ok).length;
  let priorities=results.filter(x=>!x.ok);
  const sceneNeedsDetail=detailCount<2;
  if(sceneNeedsDetail&&priorities[0]?.key==='scene')priorities=priorities.filter(x=>x.key!=='scene');
  priorities=priorities.slice(0,sceneNeedsDetail?1:2);
  const allStrong=!sceneNeedsDetail&&priorities.length===0;
  const focusHtml=allStrong?`<article class="rev-focus-card"><div class="rev-num">THIS ROUND</div><h3>✓ 先不要為了修而修</h3><p>這一章已經找到多種故事線索。下一輪可以改成讀節奏、刪重複，或請另一個人只告訴你「哪一段最有感覺、哪一段開始失去注意力」。</p></article>`:priorities.map(focusCard).join('');
  const existing=results.filter(x=>x.ok);
  output.innerHTML=`
    <section class="rev-story-map"><div class="rev-map-head"><strong>${esc(chapter.title||'這一章')}的故事路徑</strong><span>目前找到 ${okCount} 種故事線索｜不是分數</span></div>${pathHtml(results)}</section>
    <div class="rev-focus-label"><div><h2>本輪只修 ${allStrong?'一件事':sceneNeedsDetail&&priorities.length?'兩件事':'一到兩件事'}</h2><p>先處理最會改變閱讀感受的地方，不必一次把整篇翻修。</p></div></div>
    <div class="rev-focus-grid">${sceneNeedsDetail?cinemaCard(details):''}${focusHtml}</div>
    <div class="rev-existing"><details><summary>已有線索 ${existing.length} 項｜展開看完整檢查</summary><div class="rev-existing-list">${results.map(r=>`<div class="rev-mini"><b>${esc(r.short)}</b><p>${esc(r.ok?r.why:r.prompt)}</p><span style="${r.ok?'':'background:#f1e3e5;color:var(--accent)'}">${r.ok?'已有線索':'可再補'}</span></div>`).join('')}</div></details></div>`;
  document.getElementById('revSceneExampleBtn')?.addEventListener('click',()=>document.getElementById('revSceneExample')?.classList.toggle('show'));
}

function init(){addStyles();if(!buildShell())return;populateChapters();runCheck()}
window.LifeArchiveRevisionEditor={run:runCheck};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
