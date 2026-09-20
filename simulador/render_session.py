from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,html,textwrap,math,subprocess,sys
R=Path(__file__).resolve().parents[1];OUT=R/'session-frames';OUT.mkdir(exist_ok=True)
S=json.loads((R/'simulador/scenarios.json').read_text());TIM=[];start=0
for s in S:
 for ev in s['events']:
  if ev.get('when') and not all(s['defaults'].get(k)==v for k,v in ev['when'].items()):continue
  TIM.append({'scenario':s,'event':ev,'start':start});start+=ev['duration']
labels={'user':'Usuario','parent':'Padre','worker':'Subagente','tools':'Herramientas','native':'Motor RDD','memory':'Engram'}
slots={'user':(1214,184),'parent':(1214,268),'worker':(1080,390),'native':(1360,390),'tools':(1080,490),'memory':(1360,490)}
paths={'user-parent':[(1304,234),(1304,268)],'parent-worker':[(1250,318),(1250,352),(1170,352),(1170,390)],'parent-native':[(1360,318),(1360,352),(1450,352),(1450,390)],'worker-tools':[(1170,440),(1170,490)],'parent-tools':[(1214,293),(1060,293),(1060,515),(1080,515)],'parent-memory':[(1394,293),(1560,293),(1560,515),(1540,515)],'native-worker':[(1360,415),(1260,415)],'native-memory':[(1450,440),(1450,490)]}
def activepath(a,b):
 if a+'-'+b in paths:return paths[a+'-'+b]
 if b+'-'+a in paths:return list(reversed(paths[b+'-'+a]))
 return paths['parent-native']
def interp(text,s):
 a=s['defaults'];d={'scopeLabel':'todos los reportes accesibles' if a.get('scope')=='todos' else 'solo los registros filtrados','reviewLabel':'Ahora no' if a.get('review')=='no' else 'Revisar ahora','reviewOutcome':'La revisión cerró y su autoridad fue consumida.'}
 for k,v in d.items():text=text.replace('{{'+k+'}}',v)
 return text
esc=lambda x:html.escape(str(x),quote=True)
def txt(x,y,s,size=20,color='#dddddd',weight='normal'):
 return f'<text x="{x}" y="{y}" font-family="DejaVu Sans Mono, monospace" font-size="{size}" font-weight="{weight}" fill="{color}">{esc(s)}</text>'
def wrap(x,y,s,width=73,size=19,color='#ddd',gap=27):return ''.join(txt(x,y+i*gap,t,size,color) for i,t in enumerate(textwrap.wrap(s,width)))
def fold(events,s):
 rows=[];children=[]
 for e in events:
  if e['type'] in ['child','wait']:children.append(e);continue
  if e['type']=='result':
   old=next((r for r in reversed(rows) if r.get('task')==e.get('task') and r['type']=='delegate'),None)
   if old is not None:old['result']=e;continue
  rows.append(dict(e))
 return rows,children
def rowheight(r,s):
 rr=r.get('result',r);lines=len(textwrap.wrap(interp(rr['text'],s),73))
 if r['type'] not in ['user','parent','end','question']:return 102+25*(lines-1)
 return 38+lines*27+(62 if r['type']=='question' else 16)
def frame(i,submitted=True):
 item=TIM[i];s=item['scenario'];e=item['event'];history=[t['event'] for t in TIM[:i] if t['scenario']['id']==s['id']]
 if e['type']!='user' or submitted:history=history+[e]
 rows,children=fold(history,s);last=[];used=0
 for r in reversed(rows):
  h=rowheight(r,s)
  if used+h>550:break
  last.insert(0,r);used+=h
 color='#4bd1b1';parts=['<rect width="1600" height="900" fill="#292929"/>','<rect x="0" y="124" width="1030" height="729" fill="#303030"/>','<path d="M1030 124V853M0 124H1600M0 853H1600" stroke="#555"/>']
 parts+=[txt(35,48,'✿ gentle shell',27,'#bbc56a','bold'),txt(395,45,'SIMULACIÓN DIDÁCTICA',14,'#4bd1b1'),txt(1130,45,'PADRE ↔ SUBAGENTE ↔ USUARIO',16,'#aaa')]
 parts+=[txt(35,95,s['title'],22,'#ddd'),txt(795,94,e['phase'],21,'#4bd1b1','bold'),txt(887,94,f'{i+1}/{len(TIM)}',17,'#aaa')]
 parts.append(txt(35,152,'~/proyecto-reportes · sesión padre',13,'#aaa'))
 y=178
 for r in last:
  rr=r.get('result',r);h=rowheight(r,s);t=interp(rr['text'],s)
  if r['type'] in ['user','parent','end']:
   label='TÚ' if r['type']=='user' else 'PADRE · GENTLE SHELL' if r['type']=='parent' else 'RESULTADO DEL EJEMPLO';c='#efadd0' if r['type']=='user' else '#4bd1b1';parts.append(txt(42,y+18,label,13,c,'bold'));parts.append(wrap(42,y+46,t))
  elif r['type']=='question':
   parts.append(f'<rect x="34" y="{y}" width="956" height="{h-10}" rx="6" fill="#3c382a" stroke="#dac574"/>');parts.append(txt(49,y+21,'PADRE → USUARIO · DECISIÓN',13,'#ebd18b'));parts.append(wrap(49,y+48,t));oy=y+h-35;xx=49
   for op in r['options']:
    parts.append(txt(xx,oy,'[ '+op['label']+' ]',17,'#dce791' if s['defaults'].get(r['key'])==op['value'] else '#bbb'));xx+=max(220,len(op['label'])*13+65)
  else:
   status=rr.get('status','completed') if r.get('result') else 'running' if r['type']=='delegate' else 'completed';head=('Agent result' if r.get('result') else 'Agent task')+' · '+r['actor'] if r['type']=='delegate' else r['actor'];c='#e1ca75' if status=='interaction_required' else '#bbc56a'
   parts.append(f'<rect x="34" y="{y+9}" width="956" height="{h-17}" rx="6" fill="#333" stroke="{c}"/>');parts.append(f'<rect x="43" y="{y}" width="900" height="24" fill="#303030"/>');parts.append(txt(49,y+20,head[:62],17,c,'bold'));parts.append(txt(51,y+48,status+' · '+t[:0],13,'#aaa'));parts.append(wrap(49,y+74,t,width=74,size=18,gap=25))
  y+=h
 # composer
 parts.append('<rect x="34" y="750" width="956" height="62" rx="5" fill="#303030" stroke="#b9c263"/>');parts.append(txt(49,786,'❯',24,'#bbc56a'));parts.append(txt(36,837,'Usuario escribiendo…' if e['type']=='user' and not submitted else 'Pi · estado y resultados simulados',13,'#aaa'))
 # backstage SVG
 parts.append(txt(1060,154,'LO QUE OCURRE DETRÁS',18,'#bbc56a','bold'))
 for k,p in paths.items():parts.append('<path d="M'+' L'.join(f'{x},{y}' for x,y in p)+'" fill="none" stroke="#555" stroke-width="1.2"/>')
 p=activepath(*e['route']);parts.append('<path d="M'+' L'.join(f'{x},{y}' for x,y in p)+'" fill="none" stroke="#4bd1b1" stroke-width="3"/>')
 for k,(x,y) in slots.items():parts.append(f'<rect x="{x}" y="{y}" width="180" height="50" rx="7" fill="{"#294039" if k in e["route"] else "#343434"}" stroke="{"#4bd1b1" if k in e["route"] else "#666"}"/>');parts.append(txt(x+15,y+31,labels[k],16,'#ddd'))
 parts.append(txt(1060,580,labels[e['route'][0]]+' → '+labels[e['route'][1]],17,'#4bd1b1'))
 parts.append(txt(1060,621,'CONTEXTO DEL SUBAGENTE',14,'#efadd0'))
 active=e.get('task') or next((x.get('task') for x in reversed(history) if x.get('task')),None);child=[x for x in children if x.get('task')==active] or children[-2:]
 parts.append('<rect x="1058" y="638" width="508" height="187" rx="5" fill="#242424" stroke="#555"/>')
 if child:
  x=child[-1];parts.append(txt(1071,661,x['actor'][:36],13,'#bbc56a'));parts.append(wrap(1071,690,interp(x['text'],s),width=44,size=16,gap=23))
 else:parts.append(wrap(1071,681,'Aquí verás lo que el hijo recibe, pregunta y devuelve al padre.',width=43,size=16,color='#aaa',gap=23))
 parts.append(txt(35,883,'MODO CINE  ·  preguntas y respuestas del guion  ·  cuatro ejemplos completos',13,'#aaa'))
 parts.append(txt(1400,883,f'{item["start"]//60:02d}:{item["start"]%60:02d} / {start//60:02d}:{start%60:02d}',13,'#aaa'))
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">'+''.join(parts)+'</svg>'
for i,item in enumerate(TIM):
 (OUT/f'{i:03d}-full.svg').write_text(frame(i,True))
 if item['event']['type']=='user':(OUT/f'{i:03d}-input.svg').write_text(frame(i,False))
(R/'simulador/timeline.json').write_text(json.dumps([{'case':t['scenario']['id'],'event':t['event']['id'],'start':t['start'],'duration':t['event']['duration']} for t in TIM],indent=2))
print('SVG frames:',len(TIM),'duration:',start,flush=True)
if '--svg-only' in sys.argv:sys.exit(0)
# Rasterize scene vectors with sharp.
js="const fs=require('fs'),path=require('path'),sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp':'sharp');(async()=>{let d=process.argv[1],f=fs.readdirSync(d).filter(x=>x.endsWith('.svg'));for(let i=0;i<f.length;i+=8)await Promise.all(f.slice(i,i+8).map(x=>sharp(path.join(d,x)).resize(1280,720).png().toFile(path.join(d,x.replace('.svg','.png')))));})();"
subprocess.run(['node','-e',js,str(OUT)],check=True)
if '--frames-only' in sys.argv:sys.exit(0)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',15);FPS=20
cmd=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart',str(R/'Gentle_Sesion_Completa.mp4')]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
def point(pts,t):
 lengths=[math.dist(a,b) for a,b in zip(pts,pts[1:])];d=t*sum(lengths)
 for a,b,L in zip(pts,pts[1:],lengths):
  if d<=L:return ((a[0]+(b[0]-a[0])*d/L)*.8,(a[1]+(b[1]-a[1])*d/L)*.8)
  d-=L
 return tuple(x*.8 for x in pts[-1])
for i,item in enumerate(TIM):
 ev=item['event'];im=Image.open(OUT/f'{i:03d}-full.png').convert('RGB');inp=Image.open(OUT/f'{i:03d}-input.png').convert('RGB') if ev['type']=='user' else None;route=activepath(*ev['route'])
 for f in range(ev['duration']*FPS):
  t=f/FPS;frac=t/ev['duration'];current=(inp if inp is not None and frac<.78 else im).copy();d=ImageDraw.Draw(current)
  if inp is not None and frac<.78:
   text=interp(ev['text'],item['scenario']);visible=text[:int(min(1,frac/.72)*len(text))]
   for row,line in enumerate(textwrap.wrap(visible,90)):d.text((59,609+row*19),line,font=font,fill='#ddd')
  x,y=point(route,(t%1.6)/1.6);d.ellipse((x-4,y-4,x+4,y+4),fill='#4bd1b1')
  d.rectangle((0,717,int(1280*(item['start']+t)/start),720),fill='#bbc56a');p.stdin.write(current.tobytes())
 print(f'{i+1}/{len(TIM)}',flush=True)
p.stdin.close();assert p.wait()==0
print('TERMINAL VIDEO COMPLETE',flush=True)
