# AI upscaling for listing photos

EasyBroker serves listing photos at max 1200px. This pipeline makes sharper 1920px copies with
**Real-ESRGAN `realesr-general-x4v3`** at denoise strength **0.2** (the most faithful setting we tested:
keeps wall/wallpaper texture, no invented details), and the site swaps them in via
`src/services/upscaledImages.ts`. Unknown images (new listings) fall back to the original EasyBroker URL.

Setup (CPU is fine, ~6 s/photo):
```
python3 -m venv .venv && .venv/bin/pip install -r scripts/upscale/requirements.txt
mkdir -p scripts/upscale/models && cd scripts/upscale/models
curl -LO https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth
curl -LO https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-wdn-x4v3.pth
```
Run for new listings: `.venv/bin/python scripts/upscale/run.py && bash scripts/upscale/upload.sh`,
commit `src/data/upscaled-images.json`, rebuild and deploy.

Env: `NEXT_PUBLIC_UPSCALED_IMAGE_BASE=https://firebasestorage.googleapis.com/v0/b/laura-realestate.firebasestorage.app/o`
(unset = feature off, site uses original photos). Storage rules: `scripts/upscale/storage.rules`.
