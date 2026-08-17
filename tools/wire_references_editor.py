from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

anchor="const save=()=>{localStorage.setItem(K,JSON.stringify(S));q('#saved').textContent='已自動儲存在本機';stats()};"
bridge="""const save=()=>{localStorage.setItem(K,JSON.stringify(S));q('#saved').textContent='已自動儲存在本機';stats()};
window.LifeArchiveStateBridge={
  get:()=>S,
  setRefs:(refs)=>{S.refs=Array.isArray(refs)?refs:[];save()}
};"""
if 'window.LifeArchiveStateBridge' not in s:
    if anchor not in s:
        raise SystemExit('state save anchor not found')
    s=s.replace(anchor,bridge,1)

old="q('#refList').innerHTML=S.refs.map(r=>`<div class=\"row\"><div><strong>${esc(r.name)}</strong><br><small>${esc(r.note)}</small></div><button class=\"btn\" data-delref=\"${r.id}\">刪除</button></div>`).join('')||'<div class=\"empty\">尚無引用資料</div>';qa('[data-delref]').forEach(b=>b.onclick=()=>{S.refs=S.refs.filter(r=>r.id!==b.dataset.delref);save();render()});"
if old in s:
    s=s.replace(old,"window.LifeArchiveReferencesEditor?.render?.();",1)

old_add="q('#addRef').onclick=()=>{let n=prompt('人物、書籍或來源名稱？');if(!n)return;S.refs.push({id:uid(),name:n,note:prompt('想保存的觀點／用途？')||''});save();render()};"
if old_add in s:
    s=s.replace(old_add,"// #addRef is handled by references-editor.js",1)

tag='<script src="./references-editor.js"></script>'
if tag not in s:
    s=s.replace('</body>',tag+'\n</body>',1)
p.write_text(s,encoding='utf-8')

p=Path('service-worker.js')
sw=p.read_text(encoding='utf-8')
sw=sw.replace("const CACHE_NAME='life-archive-pwa-v21';","const CACHE_NAME='life-archive-pwa-v22';")
if "'./references-editor.js'" not in sw:
    sw=sw.replace("'./timeline-cloud-sync.js','./workflow-sidebar.js','./memories.css','./memories.js'", "'./timeline-cloud-sync.js','./workflow-sidebar.js','./references-editor.js','./memories.css','./memories.js'")
inject="if(!body.includes('references-editor.js')) body=body.replace('</body>','<script src=\"./references-editor.js\"></script></body>');"
marker="if(!body.includes('memories.js')) body=body.replace('</body>','<script src=\"./memories.js\"></script></body>');"
if inject not in sw and marker in sw:
    sw=sw.replace(marker,marker+'\n    '+inject,1)
p.write_text(sw,encoding='utf-8')
