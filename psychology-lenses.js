const PSYCHOLOGY_LENSES=[
  {
    key:'cognitive-dissonance',
    name:'認知失調',
    en:'Cognitive Dissonance',
    author:'Leon Festinger',
    core:'當行為、信念或自我形象彼此不一致時，人可能感到不舒服，並試著改變想法、行為或解釋方式來降低衝突。',
    question:'我有沒有曾經「明明不想要，卻一直告訴自己應該繼續」？當時我怎麼解釋自己的選擇？'
  },
  {
    key:'confirmation-bias',
    name:'確認偏誤',
    en:'Confirmation Bias',
    author:'心理學與判斷研究中的常見概念',
    core:'人容易較注意、尋找或記住支持既有看法的資訊，而忽略與原本信念不一致的證據。',
    question:'我是不是只看到支持原本決定的證據？有哪些反例其實曾經出現？'
  },
  {
    key:'social-comparison',
    name:'社會比較',
    en:'Social Comparison',
    author:'Leon Festinger',
    core:'人會透過與他人比較來理解自己的能力、位置或價值，但比較的對象與方式也會影響自我評價。',
    question:'這個目標真的是我想要的，還是因為看見別人已經做到，所以我覺得自己也應該做到？'
  },
  {
    key:'spotlight-effect',
    name:'聚光燈效應',
    en:'Spotlight Effect',
    author:'Thomas Gilovich 等人的相關研究',
    core:'人有時會高估其他人對自己外表、表現或失誤的注意程度。',
    question:'別人真的像我想像中那麼注意我的失誤嗎？我是不是把「被看見」放大了？'
  },
  {
    key:'sunk-cost',
    name:'沉沒成本效應',
    en:'Sunk Cost Effect',
    author:'決策心理與行為經濟研究中的常見概念',
    core:'已經投入且無法收回的時間、金錢或努力，可能讓人更難停止一個未必仍值得繼續的選擇。',
    question:'如果過去投入的時間全部不能拿來當理由，我今天還會再選一次嗎？'
  },
  {
    key:'learned-helplessness',
    name:'習得性無助',
    en:'Learned Helplessness',
    author:'Martin Seligman、Steven Maier 等相關研究',
    core:'當一個人反覆經驗到行動似乎無法改變結果時，可能逐漸降低嘗試與控制感；但具體情境仍需要個別理解。',
    question:'我是不是因為幾次失敗，就開始把「這次沒成功」推論成「我做什麼都不會成功」？'
  },
  {
    key:'self-efficacy',
    name:'自我效能',
    en:'Self-Efficacy',
    author:'Albert Bandura',
    core:'一個人對自己能否完成特定任務的信念，會影響願不願意開始、遇到困難時是否持續，以及如何看待挫折。',
    question:'哪些真實成功經驗曾讓我從「我可能不行」變成「原來我可以學會」？'
  },
  {
    key:'self-determination',
    name:'自我決定理論',
    en:'Self-Determination Theory',
    author:'Edward Deci、Richard Ryan 等',
    core:'人的動機品質與自主感、勝任感及關係連結等心理需要有關；「能做到」和「自主地想做」並不是同一件事。',
    question:'這件事是我真正選的，還是因為外界期待、義務或比較而持續？即使沒有人看到，我還會選嗎？'
  },
  {
    key:'fundamental-attribution-error',
    name:'基本歸因偏誤',
    en:'Fundamental Attribution Error',
    author:'社會心理學中的經典歸因研究概念',
    core:'理解他人行為時，人有時會過度強調個性或特質，而低估情境、制度與環境因素。',
    question:'我是不是太快把對方理解成「他就是這種人」？當時有哪些情境因素也可能影響他的行為？'
  },
  {
    key:'peak-end-rule',
    name:'峰終定律',
    en:'Peak-End Rule',
    author:'Daniel Kahneman 等人的相關研究',
    core:'回顧某些經驗時，人對整體感受的記憶可能特別受到最強烈時刻與結尾影響，而不完全等於每個時刻的平均。',
    question:'我現在對這段人生的評價，是整段經歷的樣子，還是被一個最強烈的片段或最後結果主導？'
  }
];

function psychState(){
  if(window.LifeArchiveStateBridge?.get)return window.LifeArchiveStateBridge.get()||{};
  try{return JSON.parse(localStorage.getItem('life-archive-writing-studio-v1')||'{}')||{}}catch{return {}}
}

function psychSaveRefs(refs){
  if(window.LifeArchiveStateBridge?.setRefs){window.LifeArchiveStateBridge.setRefs(refs);return}
  const s=psychState();s.refs=refs;localStorage.setItem('life-archive-writing-studio-v1',JSON.stringify(s));
}

function psychEsc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function psychId(){return (crypto.randomUUID&&crypto.randomUUID())||Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

function addPsychStyles(){
  if(document.getElementById('psychologyLensStyles'))return;
  const style=document.createElement('style');
  style.id='psychologyLensStyles';
  style.textContent=`
    .psych-library{display:none;background:#fffdf9;border:1px solid var(--line);border-radius:18px;padding:18px;margin:0 0 14px}.psych-library.show{display:block}
    .psych-library-head{display:flex;justify-content:space-between;gap:16px;align-items:start;margin-bottom:12px}.psych-library-head h2{font-family:Georgia,"Noto Serif TC",serif;margin:3px 0 6px;font-size:24px}.psych-library-head p{margin:0;color:var(--muted);font-size:12px;line-height:1.7;max-width:760px}
    .psych-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.psych-lens{border:1px solid var(--line);background:#faf7f2;border-radius:13px;padding:13px;text-align:left;cursor:pointer}.psych-lens:hover{border-color:#c8aaa7;background:#fff}.psych-lens b{display:block;font-size:13px;margin-bottom:3px}.psych-lens small{display:block;color:var(--accent);font-size:10px;margin-bottom:6px}.psych-lens span{display:block;color:var(--muted);font-size:11px;line-height:1.55}
    .psych-reflection{grid-column:1/-1;background:#f5f0f7;border:1px solid #e1d7e5;border-radius:13px;padding:13px;display:grid;gap:11px}.psych-reflection-head strong{display:block;margin-bottom:4px}.psych-reflection-head span{font-size:11px;color:var(--muted);line-height:1.6}.psych-reflection label{display:grid;gap:6px}.psych-reflection label>span{font-size:11px;font-weight:800;color:#66536e}.psych-reflection textarea{width:100%;border:1px solid var(--line);background:#fff;border-radius:10px;padding:10px 11px;line-height:1.65;min-height:88px;resize:vertical}
    @media(max-width:850px){.psych-grid{grid-template-columns:1fr}.psych-library{padding:14px}.psych-library-head{display:block}.psych-reflection{grid-column:1}.psych-reflection textarea{font-size:16px}}
  `;
  document.head.appendChild(style);
}

function makePsychReference(lens){
  const item={
    id:psychId(),
    sourceType:'理論／概念',
    name:`${lens.name}｜${lens.en}`,
    author:lens.author,
    url:'',
    coreIdea:lens.core,
    note:lens.core,
    connection:'',
    use:'',
    chapterId:'',
    quote:'',
    locator:'',
    status:'待確認來源',
    psychologyKey:lens.key,
    psychologyQuestion:lens.question,
    fit:'',
    limits:''
  };
  const refs=Array.isArray(psychState().refs)?psychState().refs.slice():[];
  refs.unshift(item);
  psychSaveRefs(refs);
  window.LifeArchiveReferencesEditor?.render?.();
  setTimeout(()=>{
    const btn=document.querySelector(`[data-open-ref="${CSS.escape(item.id)}"]`);
    btn?.click();
    setTimeout(enhancePsychEditors,0);
  },0);
}

function ensurePsychLibrary(){
  const section=document.getElementById('v-references');
  const toolbar=section?.querySelector('.ref-toolbar');
  if(!section||!toolbar)return false;
  if(document.getElementById('psychLibrary'))return true;
  const actions=toolbar.querySelector('.actions');
  if(actions&&!document.getElementById('psychLibraryBtn')){
    const button=document.createElement('button');
    button.type='button';button.className='btn';button.id='psychLibraryBtn';button.textContent='🧠 心理學借鏡庫';
    actions.insertBefore(button,actions.firstChild);
    button.addEventListener('click',()=>document.getElementById('psychLibrary')?.classList.toggle('show'));
  }
  const panel=document.createElement('div');
  panel.id='psychLibrary';panel.className='psych-library';
  panel.innerHTML=`
    <div class="psych-library-head"><div><span class="eyebrow">PSYCHOLOGY LENSES</span><h2>10 個心理學借鏡</h2><p>這些不是診斷工具，也不是十條必然成立的「定律」。把它們當成十副眼鏡：用來提出問題、重新理解經驗，也要保留「這個概念可能解釋不了全部」的空間。</p></div></div>
    <div class="psych-grid">${PSYCHOLOGY_LENSES.map(l=>`<button type="button" class="psych-lens" data-psych-key="${psychEsc(l.key)}"><b>${psychEsc(l.name)}</b><small>${psychEsc(l.en)}</small><span>${psychEsc(l.question)}</span></button>`).join('')}</div>`;
  toolbar.insertAdjacentElement('afterend',panel);
  panel.querySelectorAll('[data-psych-key]').forEach(btn=>btn.addEventListener('click',()=>{
    const lens=PSYCHOLOGY_LENSES.find(x=>x.key===btn.dataset.psychKey);
    if(lens)makePsychReference(lens);
  }));
  return true;
}

function updatePsychField(id,field,value){
  const refs=Array.isArray(psychState().refs)?psychState().refs.slice():[];
  const index=refs.findIndex(r=>String(r.id)===String(id));
  if(index<0)return;
  refs[index]={...refs[index],[field]:value};
  psychSaveRefs(refs);
}

function enhancePsychEditors(){
  const refs=Array.isArray(psychState().refs)?psychState().refs:[];
  document.querySelectorAll('.reference-editor[data-ref-id]').forEach(editor=>{
    if(editor.querySelector('.psych-reflection'))return;
    const item=refs.find(r=>String(r.id)===String(editor.dataset.refId));
    if(!item?.psychologyKey)return;
    const grid=editor.querySelector('.ref-grid');if(!grid)return;
    const lens=PSYCHOLOGY_LENSES.find(x=>x.key===item.psychologyKey);
    const box=document.createElement('div');box.className='psych-reflection';
    box.innerHTML=`
      <div class="psych-reflection-head"><strong>🧠 心理學借鏡不是答案，而是一個假設</strong><span>${psychEsc(item.psychologyQuestion||lens?.question||'先問：這個概念真的能解釋我的經驗嗎？')}</span></div>
      <label><span>④ 哪裡符合我的經驗？</span><textarea data-psych-field="fit" placeholder="請寫具體事件或行為，不要只寫「很符合」。">${psychEsc(item.fit||'')}</textarea></label>
      <label><span>⑤ 哪裡不符合／這個概念解釋不了什麼？</span><textarea data-psych-field="limits" placeholder="例：當時還有制度、家庭、文化、經濟或個人價值等其他因素。">${psychEsc(item.limits||'')}</textarea></label>`;
    grid.appendChild(box);
    box.querySelectorAll('[data-psych-field]').forEach(control=>control.addEventListener('change',()=>updatePsychField(item.id,control.dataset.psychField,control.value)));
  });
}

function initPsychologyLenses(){
  addPsychStyles();
  if(!ensurePsychLibrary()){
    const observer=new MutationObserver(()=>{if(ensurePsychLibrary()){enhancePsychEditors()}});
    const target=document.getElementById('v-references')||document.body;
    observer.observe(target,{childList:true,subtree:true});
  }
  const section=document.getElementById('v-references');
  if(section){
    const observer=new MutationObserver(()=>{ensurePsychLibrary();enhancePsychEditors()});
    observer.observe(section,{childList:true,subtree:true});
  }
  enhancePsychEditors();
}

window.LifeArchivePsychologyLenses={items:PSYCHOLOGY_LENSES,open:()=>document.getElementById('psychLibrary')?.classList.add('show')};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initPsychologyLenses,{once:true});else initPsychologyLenses();
