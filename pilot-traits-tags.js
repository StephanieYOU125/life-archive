(()=>{
  const PILOT_TRAITS=[
    '紀律 Discipline',
    '安全意識 Safety Awareness',
    '情境意識 Situational Awareness',
    '決策力 Decision Making',
    '溝通能力 Communication',
    '團隊合作／CRM Teamwork',
    '堅定表達 Assertiveness',
    '壓力管理 Stress Management',
    '適應力 Adaptability',
    '學習能力 Learning Ability',
    '自我覺察 Self-awareness',
    '接受回饋 Coachability',
    '責任感 Responsibility',
    '誠實 Integrity',
    '手眼協調 Hand-eye Coordination'
  ];

  const SHORT_LABELS=new Map(PILOT_TRAITS.map(x=>[x,x.split(/\s(?=[A-Z])/)[0].trim()]));

  function splitTags(value=''){
    return String(value).split(/[,，#\n]+/).map(x=>x.trim()).filter(Boolean);
  }

  function canonicalSelected(value=''){
    const raw=splitTags(value);
    const selected=new Set();
    for(const trait of PILOT_TRAITS){
      const short=SHORT_LABELS.get(trait);
      if(raw.includes(trait)||raw.includes(short))selected.add(trait);
    }
    return selected;
  }

  function syncHiddenInput(input,selected){
    input.value=[...selected].join(', ');
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function buildPicker(input){
    if(!input||input.dataset.pilotTags==='1')return;
    input.dataset.pilotTags='1';
    const selected=canonicalSelected(input.value);
    input.type='hidden';

    const wrap=document.createElement('div');
    wrap.className='pilot-trait-picker';
    wrap.innerHTML=`<div class="pilot-trait-help">只能從固定的機師特質中選擇，可複選。</div><div class="pilot-trait-grid"></div>`;
    const grid=wrap.querySelector('.pilot-trait-grid');

    PILOT_TRAITS.forEach(trait=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='pilot-trait-chip';
      button.dataset.trait=trait;
      button.textContent=trait;
      button.classList.toggle('selected',selected.has(trait));
      button.addEventListener('click',()=>{
        if(selected.has(trait))selected.delete(trait);else selected.add(trait);
        button.classList.toggle('selected',selected.has(trait));
        syncHiddenInput(input,selected);
      });
      grid.appendChild(button);
    });

    input.insertAdjacentElement('afterend',wrap);
  }

  function enhance(){
    document.querySelectorAll('[data-material-field="tags"]').forEach(buildPicker);

    const tagFilter=document.getElementById('materialTagFilter');
    if(tagFilter&&tagFilter.dataset.pilotTraits!=='1'){
      tagFilter.dataset.pilotTraits='1';
      const current=tagFilter.value;
      tagFilter.innerHTML='<option>全部</option>'+PILOT_TRAITS.map(trait=>`<option value="${trait.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">${trait}</option>`).join('');
      if(PILOT_TRAITS.includes(current))tagFilter.value=current;
    }
  }

  function addStyles(){
    if(document.getElementById('pilotTraitTagStyles'))return;
    const style=document.createElement('style');
    style.id='pilotTraitTagStyles';
    style.textContent=`
      .pilot-trait-picker{border:1px solid #e3d9ce;border-radius:10px;background:#fff;padding:10px}
      .pilot-trait-help{font-size:10px;color:var(--muted);margin-bottom:8px}
      .pilot-trait-grid{display:flex;flex-wrap:wrap;gap:6px}
      .pilot-trait-chip{border:1px solid #dfd5cb;background:#faf7f2;color:#665d57;border-radius:999px;padding:6px 9px;font-size:10px;cursor:pointer;line-height:1.3}
      .pilot-trait-chip.selected{background:var(--soft);border-color:#cfacb3;color:var(--accent);font-weight:800}
      @media(max-width:850px){.pilot-trait-chip{font-size:11px;padding:7px 10px}}
    `;
    document.head.appendChild(style);
  }

  function init(){
    addStyles();
    enhance();
    const root=document.getElementById('v-materials')||document.body;
    new MutationObserver(()=>enhance()).observe(root,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.LifeArchivePilotTraits=PILOT_TRAITS.slice();
})();
