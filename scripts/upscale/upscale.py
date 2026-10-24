"""Real-ESRGAN (realesr-general-x4v3) photo upscaler for listing images.
Usage: python upscale.py in.jpg out.webp --long 1920 [--dn 0.5] [--blend 0.0]
--dn: denoise strength (0 = keep all original grain/texture, 1 = full denoise), via weight interpolation
      between realesr-general-wdn-x4v3 and realesr-general-x4v3 (same as official -dn flag).
--blend: mix fraction of a plain Lanczos resize back in, to keep natural texture.
Never upscales beyond --long; images already >= --long are only re-encoded."""
import argparse, os, sys, torch, numpy as np
from PIL import Image
from spandrel import ModelLoader
M = os.environ.get('ESRGAN_MODELS', os.path.join(os.path.dirname(__file__), 'models'))
_cache = {}
def model(dn):
    if dn in _cache: return _cache[dn]
    a = torch.load(f'{M}/realesr-general-x4v3.pth', map_location='cpu')
    b = torch.load(f'{M}/realesr-general-wdn-x4v3.pth', map_location='cpu')
    ka = 'params' if 'params' in a else next(iter(a)); a, b = a[ka], b[ka]
    sd = {k: dn * b[k] + (1 - dn) * a[k] for k in a}
    m = ModelLoader().load_from_state_dict(sd).eval(); _cache[dn] = m; return m
@torch.inference_mode()
def sr(img, dn, tile=400, pad=16):
    m = model(dn); x = torch.from_numpy(np.asarray(img, dtype=np.float32) / 255).permute(2, 0, 1)[None]
    _, _, H, W = x.shape; out = torch.zeros(1, 3, H * 4, W * 4)
    for y in range(0, H, tile):
        for xx in range(0, W, tile):
            y0, x0 = max(y - pad, 0), max(xx - pad, 0); y1, x1 = min(y + tile + pad, H), min(xx + tile + pad, W)
            o = m(x[:, :, y0:y1, x0:x1])
            ty, tx = (y - y0) * 4, (xx - x0) * 4; th, tw = min(tile, H - y) * 4, min(tile, W - xx) * 4
            out[:, :, y * 4:y * 4 + th, xx * 4:xx * 4 + tw] = o[:, :, ty:ty + th, tx:tx + tw]
    return Image.fromarray((out[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255 + .5).astype(np.uint8))
def process(src, dst, long_edge, dn=0.5, blend=0.0, q=82):
    im = Image.open(src).convert('RGB'); w, h = im.size; s = long_edge / max(w, h)
    if s <= 1.0:
        out = im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im
    else:
        tw, th = round(w * s), round(h * s)
        out = sr(im, dn).resize((tw, th), Image.LANCZOS)
        if blend > 0: out = Image.blend(out, im.resize((tw, th), Image.LANCZOS), blend)
    os.makedirs(os.path.dirname(dst) or '.', exist_ok=True); out.save(dst, 'WEBP', quality=q, method=6)
    return out.size
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('dst')
    ap.add_argument('--long', type=int, default=1920); ap.add_argument('--dn', type=float, default=0.5)
    ap.add_argument('--blend', type=float, default=0.0); ap.add_argument('--q', type=int, default=82)
    a = ap.parse_args(); torch.set_num_threads(os.cpu_count()); print(process(a.src, a.dst, a.long, a.dn, a.blend, a.q))
