(()=>{
  const STORY_KEY='life-archive-story-organizer-v1';
  const WRITING_KEY='life-archive-writing-studio-v1';
  const QUESTIONS=[
    '當時的我想要什麼？','我原本相信什麼？','發生了什麼問題或衝突？','最困難的是外在事情，還是自己的內在拉扯？','有沒有一個關鍵人物？','有沒有一個關鍵場景或一句話？','我當時做了什麼選擇？','哪一刻事情開始改變？','結果和原本期待的一樣嗎？','這件事之後，我有什麼改變？','現在的理解，是當時就知道，還是後來才形成的？','哪些地方我的記憶其實不確定，需要再查證？'
  ];

  function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
  function readStory(){try{return JSON.parse(localStorage.getItem(STORY_KEY)||'{}')||{}}catch{return {}}}
  function saveStory(data){localStorage.setItem(STORY_KEY,JSON.stringify(data));const s=document.getElementById('mowSaved');if(s){s.textContent='✓ 已儲存';setTimeout(()=>{if(document.contains(s))s.textContent='自動儲存在本機'},800)}}
  function readWriting(){try{return JSON.parse(localStorage.getItem(WRITING_KEY)||'{}')||{}}catch{return {}}}
  function writeWriting(state){localStorage.setItem(WRITING_KEY,JSON.stringify(state))}
  function lines(v=''){return String(v).split(/\n+/).map(x=>x.trim()).filter(Boolean)}
  function get(id){return document.getElementById(id)?.value?.trim()||''}
  function data(){return {topic:get('mowTopic'),period:get('mowPeriod'),fragments:get('mowFragments'),feelings:get('mowFeelings'),reflection:get('mowReflection')}}

  function themes(d){
    const explicit=d.topic?[d.topic]:['目前未提供明確主題。'];
    const possible=[];
    if(d.feelings&&d.reflection)possible.push('當時感受與現在理解之間的變化（需要你再確認）');
    else if(d.reflection)possible.push('這段經歷與現在理解之間的關係（需要你再確認）');
    if(!possible.length)possible.push('目前資料不足，不自行推測其他主題。');
    return {explicit,possible};
  }

  function renderResult(){
    const d=data();saveStory(d);const events=lines(d.fragments);const t=themes(d);const out=document.getElementById('mowOutput');if(!out)return;
    out.innerHTML=`
      <section class="mow-result"><div class="mow-result-head"><b>1｜事件時間線</b><small>只依你輸入的順序，不補因果。</small></div><div class="mow-period">${esc(d.period||'時間待確認')}</div>${events.length?`<ol>${events.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:'<p class="mow-muted">目前沒有事件片段。</p>'}${d.feelings?`<div class="mow-note"><strong>當時感受</strong><p>${esc(d.feelings).replace(/\n/g,'<br>')}</p></div>`:''}${d.reflection?`<div class="mow-note"><strong>現在理解</strong><p>${esc(d.reflection).replace(/\n/g,'<br>')}</p></div>`:''}</section>
      <section class="mow-result"><div class="mow-result-head"><b>2｜可能的故事主題</b><small>明確內容和待確認推測分開。</small></div><div class="mow-theme"><strong>明確可看出的主題</strong>${t.explicit.map(x=>`<p>• ${esc(x)}</p>`).join('')}</div><div class="mow-theme muted"><strong>可能存在，但還需要確認</strong>${t.possible.map(x=>`<p>• ${esc(x)}</p>`).join('')}</div></section>
      <section class="mow-result"><div class="mow-result-head"><b>3｜還可以追問自己</b><small>用來找回記憶，不代表答案一定存在。</small></div><div class="mow-questions">${QUESTIONS.map(q=>`<label><input type="checkbox"><span>${esc(q)}</span></label>`).join('')}</div></section>`;
  }

  function createMaterial(){
    const d=data();
    if(!d.fragments){alert('請先填寫「我記得的片段」。');return}
    const state=readWriting();const materials=Array.isArray(state.materials)?state.materials:[];
    materials.push({
      id:uid(),title:d.topic||d.period||'未命名人生故事',content:lines(d.fragments).join('\n'),time:d.period||'',timePrecision:d.period?'約略時間':'待確認',tags:d.topic||'',stage:'靈感箱',chapterId:'',timelineId:'',evidence:'',feelings:d.feelings||'',reflection:d.reflection||'',source:'素材整理台｜人生經歷'
    });
    state.materials=materials;writeWriting(state);window.LifeArchiveDashboard?.render?.();
    const b=document.getElementById('mowCreate');if(b){const old=b.textContent;b.textContent='✓ 已建立素材';setTimeout(()=>{if(document.contains(b))b.textContent=old},1200)}
  }

  function addStyles(){
    if(document.getElementById('materialOrganizerWorkbenchStyles'))return;
    const s=document.createElement('style');s.id='materialOrganizerWorkbenchStyles';s.textContent=`
      #v-triage{max-width:1260px}.mow-hero{background:linear-gradient(145deg,#292522,#493638);color:#fff;border-radius:24px;padding:27px 29px;margin-bottom:14px}.mow-hero .eyebrow{color:#e7c8c1}.mow-hero h1{font-family:Georgia,"Noto Serif TC",serif;font-size:35px;margin:7px 0 8px}.mow-hero p{color:#ddd2cd;line-height:1.75;margin:0;max-width:850px}.mow-tabs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}.mow-tab{border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:14px 16px;text-align:left;cursor:pointer}.mow-tab strong{display:block;font-size:14px}.mow-tab small{display:block;color:var(--muted);font-size:10px;line-height:1.55;margin-top:4px}.mow-tab.active{border-color:var(--accent);box-shadow:0 0 0 3px rgba(123,57,69,.07)}.mow-mode[hidden]{display:none!important}
      .mow-story-layout{display:grid;grid-template-columns:minmax(340px,.85fr) minmax(420px,1.15fr);gap:14px;align-items:start}.mow-card{background:var(--panel);border:1px solid var(--line);border-radius:17px;padding:18px}.mow-field{display:grid;gap:5px;margin-bottom:11px}.mow-field>span{font-size:10px;font-weight:800;color:var(--muted)}.mow-field small{font-size:9px;color:#9b9088}.mow-field input,.mow-field textarea{width:100%;border:1px solid #e2d8ce;border-radius:9px;background:#fff;padding:10px 11px;color:var(--ink);line-height:1.65}.mow-field textarea{resize:vertical;min-height:100px}.mow-field.fragments textarea{min-height:180px}.mow-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.mow-save{font-size:9px;color:var(--muted);margin-left:auto}.mow-output{display:grid;gap:8px}.mow-placeholder{min-height:270px;border:1px dashed var(--line);border-radius:14px;display:grid;place-items:center;text-align:center;color:var(--muted);font-size:11px;padding:20px}.mow-result{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:13px}.mow-result-head{display:flex;justify-content:space-between;gap:8px}.mow-result-head b{font-size:12px}.mow-result-head small{font-size:9px;color:var(--muted)}.mow-period{font-size:10px;color:var(--accent);font-weight:800;margin-top:8px}.mow-result ol{margin:7px 0 0;padding-left:21px}.mow-result li{font-size:11px;line-height:1.65;padding:3px 0}.mow-note{margin-top:8px;border-left:3px solid #d5c0bc;background:#faf6f1;padding:8px 9px;border-radius:0 9px 9px 0}.mow-note strong,.mow-theme strong{font-size:9px;color:var(--accent)}.mow-note p,.mow-theme p{font-size:10px;line-height:1.6;margin:4px 0 0}.mow-theme{background:#faf6f1;border-radius:9px;padding:8px 9px;margin-top:7px}.mow-theme.muted{background:#f4f1ed}.mow-questions{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:8px}.mow-questions label{display:flex;gap:6px;align-items:flex-start;border:1px solid #eee5dc;border-radius:8px;padding:6px 7px;font-size:10px;line-height:1.5}.mow-questions input{margin-top:2px}.mow-muted{font-size:10px;color:var(--muted)}
      #v-triage>.heading{display:none}.mow-old-text .panel{margin-top:0}
      @media(max-width:850px){.mow-hero{padding:21px 19px}.mow-hero h1{font-size:29px}.mow-tabs,.mow-story-layout,.mow-questions{grid-template-columns:1fr}.mow-field input,.mow-field textarea{font-size:16px}.mow-save{width:100%;margin-left:0}}
    `;document.head.appendChild(s);
  }

  function build(){
    const section=document.getElementById('v-triage');if(!section||section.dataset.materialWorkbench==='1')return false;
    const oldPanel=section.querySelector('.panel');if(!oldPanel)return false;
    section.dataset.materialWorkbench='1';addStyles();
    const hero=document.createElement('div');hero.className='mow-hero';hero.innerHTML='<span class="eyebrow">RAW MATERIAL → STORY MATERIAL</span><h1>素材整理台</h1><p>不管你手上是一大段舊文字，還是一段零碎的人生回憶，都先在這裡整理，再送進素材庫。</p>';
    const tabs=document.createElement('div');tabs.className='mow-tabs';tabs.innerHTML='<button type="button" class="mow-tab active" data-mow-mode="text"><strong>✂ 一段舊文字</strong><small>把舊稿、筆記或長篇文字整理成可使用的素材。</small></button><button type="button" class="mow-tab" data-mow-mode="story"><strong>◷ 一段人生經歷</strong><small>把零碎記憶整理成事件、感受、理解與可追問的問題。</small></button>';
    const textMode=document.createElement('div');textMode.className='mow-mode mow-old-text';textMode.dataset.mowPanel='text';oldPanel.parentNode.insertBefore(textMode,oldPanel);textMode.appendChild(oldPanel);
    const storyMode=document.createElement('div');storyMode.className='mow-mode';storyMode.dataset.mowPanel='story';storyMode.hidden=true;const d=readStory();storyMode.innerHTML=`<div class="mow-story-layout"><section class="mow-card"><label class="mow-field"><span>主題</span><input id="mowTopic" value="${esc(d.topic||'')}" placeholder="不知道也可以先留白"></label><label class="mow-field"><span>年份或人生階段</span><input id="mowPeriod" value="${esc(d.period||'')}" placeholder="例：研究所第一年／2026赴日前"></label><label class="mow-field fragments"><span>我記得的片段</span><small>一個片段一行；只依輸入順序整理。</small><textarea id="mowFragments" placeholder="片段 1\n片段 2\n片段 3">${esc(d.fragments||'')}</textarea></label><label class="mow-field"><span>我當時的感受</span><textarea id="mowFeelings" placeholder="只寫你記得的當時感受。">${esc(d.feelings||'')}</textarea></label><label class="mow-field"><span>現在回頭看的理解</span><textarea id="mowReflection" placeholder="後來形成的理解另外寫在這裡。">${esc(d.reflection||'')}</textarea></label><div class="mow-actions"><button class="btn primary" id="mowOrganize" type="button">整理脈絡</button><button class="btn" id="mowCreate" type="button">＋ 建立為素材</button><button class="btn" id="mowClear" type="button">清空</button><span class="mow-save" id="mowSaved">自動儲存在本機</span></div></section><div class="mow-output" id="mowOutput"><div class="mow-placeholder">填寫左側後按「整理脈絡」。<br>這裡不美化，也不補你沒提供的細節。</div></div></div>`;
    section.prepend(tabs);section.prepend(hero);section.appendChild(storyMode);
    tabs.querySelectorAll('[data-mow-mode]').forEach(btn=>btn.addEventListener('click',()=>{tabs.querySelectorAll('.mow-tab').forEach(x=>x.classList.toggle('active',x===btn));section.querySelectorAll('[data-mow-panel]').forEach(p=>p.hidden=p.dataset.mowPanel!==btn.dataset.mowMode)}));
    ['mowTopic','mowPeriod','mowFragments','mowFeelings','mowReflection'].forEach(id=>{const el=document.getElementById(id);if(!el)return;let timer;el.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>saveStory(data()),250)})});
    document.getElementById('mowOrganize')?.addEventListener('click',renderResult);document.getElementById('mowCreate')?.addEventListener('click',createMaterial);document.getElementById('mowClear')?.addEventListener('click',()=>{if(!confirm('清空目前的人生故事整理內容？'))return;['mowTopic','mowPeriod','mowFragments','mowFeelings','mowReflection'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});localStorage.removeItem(STORY_KEY);const out=document.getElementById('mowOutput');if(out)out.innerHTML='<div class="mow-placeholder">填寫左側後按「整理脈絡」。<br>這裡不美化，也不補你沒提供的細節。</div>'});
    if(d.topic||d.period||d.fragments||d.feelings||d.reflection)renderResult();
    return true;
  }

  function rename(){
    document.querySelectorAll('#nav [data-v="triage"]').forEach(b=>{if(b.textContent!=='▦ 素材整理台')b.textContent='▦ 素材整理台'});
    document.querySelectorAll('#nav [data-v="references"]').forEach(b=>{if(b.textContent!=='❝ 引用與借鏡')b.textContent='❝ 引用與借鏡'});
    document.querySelectorAll('#nav [data-v="story-organizer"]').forEach(b=>b.remove());
    const crumb=document.getElementById('crumb');if(document.getElementById('v-triage')?.classList.contains('active')&&crumb&&crumb.textContent!=='素材整理台')crumb.textContent='素材整理台';
  }
  function init(){let tries=0;const timer=setInterval(()=>{rename();if(build()||++tries>30)clearInterval(timer)},100);rename()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();