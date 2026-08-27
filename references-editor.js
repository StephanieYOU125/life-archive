(()=>{
const REF_STATUS=['待確認來源','已確認來源'];
const REF_TYPES=['書籍','文章／報導','研究／論文','人物／訪談','影片／Podcast','理論／概念','其他'];

let expandedId=null;

function state(){
  const bridge=window.LifeArchiveStateBridge;
  if(bridge?.get) return bridge.get() || {};
  try{return JSON.parse(localStorage.getItem('life-archive-writing-studio-v1')||'{}')||{}}catch{return {}}
}

function newId(){
  return globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+Math.random().toString(36).slice(2,7);
}

function normalize(raw={}){
  return {
    ...raw,
    id:raw.id||newId(),
    sourceType:raw.sourceType||'書籍',
    name:raw.name||raw.sourceName||'',
    author:raw.author||'',
    url:raw.url||'',
    coreIdea:raw.coreIdea||raw.note||'',
    connection:raw.connection||'',
    use:raw.use||'',
    chapterId:raw.chapterId||'',
    quote:raw.quote||'',
    locator:raw.locator||'',
    status:raw.status||'待確認來源'
  };
}

function refs(){return Array.isArray(state().refs)?state().refs.map(normalize):[]}

function saveRefs(next){
  const cleaned=next.map(r=>({...r,note:r.coreIdea||''}));
  if(window.LifeArchiveStateBridge?.setRefs){
    window.LifeArchiveStateBridge.setRefs(cleaned);
    return;
  }
  const s=state();s.refs=cleaned;
  localStorage.setItem('life-archive-writing-studio-v1',JSON.stringify(s));
}

function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function option(value,label,current){return `<option value="${esc(value)}"${value===current?' selected':''}>${esc(label)}</option>`}

function chapterOptions(current){
  const chapters=Array.isArray(state().chapters)?state().chapters:[];
  return '<option value="">還沒決定放哪一章</option>'+chapters.map(c=>option(c.id,c.title||'未命名章節',current)).join('');
}

function addStyles(){
  if(document.getElementById('referencesEditorStyles'))return;
  const style=document.createElement('style');
  style.id='referencesEditorStyles';
  style.textContent=`
    #v-references{max-width:1220px}
    .ref-guide{background:linear-gradient(145deg,#2b2623,#493638);color:#fff;border-radius:22px;padding:25px 27px;margin-bottom:16px}
    .ref-guide h1{font-family:Georgia,"Noto Serif TC",serif;font-size:34px;margin:6px 0 8px}.ref-guide>p{color:#ded4cf;line-height:1.75;margin:0;max-width:820px}
    .ref-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:18px}.ref-step{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:12px}.ref-step b{display:block;font-size:12px;margin-bottom:5px}.ref-step span{color:#d8ceca;font-size:11px;line-height:1.55}
    .ref-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0}.ref-toolbar-note{color:var(--muted);font-size:12px;line-height:1.6}
    .ref-demo{display:none;background:#f8f2eb;border:1px dashed #d9c8bb;border-radius:15px;padding:15px 17px;margin-bottom:14px}.ref-demo.show{display:block}.ref-demo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ref-demo-item small{display:block;color:var(--accent);font-weight:800;margin-bottom:3px}.ref-demo-item div{font-size:12px;line-height:1.65;color:#5f5650}
    .reference-cards{display:grid;gap:11px}.reference-card{background:var(--panel);border:1px solid var(--line);border-radius:16px;overflow:hidden}.reference-summary{width:100%;border:0;background:transparent;padding:15px 17px;display:grid;grid-template-columns:95px minmax(180px,1.4fr) minmax(180px,1fr) 110px 24px;gap:10px;align-items:center;text-align:left;cursor:pointer}.reference-summary:hover{background:#faf6f0}.reference-summary strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.reference-summary small{color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ref-type,.ref-status{font-size:10px;font-weight:800;border-radius:99px;padding:5px 7px;text-align:center;background:#eee7df}.ref-status.done{background:#e3efe5;color:#356044}.ref-chevron{color:var(--muted)}
    .reference-editor{border-top:1px solid var(--line);padding:17px}.ref-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ref-field{display:grid;gap:6px}.ref-field.full{grid-column:1/-1}.ref-field>span{font-size:11px;color:var(--muted);font-weight:800}.ref-field em{font-style:normal;color:#a69a91;font-weight:400}.ref-field input,.ref-field textarea,.ref-field select{width:100%;border:1px solid var(--line);background:#fff;border-radius:10px;padding:10px 11px;line-height:1.65}.ref-field textarea{resize:vertical;min-height:94px}.ref-field input:focus,.ref-field textarea:focus,.ref-field select:focus{outline:3px solid rgba(123,57,69,.08);border-color:var(--accent)}
    .ref-question{background:#f8f5f0;border-radius:12px;padding:12px}.ref-question>span{color:var(--accent)}.ref-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:12px}.ref-save{font-size:11px;color:var(--muted)}.ref-delete{border:0;background:transparent;color:#9c4545;cursor:pointer}
    .ref-empty{border:1px dashed var(--line);border-radius:16px;padding:30px;text-align:center;color:var(--muted);line-height:1.8}
    @media(max-width:850px){.ref-guide{padding:20px}.ref-guide h1{font-size:28px}.ref-steps,.ref-demo-grid,.ref-grid{grid-template-columns:1fr}.reference-summary{grid-template-columns:75px 1fr 70px 20px}.reference-summary small{display:none}.ref-toolbar{align-items:flex-start;flex-direction:column}.ref-field.full{grid-column:1}.reference-editor input,.reference-editor textarea,.reference-editor select{font-size:16px}}
  `;
  document.head.appendChild(style);
}

function bindShellEvents(section){
  if(section.dataset.referencesEvents==='1')return;
  section.dataset.referencesEvents='1';

  section.addEventListener('click',event=>{
    const addButton=event.target.closest('#addRef');
    if(addButton && section.contains(addButton)){
      event.preventDefault();
      addReference();
      return;
    }

    const demoButton=event.target.closest('#refDemoBtn');
    if(demoButton && section.contains(demoButton)){
      event.preventDefault();
      document.getElementById('refDemo')?.classList.toggle('show');
    }
  });
}

function shell(){
  const section=document.getElementById('v-references');
  if(!section)return false;

  if(section.dataset.referencesV2!=='1'){
    section.dataset.referencesV2='1';
    section.innerHTML=`
      <div class="ref-guide">
        <span class="eyebrow" style="color:#e6c8c1">REFERENCE → MY STORY → NEW UNDERSTANDING</span>
        <h1>引用與借鏡</h1>
        <p>這裡不是先蒐集一大堆參考文獻，而是保存「某個外部觀點如何幫我重新理解自己的故事」。先用自己的話記下想法；真的要放進書裡時，再回頭確認原文、頁碼與脈絡。</p>
        <div class="ref-steps">
          <div class="ref-step"><b>1｜我看到了什麼？</b><span>先記來源，不必一次把書目格式整理完。</span></div>
          <div class="ref-step"><b>2｜它真正說了什麼？</b><span>用自己的話寫核心觀點，不要只貼一大段原文。</span></div>
          <div class="ref-step"><b>3｜它讓我想到什麼？</b><span>連回自己的事件、選擇、感受或既有觀念。</span></div>
          <div class="ref-step"><b>4｜我會怎麼用？</b><span>決定它是命名、對照、延伸，還是放進某一章。</span></div>
        </div>
      </div>
      <div class="ref-toolbar">
        <div class="ref-toolbar-note">不知道怎麼寫時，先完成「核心觀點」和「它讓我想到哪段經驗」兩格就夠了。</div>
        <div class="actions" style="margin:0"><button class="btn" id="refDemoBtn" type="button">看一個示範</button><button class="btn primary" id="addRef" type="button">＋ 新增借鏡卡</button></div>
      </div>
      <div class="ref-demo" id="refDemo">
        <div class="ref-demo-grid">
          <div class="ref-demo-item"><small>來源</small><div>《Atomic Habits》／James Clear</div></div>
          <div class="ref-demo-item"><small>核心觀點</small><div>穩定行為不只靠意志力，環境與制度也會影響習慣是否容易持續。</div></div>
          <div class="ref-demo-item"><small>它讓我想到</small><div>以前把紀律理解成「逼自己做到」，後來才發現外部制度也會塑造長期行為。</div></div>
          <div class="ref-demo-item"><small>我可能怎麼用</small><div>放進談紀律的章節，作為「個人意志 → 系統設計」觀念轉變的借鏡。</div></div>
        </div>
      </div>
      <div id="refList" class="reference-cards"></div>`;
  }

  bindShellEvents(section);
  return true;
}

function summary(r){
  const chapter=(state().chapters||[]).find(c=>c.id===r.chapterId)?.title||'未指定篇章';
  return `<button type="button" class="reference-summary" data-open-ref="${esc(r.id)}">
    <span class="ref-type">${esc(r.sourceType)}</span>
    <strong>${esc(r.name||'尚未填來源')}</strong>
    <small>${esc(chapter)}</small>
    <span class="ref-status ${r.status==='已確認來源'?'done':''}">${esc(r.status)}</span>
    <span class="ref-chevron">${expandedId===r.id?'⌃':'⌄'}</span>
  </button>`;
}

function editor(r){
  return `<div class="reference-editor" data-ref-id="${esc(r.id)}">
    <div class="ref-grid">
      <label class="ref-field"><span>來源類型</span><select data-ref-field="sourceType">${REF_TYPES.map(x=>option(x,x,r.sourceType)).join('')}</select></label>
      <label class="ref-field"><span>來源名稱 <em>書名、文章、人物、影片……</em></span><input data-ref-field="name" value="${esc(r.name)}" placeholder="例：《Atomic Habits》"></label>
      <label class="ref-field"><span>作者／出處</span><input data-ref-field="author" value="${esc(r.author)}" placeholder="例：James Clear、某研究團隊、某媒體"></label>
      <label class="ref-field"><span>網址／識別資訊 <em>選填</em></span><input data-ref-field="url" value="${esc(r.url)}" placeholder="網址、DOI、出版社等"></label>

      <label class="ref-field full ref-question"><span>① 這個來源真正讓我記住的核心觀點是什麼？</span><textarea data-ref-field="coreIdea" placeholder="不要急著抄原文。先用自己的話寫：它在說什麼？">${esc(r.coreIdea)}</textarea></label>
      <label class="ref-field full ref-question"><span>② 它讓我想到自己的哪段故事、經驗或原本的想法？</span><textarea data-ref-field="connection" placeholder="例：它讓我重新理解警大時期的紀律，不只是意志力，也包含制度與環境。">${esc(r.connection)}</textarea></label>
      <label class="ref-field full ref-question"><span>③ 如果寫進書裡，我想拿它做什麼？</span><textarea data-ref-field="use" placeholder="例：用來命名一個以前說不清楚的感受／和自己的故事形成對照／延伸成新的觀點。">${esc(r.use)}</textarea></label>

      <label class="ref-field"><span>可能放在哪一章？</span><select data-ref-field="chapterId">${chapterOptions(r.chapterId)}</select></label>
      <label class="ref-field"><span>來源確認狀態</span><select data-ref-field="status">${REF_STATUS.map(x=>option(x,x,r.status)).join('')}</select></label>
      <label class="ref-field full"><span>短摘錄 <em>選填；正式使用前請回原始來源核對</em></span><textarea data-ref-field="quote" placeholder="只記真正需要回頭核對的短句，不必整段貼上。">${esc(r.quote)}</textarea></label>
      <label class="ref-field full"><span>頁碼／時間碼／位置 <em>選填</em></span><input data-ref-field="locator" value="${esc(r.locator)}" placeholder="例：p. 42、12:30、章節名稱"></label>
    </div>
    <div class="ref-footer"><span class="ref-save" data-ref-save>✓ 已儲存</span><button type="button" class="ref-delete" data-delete-ref>刪除這張借鏡卡</button></div>
  </div>`;
}

function render(){
  if(!shell())return;
  const list=document.getElementById('refList');if(!list)return;
  const rows=refs();
  list.innerHTML=rows.length?rows.map(r=>`<article class="reference-card">${summary(r)}${expandedId===r.id?editor(r):''}</article>`).join(''):`<div class="ref-empty"><strong>還沒有引用與借鏡。</strong><br>下一次讀到一句讓你「重新理解自己」的觀點時，就建立第一張借鏡卡。</div>`;
  bind();
}

function bind(){
  const section=document.getElementById('v-references');
  if(!section)return;

  section.querySelectorAll('[data-open-ref]').forEach(btn=>btn.addEventListener('click',()=>{
    expandedId=expandedId===btn.dataset.openRef?null:btn.dataset.openRef;
    render();
  }));

  section.querySelectorAll('[data-ref-field]').forEach(control=>{
    const commit=()=>{
      const card=control.closest('[data-ref-id]');if(!card)return;
      const all=refs();const item=all.find(x=>x.id===card.dataset.refId);if(!item)return;
      item[control.dataset.refField]=control.value;
      const save=card.querySelector('[data-ref-save]');if(save)save.textContent='儲存中…';
      saveRefs(all);
      if(save)setTimeout(()=>{if(document.body.contains(save))save.textContent='✓ 已儲存'},250);
    };
    control.addEventListener('input',commit);
    control.addEventListener('change',commit);
  });

  section.querySelectorAll('[data-delete-ref]').forEach(btn=>btn.addEventListener('click',()=>{
    const card=btn.closest('[data-ref-id]');if(!card||!confirm('刪除這張引用與借鏡卡？'))return;
    saveRefs(refs().filter(x=>x.id!==card.dataset.refId));
    expandedId=null;
    render();
  }));
}

function addReference(){
  const all=refs();
  const item=normalize({id:newId(),sourceType:'書籍',status:'待確認來源'});
  all.unshift(item);
  saveRefs(all);
  expandedId=item.id;
  render();

  requestAnimationFrame(()=>{
    const safeId=globalThis.CSS?.escape?CSS.escape(String(item.id)):String(item.id).replace(/"/g,'\\"');
    document.querySelector(`[data-ref-id="${safeId}"] input[data-ref-field="name"]`)?.focus();
  });
}

function init(){
  addStyles();
  shell();
  render();
}

window.LifeArchiveReferencesEditor={render,add:addReference};

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init,{once:true});
}else{
  init();
}
})();
