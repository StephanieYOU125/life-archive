from pathlib import Path
import re

# index.html: leave a single empty nav container; workflow-sidebar.js owns all items.
p = Path('index.html')
s = p.read_text(encoding='utf-8')
s2 = re.sub(r'<nav class="nav" id="nav">.*?</nav>', '<nav class="nav" id="nav"></nav>', s, count=1, flags=re.S)
if s2 == s:
    raise SystemExit('Could not replace sidebar nav block in index.html')
s = s2
old = "qa('#nav button,[data-go]').forEach(b=>b.onclick=()=>nav(b.dataset.v||b.dataset.go));"
new = "window.LifeArchiveNavigate=nav;\nqa('[data-go]').forEach(b=>b.onclick=()=>nav(b.dataset.go));"
if old not in s:
    raise SystemExit('Old sidebar binding not found in index.html')
s = s.replace(old, new, 1)
p.write_text(s, encoding='utf-8')

# timeline.js: own Timeline page/data only, not sidebar creation or binding.
p = Path('timeline.js')
t = p.read_text(encoding='utf-8')
old = '''  const nav=document.getElementById('nav');\n  const refBtn=nav?.querySelector('[data-v="references"]');\n  let btn=nav?.querySelector('[data-v="timeline"]');\n  if(!btn){\n    btn=document.createElement('button');btn.dataset.v='timeline';btn.innerHTML='◷ 人生時間軸';\n    nav?.insertBefore(btn,refBtn||null);\n  }\n\n'''
if old not in t:
    raise SystemExit('Timeline sidebar creation block not found')
t = t.replace(old, '', 1)
old_bind = "  btn.addEventListener('click',()=>openTimeline(btn));\n}"
if old_bind not in t:
    raise SystemExit('Timeline button binding not found')
t = t.replace(old_bind, '}', 1)
old_open = '''function openTimeline(btn){\n  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));document.getElementById('v-timeline')?.classList.add('active');\n  document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x===btn));\n  const crumb=document.getElementById('crumb');if(crumb)crumb.textContent='人生時間軸';\n  document.getElementById('side')?.classList.remove('open');render();\n}'''
new_open = '''function openTimeline(){\n  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));\n  document.getElementById('v-timeline')?.classList.add('active');\n  document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.v==='timeline'));\n  const crumb=document.getElementById('crumb');if(crumb)crumb.textContent='人生時間軸';\n  document.getElementById('side')?.classList.remove('open');\n  render();\n}\n\nwindow.LifeArchiveTimelineUI={open:openTimeline};'''
if old_open not in t:
    raise SystemExit('Timeline open function not found')
t = t.replace(old_open, new_open, 1)
p.write_text(t, encoding='utf-8')

# workflow-sidebar.js: single authoritative definition and click routing.
Path('workflow-sidebar.js').write_text("""const WORKFLOW=[
  {label:null,items:['dashboard']},
  {label:'01 · 整理人生',items:['timeline','memories','source']},
  {label:'02 · 建立素材',items:['materials','triage','visual']},
  {label:'03 · 設計一本書',items:['compass','outline']},
  {label:'04 · 開始寫作',items:['editor','references','diagnosis']},
  {label:'05 · 保存',items:['export']}
];

const LABELS={
  dashboard:'⌂ 從哪裡開始',timeline:'◷ 人生時間軸',memories:'▧ 照片回憶',source:'≡ 原始文字',
  materials:'◇ 素材庫',triage:'▦ 文字拆解台',visual:'✦ 故事工作台',compass:'◎ 全書定位',outline:'☷ 章節地圖',
  editor:'✎ 章節編輯器',references:'❝ 引用與借鏡',diagnosis:'⚑ 修稿檢查',export:'⇩ 備份與匯出'
};

function addStyles(){
  if(document.getElementById('workflowSidebarStyles'))return;
  const style=document.createElement('style');
  style.id='workflowSidebarStyles';
  style.textContent=`
    #nav{gap:2px!important;padding-right:2px}
    #nav .workflow-group-label{font-size:9px;letter-spacing:.14em;color:#756d66;font-weight:800;padding:15px 12px 5px;user-select:none}
    #nav button{min-height:38px;padding:8px 11px!important;font-size:13px;line-height:1.25}
    #nav button[data-v="dashboard"]{margin-bottom:4px}
    #nav .workflow-divider{height:1px;background:rgba(255,255,255,.06);margin:5px 9px 2px}
    @media(max-width:850px){#nav .workflow-group-label{padding-top:13px;color:#8f867f}#nav button{min-height:42px;font-size:14px}}
  `;
  document.head.appendChild(style);
}

function openView(key){
  if(key==='timeline'){
    window.LifeArchiveTimelineUI?.open?.();
    return;
  }
  window.LifeArchiveNavigate?.(key);
}

function buildSidebar(){
  const nav=document.getElementById('nav');
  if(!nav)return;
  nav.replaceChildren();
  WORKFLOW.forEach((group,index)=>{
    if(group.label){
      const label=document.createElement('div');
      label.className='workflow-group-label';
      label.textContent=group.label;
      nav.appendChild(label);
    }
    group.items.forEach(key=>{
      const button=document.createElement('button');
      button.type='button';
      button.dataset.v=key;
      button.textContent=LABELS[key]||key;
      if(key==='dashboard')button.classList.add('active');
      button.addEventListener('click',()=>openView(key));
      nav.appendChild(button);
    });
    if(index===0){
      const divider=document.createElement('div');
      divider.className='workflow-divider';
      nav.appendChild(divider);
    }
  });
}

function renamePageHeadings(){
  const triage=document.querySelector('#v-triage .heading');
  if(triage?.querySelector('h1'))triage.querySelector('h1').textContent='文字拆解台';
  if(triage?.querySelector('p'))triage.querySelector('p').textContent='把舊稿、筆記或一大段文字拆成可以重複使用的故事素材。';
  const visual=document.querySelector('#v-visual .heading');
  if(visual?.querySelector('h1'))visual.querySelector('h1').textContent='故事工作台';
  if(visual?.querySelector('p'))visual.querySelector('p').textContent='把素材依「靈感箱 → 發展中 → 可寫作 → 已放入章節」推進。';
}

function init(){
  addStyles();
  renamePageHeadings();
  buildSidebar();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
""", encoding='utf-8')

# Bust PWA cache because sidebar ownership changed.
p = Path('service-worker.js')
sw = p.read_text(encoding='utf-8')
sw = sw.replace("const CACHE_NAME='life-archive-pwa-v20';", "const CACHE_NAME='life-archive-pwa-v21';")
p.write_text(sw, encoding='utf-8')

# Remove obsolete sidebar rewrite workflow if present.
Path('.github/workflows/static-sidebar-rewrite.yml').unlink(missing_ok=True)

# Validate the result.
s = Path('index.html').read_text(encoding='utf-8')
t = Path('timeline.js').read_text(encoding='utf-8')
w = Path('workflow-sidebar.js').read_text(encoding='utf-8')
assert '<nav class="nav" id="nav"></nav>' in s
assert 'data-v="timeline"' not in s
assert "createElement('button')" not in t
assert "timeline:'◷ 人生時間軸'" in w
assert "life-archive-pwa-v21" in Path('service-worker.js').read_text(encoding='utf-8')
print('Sidebar has one authoritative source: workflow-sidebar.js')
