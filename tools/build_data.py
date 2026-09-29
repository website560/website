"""Builds assets/js/data.js from scraped sources. Run: python3 tools/build_data.py"""
import json,os,re,glob
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T=lambda *p:os.path.join(ROOT,*p)
yt=json.load(open(T('tools','yt.json')))
reviews=json.load(open(T('tools','reviews.json')))

def split_title(t):
    t=t.replace('VOILÁ','VOILÀ')
    m=re.match(r'(.*?) Interior Design by VOILÀ \| (.*)',t)
    if m: return m.group(1).strip(), m.group(2).strip()
    m=re.match(r'(.*?) \| (.*?) by VOILÀ',t)
    if m: return m.group(2).replace(' Design','').strip(), m.group(1).replace('Singapore ','').strip()
    m=re.match(r'(.*?) by VOILÀ \| (.*)',t)
    if m: return m.group(1).replace(' Design','').strip(), m.group(2).strip()
    if 'Office Showcase' in t: return 'Studio & Showroom','TAG.A Building, Tagore Lane'
    return 'Home Tour', t
films=[]
for v in yt:
    style,place=split_title(v['title'])
    local=os.path.join('assets','thumbs',v['id']+'.jpg')
    thumb=local if os.path.exists(T(local)) else f"https://i.ytimg.com/vi/{v['id']}/maxresdefault.jpg"
    films.append({'id':v['id'],'style':style,'place':place,'title':v['title'].replace('VOILÁ','VOILÀ'),'dur':v['dur'],'thumb':thumb})

# Website projects (in site order)
site=[('modern-wabi-sabi-1-fraser-street-duo-residences','Modern Wabi-Sabi','1 Fraser Street, DUO Residences','Condominium','_0u83TtPYyg'),
('modern-sophistication-8-slim-barrack-rise','Modern Sophistication','8 Slim Barrack Rise, One North Eden','Condominium','cbsy4bJ9gnU'),
('soft-modern-neutrals-sengkang-grand-residence','Soft Modern Neutrals','Sengkang Grand Residence','Condominium',None),
('modern-japandi-175b-sengkang-east-drive','Modern Japandi','175B Sengkang East Drive','HDB','7fqO8ZiIKtQ'),
('wabi-sabi-859c-tampines-walk','Wabi-Sabi','859C Tampines Walk','HDB',None),
('wabi-sabi-ola-anchorvale-crescent','Wabi-Sabi','Ola EC @ Anchorvale Crescent','Executive Condominium','MBQ7qsLWT9c'),
('modern-japandi-641c-tampines-st','Modern Japandi','641C Tampines Street','HDB','XeNtwQaIza4'),
('modern-contemporary-forett-at-bukit-timah','Modern Contemporary','Forett at Bukit Timah','Condominium','_31fxn9pCCw'),
('wabi-sabi-230a-tengah-drive','Wabi-Sabi','230A Tengah Drive','HDB','UwpxxtL-hS0')]
def imgs(d):
    out=[]
    for f in sorted(glob.glob(T('assets',d,'*.jpg'))):
        w,h=Image.open(f).size
        rel=os.path.relpath(f,ROOT); sm=rel.replace('assets/img/','assets/img-sm/')
        item={'src':rel,'w':w,'h':h}
        if sm!=rel and os.path.exists(T(sm)): item['thumb']=sm
        out.append(item)
    return out
projects=[]
for slug,style,place,typ,film in site:
    projects.append({'slug':slug,'style':style,'place':place,'type':typ,'film':film,'images':imgs('img/'+slug)})

# Drive gallery: folder -> (style, place, film)
dmap={'new-upper-changi-road':('HDB Design','New Upper Changi Road','B-7bUIzPn1c'),
'telok-blangah':('Minimalist Wabi-Sabi','Telok Blangah Drive','H3seS4j3sNk'),
'lim-liak':('HDB Design','Lim Liak Street','r1sxfXiEvzc'),
'euhabitat':('Monochromatic','euHabitat, Jalan Eunos','WZ8WJnMCM1s'),
'serangoon-north-ave-2':('Blackout Luxe','Serangoon North Ave 2','SDAA8snMKiM'),
'tropical-spring':('Earthy Modern','Tropical Spring, Simei','uj-LE98hqTw'),
'punggol-walk':('Boutique Hotel','Punggol Walk','ELJ9UxMWUdU'),
'shunfu':('Modern Minimalist','Shunfu Road','7lIPlhC6Rug'),
'tampines-north-drive-2-15-61':('Muji Minimalist','Tampines North Drive 2','kv1cWVNxgic'),
'tagore-lane':('Studio & Showroom','81 Tagore Lane','TCyGDPH5ISQ'),
'641c-tampines':('Modern Japandi','641C Tampines Street','XeNtwQaIza4'),
'mont-botanik':('Mid-Century Modern','Mont Botanik Residences','JDxLvGSrifo'),
'tampines-north-drive-2-16-63':('Modern Luxe','Tampines GreenCourt','nV1GtFgnex0'),
'38b-eunos':('Eclectic','38B Eunos Road 2','MWmPGUn_x8A'),
'verdale':('Modern Residence','Verdale, De Souza Avenue',None),
'treasure':('Modern Farmhouse','Treasure at Tampines','-9fcJ_HHX7w'),
'affinity':('The Luxe Lounge','Affinity at Serangoon','bQqf3sCoayg'),
'topiary':('Modern Luxe','The Topiary, Fernvale Lane','86oBgF0oE4I'),
'tengah':('Wabi-Sabi','230A Tengah Drive','UwpxxtL-hS0'),
'toh-tuck':('Modern Contemporary','Forett at Bukit Timah','_31fxn9pCCw'),
'anchorvale':('Wabi-Sabi','Ola EC @ Anchorvale','MBQ7qsLWT9c'),
'sengkang-east':('Modern Japandi','175B Sengkang East Drive','7fqO8ZiIKtQ'),
'slim-barrack':('Modern Sophistication','8 Slim Barrack Rise','cbsy4bJ9gnU'),
'fraser':('Modern Wabi-Sabi','1 Fraser Street, DUO Residences','_0u83TtPYyg'),
'jalan-rajah':('Modern Vintage','Jalan Rajah','P0VQq9343gs'),
'tenteram':('Creamy Minimalist','Jalan Tenteram','7O2L_c0svKM'),
'toa-payoh':('Modern Contemporary','Toa Payoh Ridge','qXIA6ZmZzNE')}
gallery=[]
for p in projects:
    for im in p['images']:
        gallery.append({**im,'style':p['style'],'place':p['place'],'film':p['film'],'project':p['slug']})
for d in sorted(os.listdir(T('assets','gallery')),reverse=True):
    key=next((k for k in dmap if k in d),None)
    if not key: continue
    style,place,film=dmap[key]
    for im in imgs('gallery/'+d):
        gallery.append({**im,'style':style,'place':place,'film':film,'project':None})
# interleave so projects mix nicely
from itertools import zip_longest
groups={}
for g in gallery: groups.setdefault(g['place'],[]).append(g)
mixed=[x for row in zip_longest(*groups.values()) for x in row if x]

revs=[{'name':r['name'],'meta':r['meta'],'when':r['when'],'stars':r['stars'],'text':r['text']} for r in reviews]
data={'projects':projects,'films':films,'gallery':mixed,'reviews':revs,
      'rating':{'score':4.7,'count':62,'url':'https://maps.google.com/?cid=17452900236973868279'}}
open(T('assets','js','data.js'),'w').write('window.VOILA='+json.dumps(data,ensure_ascii=False)+';\n')
print(len(projects),len(films),len(mixed),len(revs))
