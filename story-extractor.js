(()=>{
  const STORAGE_KEY='life-archive-writing-studio-v1';
  const q=s=>document.querySelector(s);
  const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2,7);

  function readState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch{return {}}}
  function writeState(state){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  function toast(text){
    const el=q('#toast');
    if(!el)return;
    el.textContent=text;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800);
  }
  function selectedText(){
    const box=q('#triageText');if(!box)return '';
    const a=box.selectionStart||0,b=box.selectionEnd||0;
    return a!==b?box.value.slice(a,b).trim():'';
  }
  function wholeText(){return (q('#triageText')?.value||'').trim()}
  function preview(text){
    const out=q('#extractPreview');
    if(out)out.value=text||'';
    const count=q('#extractCount');
    if(count)count.textContent=text?`${text.length.toLocaleString()} 字`:'尚未選取文字';
  }
  function makeMaterial(){
    const text=(q('#extractPreview')?.value||'').trim();
    if(!text)return toast('先選取或帶入一段文字');
    const title=(q('#extractTitle')?.value||'').trim()||'從舊稿拆出的故事';
    const type=q('#extractType')?.value||'事件素材';
    const meaning=(q('#extractMeaning')?.value||'').trim();
    const state=readState();
    const materials=Array.isArray(state.materials)?state.materials:[];
    const content=meaning?`${text}\n\n【為什麼值得留下】\n${meaning}`:text;
    materials.push({
      id:uid(),title,content,materialType:type,stage:'靈感箱',time:'',timePrecision:'待確認',tags:'',chapterId:'',timelineId:'',source:'故事拆解台'
    });
    state.materials=materials;
    writeState(state);
    q('#extractTitle').value='';q('#extractMeaning').value='';preview('');
    window.LifeArchiveDashboard?.render?.();
    toast('已送進素材庫');
  }
  function installStyles(){
    if(q('#storyExtractorStyles'))return;
    const style=document.createElement('style');style.id='storyExtractorStyles';style.textContent=`
      #v-triage{max-width:1250px}.extractor-layout{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(340px,.85fr);gap:16px;align-items:start}.extractor-panel{background:var(--panel);border:1px solid var(--line);border-radius:17px;padding:18px}.extractor-panel h3{margin:0 0 7px;font-family:Georgia,"Noto Serif TC",serif}.extractor-hint{font-size:12px;color:var(--muted);line-height:1.7;margin:0 0 12px}.extractor-actions{display:flex;gap:8px;flex-wrap:wrap}.extractor-meta{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:4px 0 8px}.extractor-meta small{color:var(--muted)}#extractPreview{min-height:180px;background:#faf7f2}.extractor-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.extractor-meaning textarea{min-height:110px}.extractor-flow{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 14px}.extractor-flow span{font-size:10px;background:var(--soft);color:var(--accent);border-radius:99px;padding:5px 8px;font-weight:750}@media(max-width:850px){.extractor-layout{grid-template-columns:1fr}.extractor-panel{padding:15px}.extractor-grid{grid-template-columns:1fr}#extractPreview{min-height:140px}}
    `;document.head.appendChild(style);
  }
  function install(){
    const section=q('#v-triage');if(!section||q('#storyExtractorWorkspace'))return;
    installStyles();
    const heading=section.querySelector('.heading');
    if(heading){
      const eyebrow=heading.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='RAW TEXT → STORY MATERIAL';
      const h1=heading.querySelector('h1');if(h1)h1.textContent='故事拆解台';
      const p=heading.querySelector('p');if(p)p.textContent='保留原文，再把值得寫的片段拆成事件、感受、轉折與觀點，送進素材庫。';
    }
    document.querySelectorAll('#nav button[data-v="triage"]').forEach(b=>{b.innerHTML='▦ 故事拆解台'});

    const oldPanel=section.querySelector('.panel');if(!oldPanel)return;
    oldPanel.id='storyExtractorSource';
    oldPanel.classList.add('extractor-panel');
    const oldLabel=oldPanel.querySelector('.field span');if(oldLabel)oldLabel.textContent='原始文字／舊稿';
    const oldActions=oldPanel.querySelector('.actions');
    if(oldActions){
      oldActions.innerHTML=`<button class="btn" id="triageSave">儲存原文</button><button class="btn primary" id="extractSelection">從選取文字拆素材</button><button class="btn" id="extractWhole">整段帶入</button>`;
    }

    const workspace=document.createElement('div');workspace.id='storyExtractorWorkspace';workspace.className='extractor-panel';workspace.innerHTML=`
      <div class="extractor-flow"><span>1 選文字</span><span>2 想它為何重要</span><span>3 送進素材庫</span></div>
      <h3>拆出的故事素材</h3>
      <p class="extractor-hint">不必一次整理完整。先留下值得寫的片段，再補一句「為什麼值得留下？」就夠了。</p>
      <div class="extractor-meta"><strong>選取內容</strong><small id="extractCount">尚未選取文字</small></div>
      <label class="field"><textarea id="extractPreview" placeholder="在左邊反白選取一段文字，再按「從選取文字拆素材」……"></textarea></label>
      <div class="extractor-grid">
        <label class="field"><span>素材標題</span><input id="extractTitle" placeholder="例如：久違地，被一群人的熱情感染"></label>
        <label class="field"><span>素材類型</span><select id="extractType"><option>事件素材</option><option>想法素材</option><option>轉折素材</option></select></label>
      </div>
      <label class="field extractor-meaning"><span>為什麼值得留下？</span><textarea id="extractMeaning" placeholder="它讓我看見什麼？改變了什麼？之後可能可以寫什麼？"></textarea></label>
      <div class="extractor-actions"><button class="btn primary" id="extractSaveMaterial">＋ 建立故事素材</button><button class="btn" id="extractOpenMaterials">打開素材庫</button></div>`;

    const layout=document.createElement('div');layout.className='extractor-layout';
    oldPanel.parentNode.insertBefore(layout,oldPanel);layout.appendChild(oldPanel);layout.appendChild(workspace);

    const source=q('#triageText');
    q('#triageSave').onclick=()=>{
      const state=readState();state.raw=source?.value||'';writeState(state);toast('原文已儲存');
    };
    q('#extractSelection').onclick=()=>{
      const text=selectedText();if(!text)return toast('先在左邊反白選取一段文字');preview(text);q('#extractTitle')?.focus();
    };
    q('#extractWhole').onclick=()=>{const text=wholeText();if(!text)return toast('左邊還沒有文字');preview(text);q('#extractTitle')?.focus();};
    q('#extractSaveMaterial').onclick=makeMaterial;
    q('#extractOpenMaterials').onclick=()=>window.LifeArchiveNavigate?.('materials');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
