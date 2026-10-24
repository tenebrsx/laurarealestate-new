// Client-safe helpers (no manifest import).
// NEXT_PUBLIC_UPSCALED_IMAGE_BASE can be either:
//  - a plain CDN/bucket prefix, e.g. https://storage.googleapis.com/<bucket>  -> <base>/listings/EB-X/123.webp
//  - a Firebase Storage REST prefix, e.g. https://firebasestorage.googleapis.com/v0/b/<bucket>/o
//    -> <base>/listings%2FEB-X%2F123.webp?alt=media
export const UPSCALED_BASE = (process.env.NEXT_PUBLIC_UPSCALED_IMAGE_BASE || '').replace(/\/$/, '');
const IS_FIREBASE = /firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o$/.test(UPSCALED_BASE);

export function hostedUrl(path: string): string {
    return IS_FIREBASE ? `${UPSCALED_BASE}/${encodeURIComponent(path)}?alt=media` : `${UPSCALED_BASE}/${path}`;
}

/** Swap an upscaled listing image for its 960px card variant (keeps grids/cards light). */
export function cardImageUrl(url: string): string {
    if (!UPSCALED_BASE || !url || !url.startsWith(UPSCALED_BASE)) return url;
    return url.replace(/\.webp(\?alt=media)?$/, '-960.webp$1');
}
