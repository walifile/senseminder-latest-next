Here’s a simple, complete guide you can follow every time.

Step‑by‑step (fast path)

Run Lighthouse in Chrome DevTools → pick Mobile → Analyze → note top 3 issues
Open DevTools → Network → sort by Size → fix the biggest files first (usually images)
Open DevTools → Performance → record → find LCP element + CLS shifts
Re‑run Lighthouse after each fix
Best tools (easy + useful)

Lighthouse (Chrome DevTools) → lab score + exact issues
PageSpeed Insights → Lighthouse + real‑user data (CrUX)
DevTools Network tab → largest assets
DevTools Performance tab → LCP/CLS root causes
WebPageTest → deep waterfall + filmstrip
Next.js bundle analyzer → find heavy JS bundles
Quick wins checklist

Convert large PNG/JPG → WebP/AVIF
Add width/height or fixed sizes to images (reduce CLS)
Use next/image + sizes on visible images
Lazy‑load below‑the‑fold images
Trim unused JS/CSS and avoid big client components
Use next/font with display: "swap" and subsets
Cache static assets long‑term
If you want, tell me which page is slow (home/about) and I’ll point to the exact files to fix in this repo.
