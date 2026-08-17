from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="q('#runDiag').onclick=()=>{let c=S.chapters.find(x=>x.id===q('#chapterSelect').value)||S.chapters[0],d=c?.draft||'',checks=[['場景',/那天|當時|走進|看見|聽見|站在|坐在/.test(d),'是否有讓讀者進入現場？'],['篇幅',d.length>500,'目前正文 '+d.length+' 字元'],['反思',/發現|理解|後來|原來|學會/.test(d),'是否有從事件走向理解？']];q('#diag').innerHTML=checks.map(x=>`<div class=\"card\"><span class=\"pill\">${x[1]?'已有線索':'可再補強'}</span><strong>${x[0]}</strong><small>${x[2]}</small></div>`).join('')};"
if old in s:
    s=s.replace(old,"// 修稿檢查由 revision-editor.js 負責",1)
tag='<script src="./revision-editor.js"></script>'
if tag not in s:
    s=s.replace('</body>',tag+'\n</body>')
p.write_text(s,encoding='utf-8')

p=Path('service-worker.js')
sw=p.read_text(encoding='utf-8')
sw=sw.replace("const CACHE_NAME='life-archive-pwa-v22';","const CACHE_NAME='life-archive-pwa-v23';")
if "'./revision-editor.js'" not in sw:
    sw=sw.replace("'./workflow-sidebar.js','./references-editor.js','./memories.css'","'./workflow-sidebar.js','./references-editor.js','./revision-editor.js','./memories.css'")
marker="if(!body.includes('references-editor.js')) body=body.replace('</body>','<script src=\"./references-editor.js\"></script></body>');"
inject="if(!body.includes('revision-editor.js')) body=body.replace('</body>','<script src=\"./revision-editor.js\"></script></body>');"
if inject not in sw:
    sw=sw.replace(marker,marker+'\n    '+inject)
p.write_text(sw,encoding='utf-8')
