(()=>{
  const STORY_KEY='life-archive-story-organizer-v1';
  const QUESTIONS=[
    '當時的我想要什麼？','我原本相信什麼？','發生了什麼問題或衝突？','最困難的是外在事情，還是自己的內在拉扯？','有沒有一個關鍵人物？','有沒有一個關鍵場景或一句話？','我當時做了什麼選擇？','哪一刻事情開始改變？','結果和原本期待的一樣嗎？','這件事之後，我有什麼改變？','現在的理解，是當時就知道，還是後來才形成的？','哪些地方我的記憶其實不確定，需要再查證？'
  ];

  function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function read(){try{return JSON.parse(localStorage.getItem(STORY_KEY)||'{}')||{}}catch{return {}}}
  function save(data){localStorage.setItem(STORY_KEY,JSON.stringify(data));const s=document.getElementById('srwStorySaved');if(s){s.textContent='✓ 已儲存';setTimeout(()=>{if(document.contains(s))s.textContent='自動儲存在本機'},800)}}
  function lines(v=''){return String(v).split(/\n+/).map(x=>x.trim()).filter(Boolean)}
  function get(id){return document.getElementById(id)?.value?.trim()||''}
  function data(){return {topic:get('srwTopic'),period:get('srwPeriod'),fragments:get('srwFragments'),feelings:get('srwFeelings'),reflection:get('srwReflection')}}

  function themes(d){
    const explicit=d.topic?[d.topic]:['目前未提供明確主題。'];
    const possible=[];
    if(d.feelings&&d.reflection)possible.push('當時感受與現在理解之間的變化（需要你再確認）');
    else if(d.reflection)possible.push('這段經歷與現在理解之間的關係（需要你再確認）');
    if(!possible.length)possible.push('目前資料不足，不自行推測其他主題。');
    return {explicit,possible};
  }

  function renderStoryResult(){
    const d=data();save(d);const events=lines(d.fragments);const t=themes(d);const out=document.getElementById('srwStoryOutput');if(!out)return;
    out.innerHTML=`
      <div class="srw-result-block"><div class="srw-result-title"><b>1｜事件時間線</b><small>只照你輸入的順序，不補因果。</small></div><div class="srw-period">${esc(d.period||'時間待確認')}</div>${events.length?`<ol>${events.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:'<p class="srw-muted">目前沒有事件片段。</p>'}</div>
      <div class="srw-result-block"><div class="srw-result-title"><b>2｜可能的故事主題</b><small>明確內容和待確認推測分開。</small></div><div class="srw-theme"><strong>明確可看出的主題</strong>${t.explicit.map(x=>`<p>• ${esc(x)}</p>`).join('')}</div><div class="srw-theme muted"><strong>可能存在，但還需要確認</strong>${t.possible.map(x=>`<p>• ${esc(x)}</p>`).join('')}</div></div>
      <div class="srw-result-block"><div class="srw-result-title"><b>3｜還可以追問自己</b><small>用來找回記憶，不代表答案一定存在。</small></div><div class="srw-question-grid">${QUESTIONS.map(q=>`<label><input type="checkbox"><span>${esc(q)}</span></label>`).join('')}</div></div>`;
  }

  function addStyles(){
    if(document.getElementById('storyResearchWorkbenchStyles'))return;
    const s=document.createElement('style');s.id='storyResearchWorkbenchStyles';s.textContent=`
      #v-references{max-width:1240px}.srw-main-hero{background:linear-gradient(145deg,#292522,#493638);color:#fff;border-radius:24px;padding:27px 29px;margin-bottom:14px}.srw-main-hero .eyebrow{color:#e7c8c1}.srw-main-hero h1{font-family:Georgia,"Noto Serif TC",serif;font-size:35px;margin:7px 0 8px}.srw-main-hero p{color:#ddd2cd;line-height:1.75;margin:0;max-width:850px}.srw-flow{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px;font-size:10px;color:#dfd3cd}.srw-flow b{color:#fff}.srw-section-label{display:flex;align-items:center;gap:10px;margin:20px 0 10px}.srw-section-label span{width:29px;height:29px;display:grid;place-items:center;border-radius:9px;background:var(--soft);color:var(--accent);font-weight:900}.srw-section-label h2{margin:0;font-family:Georgia,"Noto Serif TC",serif;font-size:21px}.srw-section-label p{margin:2px 0 0;color:var(--muted);font-size:10px}
      .srw-story-card{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:17px;margin-bottom:15px}.srw-story-layout{display:grid;grid-template-columns:minmax(330px,.8fr) minmax(420px,1.2fr);gap:14px}.srw-fields{display:grid;gap:9px}.srw-field{display:grid;gap:5px}.srw-field>span{font-size:10px;font-weight:800;color:var(--muted)}.srw-field small{font-size:9px;color:#9b9088}.srw-field input,.srw-field textarea{width:100%;border:1px solid #e2d8ce;border-radius:9px;background:#fff;padding:9px 10px;color:var(--ink);line-height:1.6}.srw-field textarea{min-height:91px;resize:vertical}.srw-field.fragments textarea{min-height:170px}.srw-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:3px}.srw-save{font-size:9px;color:var(--muted);margin-left:auto}.srw-output{display:grid;gap:8px}.srw-placeholder{height:100%;min-height:240px;border:1px dashed var(--line);border-radius:13px;display:grid;place-items:center;text-align:center;color:var(--muted);font-size:11px;padding:20px}.srw-result-block{border:1px solid #e8dfd6;border-radius:12px;background:#fff;padding:11px}.srw-result-title{display:flex;justify-content:space-between;gap:8px;align-items:start}.srw-result-title b{font-size:12px}.srw-result-title small{font-size:9px;color:var(--muted)}.srw-period{font-size:10px;color:var(--accent);font-weight:800;margin-top:8px}.srw-result-block ol{margin:7px 0 0;padding-left:21px}.srw-result-block li{font-size:11px;line-height:1.65;padding:3px 0}.srw-theme{background:#faf6f1;border-radius:9px;padding:8px 9px;margin-top:7px}.srw-theme.muted{background:#f4f1ed}.srw-theme strong{font-size:9px;color:var(--accent)}.srw-theme p{margin:4px 0 0;font-size:10px;line-height:1.6}.srw-question-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:8px}.srw-question-grid label{display:flex;gap:6px;align-items:flex-start;border:1px solid #eee5dc;border-radius:8px;padding:6px 7px;font-size:10px;line-height:1.5}.srw-question-grid input{margin-top:2px}.srw-muted{font-size:10px;color:var(--muted)}.srw-divider{height:1px;background:var(--line);margin:20px 0 4px}
      #v-references>.ref-guide{display:none}.srw-ref-wrap .ref-toolbar{margin-top:0}.srw-ref-wrap .ref-demo,.srw-ref-wrap #refList{margin-bottom:0}
      @media(max-width:850px){.srw-main-hero{padding:21px 19px}.srw-main-hero h1{font-size:29px}.srw-story-layout{grid-template-columns:1fr}.srw-question-grid{grid-template-columns:1fr}.srw-field input,.srw-field textarea{font-size:16px}.srw-save{width:100%;margin-left:0}}
    `;document.head.appendChild(s);
  }

  function storyMarkup(){
    const d=read();return `<div class="srw-section-label"><span>A</span><div><h2>先整理自己的故事</h2><p>先把事實、感受與現在的理解分開。</p></div></div><section class="srw-story-card"><div class="srw-story-layout"><div class="srw-fields">
      <label class="srw-field"><span>主題</span><input id="srwTopic" value="${esc(d.topic||'')}" placeholder="不知道也可以先留白"></label>
      <label class="srw-field"><span>年份或人生階段</span><input id="srwPeriod" value="${esc(d.period||'')}" placeholder="例：警大時期／研究所第二年"></label>
      <label class="srw-field fragments"><span>我記得的片段</span><small>一個片段一行；只照輸入順序整理。</small><textarea id="srwFragments" placeholder="片段 1\n片段 2\n片段 3">${esc(d.fragments||'')}</textarea></label>
      <label class="srw-field"><span>我當時的感受</span><textarea id="srwFeelings" placeholder="只寫當時記得的感受。">${esc(d.feelings||'')}</textarea></label>
      <label class="srw-field"><span>現在回頭看的理解</span><textarea id="srwReflection" placeholder="把後來形成的理解另外寫。">${esc(d.reflection||'')}</textarea></label>
      <div class="srw-actions"><button class="btn primary" id="srwOrganize" type="button">整理脈絡</button><button class="btn" id="srwClear" type="button">清空</button><span class="srw-save" id="srwStorySaved">自動儲存在本機</span></div>
    </div><div class="srw-output" id="srwStoryOutput"><div class="srw-placeholder">填寫左側後按「整理脈絡」。<br>這裡不美化，也不補你沒提供的細節。</div></div></div></section><div class="srw-divider"></div><div class="srw-section-label"><span>B</span><div><h2>再加入引用與借鏡</h2><p>外部觀點只有在能幫你理解故事時，才值得留在這裡。</p></div></div>`}

  function bindStory(){
    ['srwTopic','srwPeriod','srwFragments','srwFeelings','srwReflection'].forEach(id=>{const el=document.getElementById(id);if(!el)return;let timer;el.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>save(data()),250)})});
    document.getElementById('srwOrganize')?.addEventListener('click',renderStoryResult);
    document.getElementById('srwClear')?.addEventListener('click',()=>{if(!confirm('清空目前的人生故事整理內容？'))return;['srwTopic','srwPeriod','srwFragments','srwFeelings','srwReflection'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});localStorage.removeItem(STORY_KEY);const out=document.getElementById('srwStoryOutput');if(out)out.innerHTML='<div class="srw-placeholder">填寫左側後按「整理脈絡」。<br>這裡不美化，也不補你沒提供的細節。</div>'});
    const d=read();if(d.topic||d.period||d.fragments||d.feelings||d.reflection)renderStoryResult();
  }

  function renameNav(){
    document.querySelectorAll('#nav [data-v="references"]').forEach(b=>b.textContent='❝ 故事研究台');
    document.querySelectorAll('#nav [data-v="story-organizer"]').forEach(b=>b.remove());
    const crumb=document.getElementById('crumb');if(document.getElementById('v-references')?.classList.contains('active')&&crumb)crumb.textContent='故事研究台';
  }

  function merge(){
    const section=document.getElementById('v-references');if(!section||section.dataset.storyResearchMerged==='1')return false;
    const toolbar=section.querySelector('.ref-toolbar');const demo=section.querySelector('.ref-demo');const list=section.querySelector('#refList');if(!toolbar||!list)return false;
    section.dataset.storyResearchMerged='1';
    addStyles();
    const hero=document.createElement('div');hero.className='srw-main-hero';hero.innerHTML='<span class="eyebrow">MY STORY → REFERENCE → DEEPER UNDERSTANDING</span><h1>故事研究台</h1><p>先把自己的記憶整理清楚，再用書籍、文章、研究或他人的觀點照回自己的故事。引用不是裝飾，而是幫你把原本說不清楚的經驗理解得更深。</p><div class="srw-flow"><b>人生片段</b><span>→</span><b>故事脈絡</b><span>→</span><b>外部借鏡</b><span>→</span><b>新的理解</b><span>→</span><b>章節</b></div>';
    const story=document.createElement('div');story.innerHTML=storyMarkup();
    const refWrap=document.createElement('div');refWrap.className='srw-ref-wrap';refWrap.appendChild(toolbar);if(demo)refWrap.appendChild(demo);refWrap.appendChild(list);
    section.prepend(hero);while(story.firstChild)section.insertBefore(story.firstChild,refWrap);section.appendChild(refWrap);
    bindStory();renameNav();return true;
  }

  function init(){
    addStyles();let tries=0;const timer=setInterval(()=>{renameNav();if(merge()||++tries>30)clearInterval(timer)},100);const nav=document.getElementById('nav');if(nav)new MutationObserver(renameNav).observe(nav,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
