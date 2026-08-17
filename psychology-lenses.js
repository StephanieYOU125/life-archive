const PSYCHOLOGY_CATEGORIES=[
  {key:'self',label:'自我與身份',desc:'我是誰？我怎麼理解自己？'},
  {key:'choice',label:'選擇與決策',desc:'我為什麼這樣選？'},
  {key:'emotion',label:'情緒與壓力',desc:'我怎麼面對不確定、失敗與壓力？'},
  {key:'relationship',label:'人際關係',desc:'我怎麼理解別人，也怎麼被關係影響？'},
  {key:'memory',label:'記憶與人生回顧',desc:'我現在記得的過去，和當時發生的一樣嗎？'},
  {key:'action',label:'行動與改變',desc:'我如何把想法變成持續行動？'}
];

const PSYCHOLOGY_LENSES=[
  {key:'narrative-identity',category:'self',name:'敘事認同',en:'Narrative Identity',author:'Dan McAdams 等相關研究',core:'人會透過對重要經驗的選擇、排列與解釋，逐步形成「我是誰」的人生故事；同一段經歷也可能隨人生階段被重新理解。',question:'今天的我，是怎麼講述當年的事情？如果20歲的我來說，會講成同一個故事嗎？'},
  {key:'self-discrepancy',category:'self',name:'自我落差理論',en:'Self-Discrepancy Theory',author:'E. Tory Higgins',core:'真實自我、理想自我與「覺得自己應該成為的自我」之間的落差，可能帶來不同形式的情緒與壓力。',question:'我現在不舒服，是因為沒有成為自己想成為的人，還是沒有成為我覺得「應該」成為的人？'},
  {key:'possible-selves',category:'self',name:'可能自我',en:'Possible Selves',author:'Hazel Markus、Paula Nurius',core:'人會想像未來可能成為、希望成為或害怕成為的自己，這些未來自我會影響目前的選擇與動機。',question:'我腦中有哪些未來版本的自己？哪些在吸引我前進，哪些只是我害怕變成的樣子？'},
  {key:'self-concept-clarity',category:'self',name:'自我概念清晰度',en:'Self-Concept Clarity',author:'Jennifer Campbell 等相關研究',core:'自我概念的清楚、一致與穩定程度不同；當一個人更能說明自己的價值、特質與界線時，做選擇時可能更有參照點。',question:'我知道自己重視什麼嗎？還是每遇到新的環境，就會被外界重新定義？'},
  {key:'identity-status',category:'self',name:'身份認同發展',en:'Identity Status',author:'James Marcia',core:'身份認同可從「是否探索過不同可能」與「是否做出承諾」來理解，而不是把人生簡化成「有答案／沒答案」。',question:'這個選擇是我真正探索後的承諾，還是因為還沒探索、或只是沿用別人給我的答案？'},

  {key:'cognitive-dissonance',category:'choice',name:'認知失調',en:'Cognitive Dissonance',author:'Leon Festinger',core:'當行為、信念或自我形象彼此不一致時，人可能感到不舒服，並試著改變想法、行為或解釋方式來降低衝突。',question:'我有沒有曾經「明明不想要，卻一直告訴自己應該繼續」？當時我怎麼解釋自己的選擇？'},
  {key:'confirmation-bias',category:'choice',name:'確認偏誤',en:'Confirmation Bias',author:'判斷與決策研究中的常見概念',core:'人容易較注意、尋找或記住支持既有看法的資訊，而忽略與原本信念不一致的證據。',question:'我是不是只看到支持原本決定的證據？有哪些反例其實曾經出現？'},
  {key:'sunk-cost',category:'choice',name:'沉沒成本效應',en:'Sunk Cost Effect',author:'決策心理與行為經濟研究中的常見概念',core:'已經投入且無法收回的時間、金錢或努力，可能讓人更難停止一個未必仍值得繼續的選擇。',question:'如果過去投入的時間全部不能拿來當理由，我今天還會再選一次嗎？'},
  {key:'loss-aversion',category:'choice',name:'損失趨避',en:'Loss Aversion',author:'Daniel Kahneman、Amos Tversky 等相關研究',core:'人對「失去」的感受有時比同等程度的「得到」更強烈，因此可能更傾向保住已擁有的東西。',question:'我是不是真的喜歡現在的選項，還是只是害怕失去已經擁有的東西？'},
  {key:'status-quo-bias',category:'choice',name:'現狀偏誤',en:'Status Quo Bias',author:'William Samuelson、Richard Zeckhauser 等相關研究',core:'面對改變時，人可能傾向維持目前狀態，即使其他選項值得重新評估。',question:'如果今天不是已經待在這條路上，我還會主動選擇走進來嗎？'},
  {key:'framing-effect',category:'choice',name:'框架效應',en:'Framing Effect',author:'Daniel Kahneman、Amos Tversky 等相關研究',core:'同一個選項用不同方式描述，例如強調得到或失去，可能影響人的判斷與選擇。',question:'如果把「放棄」改叫「重新選擇」，或把「冒險」改叫「探索」，我的判斷會不會不同？'},

  {key:'learned-helplessness',category:'emotion',name:'習得性無助',en:'Learned Helplessness',author:'Martin Seligman、Steven Maier 等相關研究',core:'當一個人反覆經驗到行動似乎無法改變結果時，可能逐漸降低嘗試與控制感；但具體情境仍需要個別理解。',question:'我是不是因為幾次失敗，就開始把「這次沒成功」推論成「我做什麼都不會成功」？'},
  {key:'self-compassion',category:'emotion',name:'自我慈悲',en:'Self-Compassion',author:'Kristin Neff 等相關研究',core:'面對失敗、限制與痛苦時，可以用理解、共同人性與較不批判的態度對待自己，而不等於替自己找藉口。',question:'如果同樣的失敗發生在朋友身上，我會像現在對自己這麼嚴格嗎？'},
  {key:'cognitive-reappraisal',category:'emotion',name:'認知重評',en:'Cognitive Reappraisal',author:'James Gross 等情緒調節研究',core:'在情緒事件發展過程中，重新解釋事件的意義，可能改變後續的情緒反應。',question:'事情本身沒有改變，但如果換一個理解方式，我的情緒和下一步行動會不會不同？'},
  {key:'psychological-flexibility',category:'emotion',name:'心理彈性',en:'Psychological Flexibility',author:'Acceptance and Commitment Therapy 相關研究',core:'心理彈性強調能覺察當下經驗、容許不舒服存在，並仍朝自己重視的價值採取行動。',question:'我是不是一定要等焦慮消失才行動？還是可以帶著不確定，仍做符合價值的下一步？'},
  {key:'stress-appraisal',category:'emotion',name:'壓力評估',en:'Cognitive Appraisal of Stress',author:'Richard Lazarus、Susan Folkman 等',core:'人對事件是「威脅、損失、挑戰」或「可處理」的評估，會影響壓力反應與因應方式。',question:'我把這件事看成威脅、損失，還是挑戰？如果評估不同，我會做出什麼不同反應？'},

  {key:'social-comparison',category:'relationship',name:'社會比較',en:'Social Comparison',author:'Leon Festinger',core:'人會透過與他人比較來理解自己的能力、位置或價值，但比較的對象與方式也會影響自我評價。',question:'這個目標真的是我想要的，還是因為看見別人已經做到，所以我覺得自己也應該做到？'},
  {key:'spotlight-effect',category:'relationship',name:'聚光燈效應',en:'Spotlight Effect',author:'Thomas Gilovich 等人的相關研究',core:'人有時會高估其他人對自己外表、表現或失誤的注意程度。',question:'別人真的像我想像中那麼注意我的失誤嗎？我是不是把「被看見」放大了？'},
  {key:'fundamental-attribution-error',category:'relationship',name:'基本歸因偏誤',en:'Fundamental Attribution Error',author:'社會心理學中的經典歸因研究概念',core:'理解他人行為時，人有時會過度強調個性或特質，而低估情境、制度與環境因素。',question:'我是不是太快把對方理解成「他就是這種人」？當時有哪些情境因素也可能影響他的行為？'},
  {key:'attachment-theory',category:'relationship',name:'依附理論',en:'Attachment Theory',author:'John Bowlby、Mary Ainsworth 等',core:'早期與重要他人的互動經驗可影響人如何尋求安全、靠近他人與回應分離；成人關係中的表現也受到後續經驗與情境影響。',question:'在重要關係裡，我通常怎麼尋求安全感？我會靠近、退開、確認，還是把需求藏起來？'},
  {key:'reciprocity',category:'relationship',name:'互惠',en:'Reciprocity',author:'社會心理與社會交換研究中的重要概念',core:'人際互動中，接受幫助、付出與回應常形成互惠期待，但健康關係不一定要求每次立即或等量交換。',question:'我怎麼理解「接受別人的幫助」？我是否把每一次被幫忙都變成必須立刻償還的債？'},

  {key:'peak-end-rule',category:'memory',name:'峰終定律',en:'Peak-End Rule',author:'Daniel Kahneman 等人的相關研究',core:'回顧某些經驗時，人對整體感受的記憶可能特別受到最強烈時刻與結尾影響，而不完全等於每個時刻的平均。',question:'我現在對這段人生的評價，是整段經歷的樣子，還是被一個最強烈的片段或最後結果主導？'},
  {key:'hedonic-adaptation',category:'memory',name:'享樂適應',en:'Hedonic Adaptation',author:'幸福感研究中的常見概念',core:'人對許多正向或負向改變會逐漸適應，強烈感受往往不會永遠維持原本程度。',question:'我以前以為「得到這個就會一直很快樂」嗎？真正得到之後，多久開始變成日常？'},
  {key:'negativity-bias',category:'memory',name:'負向偏誤',en:'Negativity Bias',author:'社會與認知心理研究中的常見概念',core:'負向資訊有時比同等強度的正向資訊更容易吸引注意、影響判斷或留下記憶。',question:'十件事裡九件順利、一件失敗，我是不是最後只用那一次失敗來定義整段經歷？'},
  {key:'availability-heuristic',category:'memory',name:'可得性捷思',en:'Availability Heuristic',author:'Amos Tversky、Daniel Kahneman',core:'人判斷事件可能性時，容易受到腦中是否能快速想到相關例子的影響；鮮明、近期事件尤其容易被高估。',question:'最近一個很鮮明的事件，有沒有讓我高估某種風險、成功率或失敗率？'},
  {key:'reconstructive-memory',category:'memory',name:'記憶重建',en:'Reconstructive Memory',author:'Frederic Bartlett 之後的記憶研究傳統',core:'回憶不是把過去像影片一樣原封不動播放；記憶會受到目前知識、情境與後來資訊影響而被重新建構。',question:'我現在記得的，是當時真正留下的資料，還是已經加入了今天的理解與後來知道的事情？'},

  {key:'self-efficacy',category:'action',name:'自我效能',en:'Self-Efficacy',author:'Albert Bandura',core:'一個人對自己能否完成特定任務的信念，會影響願不願意開始、遇到困難時是否持續，以及如何看待挫折。',question:'哪些真實成功經驗曾讓我從「我可能不行」變成「原來我可以學會」？'},
  {key:'self-determination',category:'action',name:'自我決定理論',en:'Self-Determination Theory',author:'Edward Deci、Richard Ryan 等',core:'人的動機品質與自主感、勝任感及關係連結等心理需要有關；「能做到」和「自主地想做」並不是同一件事。',question:'這件事是我真正選的，還是因為外界期待、義務或比較而持續？即使沒有人看到，我還會選嗎？'},
  {key:'growth-mindset',category:'action',name:'成長型思維',en:'Growth Mindset',author:'Carol Dweck 等相關研究',core:'人對能力是否可透過學習與練習發展的信念，可能影響面對困難、回饋與失敗時的反應。',question:'我把「現在不會」理解成能力的終點，還是把它當成尚未學會？'},
  {key:'implementation-intentions',category:'action',name:'實施意圖',en:'Implementation Intentions',author:'Peter Gollwitzer 等相關研究',core:'把模糊目標轉成「如果情境X出現，我就做行動Y」的具體計畫，有助於把意圖連接到行動。',question:'與其寫「我要更努力」，我能不能寫成「如果X發生，我就做Y」？'},
  {key:'habit-context-cues',category:'action',name:'習慣與情境線索',en:'Habit & Context Cues',author:'習慣形成研究中的常見概念',core:'重複行為會逐漸與特定情境線索建立連結，因此穩定行為不只靠意志力，也與環境設計有關。',question:'這個行為到底有多少是靠我撐住，有多少其實是環境、時間與提示自動把我帶進去？'},
  {key:'goal-gradient',category:'action',name:'目標梯度效應',en:'Goal-Gradient Effect',author:'Clark Hull 之後的動機與消費行為研究',core:'當人感覺自己更接近目標時，投入與行動速度有時會提高。',question:'我是不是越接近終點越容易衝刺？反過來說，目標太遠時我要怎麼設計可看見的進度？'}
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
    .psych-library-head{display:flex;justify-content:space-between;gap:16px;align-items:start;margin-bottom:12px}.psych-library-head h2{font-family:Georgia,"Noto Serif TC",serif;margin:3px 0 6px;font-size:24px}.psych-library-head p{margin:0;color:var(--muted);font-size:12px;line-height:1.7;max-width:780px}
    .psych-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0}.psych-tab{border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 10px;font-size:11px;cursor:pointer}.psych-tab.active{background:var(--accent);border-color:var(--accent);color:#fff}
    .psych-category{display:grid;gap:9px;margin-top:12px}.psych-category[hidden]{display:none}.psych-category-title{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:4px 2px}.psych-category-title strong{font-size:14px}.psych-category-title span{color:var(--muted);font-size:11px}
    .psych-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.psych-lens{border:1px solid var(--line);background:#faf7f2;border-radius:13px;padding:13px;text-align:left;cursor:pointer}.psych-lens:hover{border-color:#c8aaa7;background:#fff}.psych-lens b{display:block;font-size:13px;margin-bottom:3px}.psych-lens small{display:block;color:var(--accent);font-size:10px;margin-bottom:6px}.psych-lens span{display:block;color:var(--muted);font-size:11px;line-height:1.55}
    .psych-reflection{grid-column:1/-1;background:#f5f0f7;border:1px solid #e1d7e5;border-radius:13px;padding:13px;display:grid;gap:11px}.psych-reflection-head strong{display:block;margin-bottom:4px}.psych-reflection-head span{font-size:11px;color:var(--muted);line-height:1.6}.psych-reflection label{display:grid;gap:6px}.psych-reflection label>span{font-size:11px;font-weight:800;color:#66536e}.psych-reflection textarea{width:100%;border:1px solid var(--line);background:#fff;border-radius:10px;padding:10px 11px;line-height:1.65;min-height:88px;resize:vertical}
    @media(max-width:850px){.psych-grid{grid-template-columns:1fr}.psych-library{padding:14px}.psych-library-head{display:block}.psych-reflection{grid-column:1}.psych-reflection textarea{font-size:16px}.psych-category-title{display:block}.psych-category-title span{display:block;margin-top:3px}}
  `;
  document.head.appendChild(style);
}

function makePsychReference(lens){
  const item={
    id:psychId(),sourceType:'理論／概念',
    name:`${lens.name}｜${lens.en}`,author:lens.author,url:'',
    coreIdea:lens.core,note:lens.core,connection:'',use:'',chapterId:'',quote:'',locator:'',
    status:'待確認來源',psychologyKey:lens.key,psychologyCategory:lens.category,
    psychologyQuestion:lens.question,fit:'',limits:''
  };
  const refs=Array.isArray(psychState().refs)?psychState().refs.slice():[];
  refs.unshift(item);psychSaveRefs(refs);
  window.LifeArchiveReferencesEditor?.render?.();
  setTimeout(()=>{
    const btn=document.querySelector(`[data-open-ref="${CSS.escape(item.id)}"]`);
    btn?.click();
    setTimeout(enhancePsychEditors,0);
  },0);
}

function renderPsychLibrary(panel){
  const categoriesHtml=PSYCHOLOGY_CATEGORIES.map(cat=>{
    const items=PSYCHOLOGY_LENSES.filter(l=>l.category===cat.key);
    return `<section class="psych-category" data-psych-category="${psychEsc(cat.key)}">
      <div class="psych-category-title"><strong>${psychEsc(cat.label)}</strong><span>${psychEsc(cat.desc)}｜${items.length} 個概念</span></div>
      <div class="psych-grid">${items.map(l=>`<button type="button" class="psych-lens" data-psych-key="${psychEsc(l.key)}"><b>${psychEsc(l.name)}</b><small>${psychEsc(l.en)}</small><span>${psychEsc(l.question)}</span></button>`).join('')}</div>
    </section>`;
  }).join('');
  panel.innerHTML=`
    <div class="psych-library-head"><div><span class="eyebrow">PSYCHOLOGY LENSES</span><h2>心理學借鏡庫</h2><p>這些不是診斷工具，也不是必然成立的「定律」。把它們當成不同的觀察角度：先用概念提出問題，再回到自己的具體經驗，最後也要問「哪裡不符合」。目前共 ${PSYCHOLOGY_LENSES.length} 個概念。</p></div></div>
    <div class="psych-tabs"><button type="button" class="psych-tab active" data-psych-filter="all">全部</button>${PSYCHOLOGY_CATEGORIES.map(c=>`<button type="button" class="psych-tab" data-psych-filter="${psychEsc(c.key)}">${psychEsc(c.label)}</button>`).join('')}</div>
    ${categoriesHtml}`;
  panel.querySelectorAll('[data-psych-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    panel.querySelectorAll('.psych-tab').forEach(x=>x.classList.toggle('active',x===btn));
    const filter=btn.dataset.psychFilter;
    panel.querySelectorAll('.psych-category').forEach(section=>{section.hidden=filter!=='all'&&section.dataset.psychCategory!==filter});
  }));
  panel.querySelectorAll('[data-psych-key]').forEach(btn=>btn.addEventListener('click',()=>{
    const lens=PSYCHOLOGY_LENSES.find(x=>x.key===btn.dataset.psychKey);
    if(lens)makePsychReference(lens);
  }));
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
  renderPsychLibrary(panel);
  toolbar.insertAdjacentElement('afterend',panel);
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
    box.querySelectorAll('[data-psych-field]').forEach(control=>{
      const commit=()=>updatePsychField(item.id,control.dataset.psychField,control.value);
      control.addEventListener('change',commit);
      control.addEventListener('blur',commit);
    });
  });
}

function initPsychologyLenses(){
  addPsychStyles();
  if(!ensurePsychLibrary()){
    const observer=new MutationObserver(()=>{if(ensurePsychLibrary())enhancePsychEditors()});
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

window.LifeArchivePsychologyLenses={
  items:PSYCHOLOGY_LENSES,
  categories:PSYCHOLOGY_CATEGORIES,
  open:()=>document.getElementById('psychLibrary')?.classList.add('show')
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initPsychologyLenses,{once:true});else initPsychologyLenses();
