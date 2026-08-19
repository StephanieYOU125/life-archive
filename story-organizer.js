const STORY_ORGANIZER_KEY='life-archive-story-organizer-v1';

const FOLLOW_UP_QUESTIONS=[
  '當時的我想要什麼？',
  '我原本相信什麼？',
  '發生了什麼問題或衝突？',
  '最困難的是外在事情，還是自己的內在拉扯？',
  '有沒有一個關鍵人物？',
  '有沒有一個關鍵場景或一句話？',
  '我當時做了什麼選擇？',
  '哪一刻事情開始改變？',
  '結果和原本期待的一樣嗎？',
  '這件事之後，我有什麼改變？',
  '現在的理解，是當時就知道，還是後來才形成的？',
  '哪些地方我的記憶其實不確定，需要再查證？'
];

function esc(value=''){
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function readOrganizer(){
  try{return JSON.parse(localStorage.getItem(STORY_ORGANIZER_KEY)||'{}')||{}}
  catch{return {}}
}

function saveOrganizer(data){
  localStorage.setItem(STORY_ORGANIZER_KEY,JSON.stringify(data));
  const saved=document.getElementById('organizerSaved');
  if(saved){saved.textContent='✓ 已儲存';setTimeout(()=>{if(document.contains(saved))saved.textContent='自動儲存在本機'},900)}
}

function cleanLines(value=''){
  return String(value).split(/\n+/).map(x=>x.trim()).filter(Boolean);
}

function collectForm(){
  const get=id=>document.getElementById(id)?.value?.trim()||'';
  return {
    topic:get('organizerTopic'),
    period:get('organizerPeriod'),
    fragments:get('organizerFragments'),
    feelings:get('organizerFeelings'),
    reflection:get('organizerReflection')
  };
}

function buildTimeline(data){
  const fragments=cleanLines(data.fragments);
  if(!fragments.length)return ['目前沒有可整理的事件片段。'];
  return fragments.map((text,index)=>`${index+1}. ${text}`);
}

function buildThemes(data){
  const explicit=[];
  const possible=[];
  if(data.topic)explicit.push(data.topic);
  if(data.feelings&&data.reflection)possible.push('當時感受與現在理解之間的變化（需要你再確認是否真的是這段故事的主題）');
  if(data.reflection)possible.push('這段經歷與現在理解之間的關係（需要你再確認）');
  if(!explicit.length)explicit.push('目前未提供明確主題。');
  if(!possible.length)possible.push('目前資料不足，不自行推測其他主題。');
  return {explicit,possible};
}

function prioritizedQuestions(data){
  const questions=[];
  if(!data.period)questions.push('這件事大約發生在哪一年、哪個人生階段？');
  if(!data.topic)questions.push('如果只用一句話說，這段經歷最想談的是什麼？');
  questions.push(...FOLLOW_UP_QUESTIONS);
  return [...new Set(questions)];
}

function renderOutput(){
  const data=collectForm();
  saveOrganizer(data);
  const timeline=buildTimeline(data);
  const themes=buildThemes(data);
  const questions=prioritizedQuestions(data);
  const period=data.period||'時間待確認';

  const out=document.getElementById('organizerOutput');
  if(!out)return;
  out.innerHTML=`
    <section class="organizer-result-card">
      <div class="organizer-result-head"><span>1</span><div><h3>事件時間線</h3><p>只依照你輸入片段的順序整理，不自行補時間或因果。</p></div></div>
      <div class="organizer-period">${esc(period)}</div>
      <ol class="organizer-timeline">${timeline.map(line=>`<li>${esc(line.replace(/^\d+\.\s*/,''))}</li>`).join('')}</ol>
      ${data.feelings?`<div class="organizer-source-note"><b>當時的感受</b><p>${esc(data.feelings).replace(/\n/g,'<br>')}</p></div>`:''}
      ${data.reflection?`<div class="organizer-source-note"><b>現在回頭看的理解</b><p>${esc(data.reflection).replace(/\n/g,'<br>')}</p></div>`:''}
    </section>
    <section class="organizer-result-card">
      <div class="organizer-result-head"><span>2</span><div><h3>可能的故事主題</h3><p>把「你明確提供的」和「仍需你確認的」分開。</p></div></div>
      <div class="organizer-theme-block"><b>明確可看出的主題</b>${themes.explicit.map(x=>`<p>• ${esc(x)}</p>`).join('')}</div>
      <div class="organizer-theme-block muted"><b>可能存在，但還需要確認</b>${themes.possible.map(x=>`<p>• ${esc(x)}</p>`).join('')}</div>
    </section>
    <section class="organizer-result-card">
      <div class="organizer-result-head"><span>3</span><div><h3>還可以追問自己的問題</h3><p>這些問題只用來找回記憶與脈絡，不代表答案一定存在。</p></div></div>
      <div class="organizer-questions">${questions.map(q=>`<label><input type="checkbox"> <span>${esc(q)}</span></label>`).join('')}</div>
    </section>`;
  document.getElementById('organizerCopy')?.removeAttribute('disabled');
}

function plainTextResult(){
  const data=collectForm();
  const timeline=buildTimeline(data);
  const themes=buildThemes(data);
  const questions=prioritizedQuestions(data);
  return [
    '【原始資料】',
    `主題：${data.topic||'未填'}`,
    `年份或人生階段：${data.period||'時間待確認'}`,
    `我當時的感受：${data.feelings||'未填'}`,
    `現在回頭看的理解：${data.reflection||'未填'}`,
    '',
    '1. 事件時間線',
    ...timeline,
    '',
    '2. 可能的故事主題',
    '明確可看出的主題：',
    ...themes.explicit.map(x=>`- ${x}`),
    '可能存在，但還需要確認：',
    ...themes.possible.map(x=>`- ${x}`),
    '',
    '3. 還可以追問自己的問題',
    ...questions.map(x=>`- ${x}`)
  ].join('\n');
}

async function copyResult(){
  try{
    await navigator.clipboard.writeText(plainTextResult());
    const b=document.getElementById('organizerCopy');
    if(b){const old=b.textContent;b.textContent='✓ 已複製';setTimeout(()=>b.textContent=old,1000)}
  }catch{alert('無法自動複製，請手動選取內容。')}
}

function resetOrganizer(){
  if(!confirm('清空目前這份人生故事整理？'))return;
  ['organizerTopic','organizerPeriod','organizerFragments','organizerFeelings','organizerReflection'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  localStorage.removeItem(STORY_ORGANIZER_KEY);
  const out=document.getElementById('organizerOutput');if(out)out.innerHTML='<div class="organizer-empty">填寫左側資料後，按「整理脈絡」。</div>';
  document.getElementById('organizerCopy')?.setAttribute('disabled','');
}

function injectStyles(){
  if(document.getElementById('storyOrganizerStyles'))return;
  const style=document.createElement('style');
  style.id='storyOrganizerStyles';
  style.textContent=`
  #v-story-organizer{max-width:1260px}.organizer-hero{background:linear-gradient(145deg,#2b2623,#473435);color:#fff;border-radius:24px;padding:27px 29px;margin-bottom:16px}.organizer-hero .eyebrow{color:#e6c8c1}.organizer-hero h1{font-family:Georgia,"Noto Serif TC",serif;font-size:36px;margin:7px 0 9px}.organizer-hero p{color:#d9cfca;line-height:1.75;margin:0;max-width:800px}.organizer-rule{margin-top:14px;display:inline-flex;gap:7px;align-items:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:7px 11px;font-size:10px;color:#e3d7d1}
  .organizer-layout{display:grid;grid-template-columns:minmax(360px,.8fr) minmax(420px,1.2fr);gap:15px;align-items:start}.organizer-form,.organizer-results{display:grid;gap:11px}.organizer-card{background:var(--panel);border:1px solid var(--line);border-radius:17px;padding:18px}.organizer-card h2{font-family:Georgia,"Noto Serif TC",serif;font-size:20px;margin:0 0 5px}.organizer-card>p{color:var(--muted);font-size:11px;line-height:1.65;margin:0 0 14px}.organizer-field{display:grid;gap:6px;margin-bottom:12px}.organizer-field span{font-size:11px;color:var(--muted);font-weight:800}.organizer-field small{font-size:9px;color:#9a9087;line-height:1.5}.organizer-field input,.organizer-field textarea{width:100%;border:1px solid #dfd5cb;border-radius:10px;background:#fff;padding:10px 11px;color:var(--ink);line-height:1.65}.organizer-field textarea{resize:vertical;min-height:105px}.organizer-field.fragments textarea{min-height:180px}.organizer-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:4px}.organizer-save{font-size:9px;color:var(--muted);margin-left:auto}
  .organizer-result-card{background:var(--panel);border:1px solid var(--line);border-radius:17px;padding:17px}.organizer-result-head{display:flex;gap:10px;align-items:flex-start;margin-bottom:12px}.organizer-result-head>span{width:26px;height:26px;border-radius:9px;background:var(--soft);color:var(--accent);display:grid;place-items:center;font-size:11px;font-weight:900;flex:0 0 auto}.organizer-result-head h3{margin:1px 0 3px;font-size:15px}.organizer-result-head p{margin:0;color:var(--muted);font-size:10px;line-height:1.55}.organizer-period{font-size:10px;font-weight:800;color:var(--accent);margin:3px 0 9px}.organizer-timeline{margin:0;padding-left:22px}.organizer-timeline li{padding:6px 0 9px 5px;line-height:1.65;font-size:12px;border-bottom:1px solid #eee7df}.organizer-timeline li:last-child{border-bottom:0}.organizer-source-note{margin-top:10px;border-left:3px solid #d5c0bc;padding:8px 10px;background:#faf6f1;border-radius:0 9px 9px 0}.organizer-source-note b,.organizer-theme-block b{font-size:10px;color:var(--accent)}.organizer-source-note p,.organizer-theme-block p{margin:5px 0 0;font-size:11px;line-height:1.65}.organizer-theme-block{padding:10px 11px;background:#faf6f1;border-radius:10px;margin-top:7px}.organizer-theme-block.muted{background:#f5f2ee}.organizer-theme-block.muted b{color:#746b64}.organizer-questions{display:grid;gap:7px}.organizer-questions label{display:flex;gap:7px;align-items:flex-start;padding:7px 9px;border:1px solid #eee5dc;border-radius:9px;background:#fff;font-size:11px;line-height:1.55}.organizer-questions input{margin-top:2px}.organizer-empty{padding:40px 20px;border:1px dashed var(--line);border-radius:15px;text-align:center;color:var(--muted);background:rgba(255,253,249,.55);font-size:12px}.organizer-output-actions{display:flex;justify-content:flex-end;margin-bottom:-2px}
  @media(max-width:900px){.organizer-layout{grid-template-columns:1fr}.organizer-hero{padding:22px 20px}.organizer-hero h1{font-size:29px}.organizer-field input,.organizer-field textarea{font-size:16px}.organizer-save{width:100%;margin-left:0}}
  `;
  document.head.appendChild(style);
}

function makeView(){
  if(document.getElementById('v-story-organizer'))return;
  const main=document.querySelector('main.main');if(!main)return;
  const section=document.createElement('section');
  section.className='view';section.id='v-story-organizer';
  section.innerHTML=`
    <div class="organizer-hero"><span class="eyebrow">LIFE STORY · FACT FIRST</span><h1>人生故事整理器</h1><p>先整理脈絡，不急著寫成文章。這裡不美化、不補你沒提供的細節，也不把後來的理解假裝成當時就知道。</p><div class="organizer-rule">原始記憶 → 時間線 → 主題候選 → 追問自己</div></div>
    <div class="organizer-layout">
      <div class="organizer-form"><section class="organizer-card"><h2>把記得的先放進來</h2><p>不需要完整。零碎片段也可以；每個事件片段建議換一行。</p>
        <label class="organizer-field"><span>主題</span><input id="organizerTopic" placeholder="不知道也可以先留白"></label>
        <label class="organizer-field"><span>年份或人生階段</span><input id="organizerPeriod" placeholder="例：2015–2018／警大時期／研究所第二年"></label>
        <label class="organizer-field fragments"><span>我記得的片段</span><small>一個片段一行；整理時會保留你輸入的先後順序。</small><textarea id="organizerFragments" placeholder="片段 1\n片段 2\n片段 3"></textarea></label>
        <label class="organizer-field"><span>我當時的感受</span><textarea id="organizerFeelings" placeholder="只寫你記得的感受，不需要解釋得很漂亮。"></textarea></label>
        <label class="organizer-field"><span>現在回頭看的理解</span><textarea id="organizerReflection" placeholder="這是現在的理解，可以和當時感受不同。"></textarea></label>
        <div class="organizer-actions"><button class="btn primary" id="organizerRun">整理脈絡</button><button class="btn" id="organizerReset">清空</button><span class="organizer-save" id="organizerSaved">自動儲存在本機</span></div>
      </section></div>
      <div class="organizer-results"><div class="organizer-output-actions"><button class="btn" id="organizerCopy" disabled>複製整理結果</button></div><div id="organizerOutput"><div class="organizer-empty">填寫左側資料後，按「整理脈絡」。</div></div></div>
    </div>`;
  const materials=document.getElementById('v-materials');
  if(materials)materials.insertAdjacentElement('afterend',section);else main.appendChild(section);
}

function openOrganizer(){
  makeView();
  window.LifeArchiveNavigate?.('story-organizer');
  const crumb=document.getElementById('crumb');if(crumb)crumb.textContent='人生故事整理器';
  document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.v==='story-organizer'));
  document.getElementById('side')?.classList.remove('open');
}

let navUpdating=false;
function ensureNavButton(){
  if(navUpdating)return;
  const nav=document.getElementById('nav');if(!nav||nav.querySelector('[data-v="story-organizer"]'))return;
  navUpdating=true;
  const button=document.createElement('button');button.type='button';button.dataset.v='story-organizer';button.textContent='◈ 人生故事整理器';button.addEventListener('click',openOrganizer);
  const materials=nav.querySelector('[data-v="materials"]');
  if(materials)materials.insertAdjacentElement('afterend',button);else nav.appendChild(button);
  navUpdating=false;
}

function bind(){
  const saved=readOrganizer();
  const map={organizerTopic:'topic',organizerPeriod:'period',organizerFragments:'fragments',organizerFeelings:'feelings',organizerReflection:'reflection'};
  Object.entries(map).forEach(([id,key])=>{
    const el=document.getElementById(id);if(!el)return;el.value=saved[key]||'';
    let timer;el.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>saveOrganizer(collectForm()),250)});
  });
  document.getElementById('organizerRun')?.addEventListener('click',renderOutput);
  document.getElementById('organizerCopy')?.addEventListener('click',copyResult);
  document.getElementById('organizerReset')?.addEventListener('click',resetOrganizer);
  if(saved.topic||saved.period||saved.fragments||saved.feelings||saved.reflection)renderOutput();
}

function init(){
  injectStyles();makeView();bind();ensureNavButton();
  const nav=document.getElementById('nav');
  if(nav)new MutationObserver(()=>setTimeout(ensureNavButton,0)).observe(nav,{childList:true,subtree:false});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

window.LifeArchiveStoryOrganizer={open:openOrganizer,render:renderOutput};
