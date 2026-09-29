import json,subprocess,os,re,concurrent.futures as cf
jobs=json.load(open('mainvids.json'))
out='/Users/poopiepie/voilawebsite/assets/gallery'
tmp='/private/tmp/claude-501/-Users-poopiepie-voilawebsite/38c2ef18-19cc-4c5f-ba3a-aeab26492a83/scratchpad/vids'; os.makedirs(tmp,exist_ok=True)
def slug(k): return re.sub(r'[^a-z0-9]+','-',k.lower()).strip('-')
def do(item):
    k,i=item; dd=os.path.join(out,slug(k)); os.makedirs(dd,exist_ok=True)
    if len(os.listdir(dd))>=10: return k,'skip'
    cj=f'{tmp}/{i}.cj'; v=f'{tmp}/{i}.mp4'
    h=subprocess.run(['curl','-sL','-c',cj,'-b',cj,f'https://drive.usercontent.google.com/download?id={i}&export=download'],capture_output=True,text=True).stdout
    m=re.search(r'name="uuid" value="([^"]+)"',h)
    u=f'https://drive.usercontent.google.com/download?id={i}&export=download&confirm=t'+(f'&uuid={m.group(1)}' if m else '')
    subprocess.run(['curl','-sL','-c',cj,'-b',cj,'-o',v,u])
    dur=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',v],capture_output=True,text=True).stdout.strip() or 0)
    if dur:
        for j in range(10):
            t=dur*(0.06+0.88*j/9)
            subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{t:.2f}','-i',v,'-frames:v','1','-vf','scale=1600:-2','-pix_fmt','yuvj420p','-q:v','4',os.path.join(dd,f'{j+1:02d}.jpg')])
    if os.path.exists(v): os.remove(v)
    return k,dur,len(os.listdir(dd))
with cf.ThreadPoolExecutor(2) as ex:
    for r in ex.map(do,jobs.items()): print(r,flush=True)
