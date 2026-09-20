from PIL import Image,ImageDraw
from pathlib import Path
import json,math,subprocess
R=Path(__file__).resolve().parents[1];S=json.loads((R/'fuentes/guion.json').read_text());FPS=24;scale=.8
COL={'ODD':'#f095c8','TDD':'#68dec4','RDD':'#b8a5ff'}
def path(sc,a,b):
 fan=len(sc['edges'])>1 and all(e[0]=='a' for e in sc['edges']);p={'a':(62,412),'b':(500,280),'c':(1090,280),'d':(500,510),'e':(1090,510)} if fan else {'a':(62,372),'b':(452,372),'c':(842,372),'d':(1232,372)}
 x,y=p[a];u,v=p[b];w,h=306,154
 if y==v:return [(x+w,y+h/2),(u,y+h/2)]
 if b in ['b','d']:return [(x+w,y+h/2),(415,y+h/2),(415,v+h/2),(u,v+h/2)]
 c=248 if b=='c' else 695;return [(x+w/2,y if b=='c' else y+h),(x+w/2,c),(u+w/2,c),(u+w/2,v if b=='c' else v+h)]
def point(pts,t):
 lens=[math.dist(a,b) for a,b in zip(pts,pts[1:])];d=t*sum(lens)
 for a,b,L in zip(pts,pts[1:],lens):
  if d<=L:return ((a[0]+(b[0]-a[0])*d/L)*scale,(a[1]+(b[1]-a[1])*d/L)*scale)
  d-=L
 return tuple(v*scale for v in pts[-1])
cmd=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','ultrafast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(R/'Gentle_ODD_TDD_RDD.mp4')]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE);previous=None;total=sum(x['dur'] for x in S)
for i,sc in enumerate(S):
 imgs=[Image.open(R/'escenas'/f'{i:02d}-{k}.png').convert('RGB') for k in range(1,len(sc['nodes'])+1)]
 pts=[path(sc,a,b) for a,b,_ in sc['edges']]
 for f in range(sc['dur']*FPS):
  t=f/FPS;stage=min(len(imgs)-1,int(t/.65));im=imgs[stage].copy()
  if stage>0:
   mix=min(1,(t-stage*.65)/.32)
   if mix<1:im=Image.blend(imgs[stage-1],im,mix)
  if previous is not None and t<.35:im=Image.blend(previous,im,t/.35)
  d=ImageDraw.Draw(im)
  for j,route in enumerate(pts):
   delay=.5+j*.62
   if t>delay+.6:
    q=((t-delay-.6)%2)/2;x,y=point(route,q);d.ellipse((x-5,y-5,x+5,y+5),fill=COL[sc['phase']]);d.ellipse((x-2,y-2,x+2,y+2),fill='#fff3ff')
  ratio=(sc['start']+t)/total;d.rectangle((0,716,int(1280*ratio),720),fill=COL[sc['phase']])
  p.stdin.write(im.tobytes())
 previous=imgs[-1];print(f'{i+1}/{len(S)} {sc["ch"]}',flush=True)
p.stdin.close();code=p.wait();assert code==0,code
print('VIDEO COMPLETE',flush=True)
