"""Incremental pipeline: find every listing photo, AI-upscale the ones not done yet, write the manifest.

  python scripts/upscale/run.py                 # uses the live site's public API to list photos
  SITE=http://localhost:3000 python scripts/upscale/run.py
  bash scripts/upscale/upload.sh                # push work/out/listings to Firebase Storage

Outputs (under scripts/upscale/work/, gitignored):
  out/listings/<EB-ID>/<imageId>.webp       1920px long edge, WebP q82
  out/listings/<EB-ID>/<imageId>-960.webp   card variant
and updates src/data/upscaled-images.json (commit it, then rebuild/deploy).
Images are never upscaled beyond 1920px and photos already >= 1920px are only re-encoded."""
import os, re, sys, json, urllib.request, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SITE = os.environ.get('SITE', 'https://laura-realestate.web.app').rstrip('/')
WORK = os.environ.get('WORK', os.path.join(HERE, 'work')); MAN = os.path.join(ROOT, 'src/data/upscaled-images.json')
sys.path.insert(0, HERE); import upscale as U
from PIL import Image
def get(u): return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'upscale-pipeline'}), timeout=60).read()
def listing_ids():
    ids, p = set(), 1
    while True:
        found = set(re.findall(r'href="/properties/(EB-[A-Z0-9]+)"', get(f'{SITE}/properties?page={p}').decode()))
        if not found - ids: break
        ids |= found; p += 1
    return sorted(ids)
def photos(pid):
    try: return [(pid, m.group(1), u) for u in json.loads(get(f'{SITE}/api/properties/{pid}')).get('images') or []
                 if (m := re.search(r'property_images/\d+/(\d+)/', u))]
    except Exception as e: print('skip', pid, e); return []
def main():
    man = json.load(open(MAN)) if os.path.exists(MAN) else {}
    ids = listing_ids(); print(len(ids), 'listings')
    with cf.ThreadPoolExecutor(8) as ex: rows = [r for rs in ex.map(photos, ids) for r in rs]
    todo = [r for r in rows if r[1] not in man]; print(len(rows), 'photos,', len(todo), 'new')
    for i, (pid, iid, url) in enumerate(todo):
        src = f'{WORK}/src/{pid}_{iid}.jpg'; rel = f'listings/{pid}/{iid}.webp'; dst = f'{WORK}/out/{rel}'
        try:
            os.makedirs(os.path.dirname(src), exist_ok=True)
            if not os.path.exists(src): open(src, 'wb').write(get(url))
            if not os.path.exists(dst): U.process(src, dst, 1920, dn=0.2)
            sm = dst[:-5] + '-960.webp'
            if not os.path.exists(sm):
                im = Image.open(dst); im.thumbnail((960, 960), Image.LANCZOS); im.save(sm, 'WEBP', quality=80, method=6)
            man[iid] = rel; print(f'{i+1}/{len(todo)}', rel, flush=True)
        except Exception as e: print('ERR', pid, iid, e)
        if i % 25 == 0: json.dump(man, open(MAN, 'w'), indent=0, sort_keys=True)
    json.dump(man, open(MAN, 'w'), indent=0, sort_keys=True); print('manifest', len(man))
if __name__ == '__main__': main()
