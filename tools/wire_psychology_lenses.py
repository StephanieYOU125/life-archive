from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
tag='<script src="./psychology-lenses.js"></script>'
if tag not in s:
    anchor='<script src="./references-editor.js"></script>'
    if anchor not in s:
        raise SystemExit('references-editor script tag not found')
    s=s.replace(anchor,anchor+'\n'+tag,1)
p.write_text(s,encoding='utf-8')

p=Path('service-worker.js')
sw=p.read_text(encoding='utf-8')
sw=sw.replace("const CACHE_NAME='life-archive-pwa-v23';","const CACHE_NAME='life-archive-pwa-v24';")
if "'./psychology-lenses.js'" not in sw:
    sw=sw.replace("'./workflow-sidebar.js','./references-editor.js','./revision-editor.js'", "'./workflow-sidebar.js','./references-editor.js','./psychology-lenses.js','./revision-editor.js'")
inject="if(!body.includes('psychology-lenses.js')) body=body.replace('</body>','<script src=\"./psychology-lenses.js\"></script></body>');"
marker="if(!body.includes('references-editor.js')) body=body.replace('</body>','<script src=\"./references-editor.js\"></script></body>');"
if inject not in sw:
    if marker not in sw:
        raise SystemExit('service worker references marker not found')
    sw=sw.replace(marker,marker+'\n    '+inject,1)
p.write_text(sw,encoding='utf-8')
