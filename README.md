# InstateMe — Acquisition microsite

A single-page, buyer-facing site for the sale of **InstateMe**. It tells the
acquisition story end-to-end — opportunity, business model, financials, unit
economics, the six-state expansion, moat, risks, ideal buyer, and the ask —
and ends in a gated **"Request the data room"** step (a mailto to Jake) instead
of linking to any shared folder.

## Files

```
index.html          # the whole page
assets/styles.css    # brand styling (orange · cream · forest green · ink)
assets/main.js       # sticky nav, mobile menu, scroll reveals, animated bars, request form
assets/logo.svg      # mortarboard wordmark
assets/favicon.svg
```

No build step, no dependencies. Fonts load from Google Fonts (Playfair Display,
Inter, Space Mono).

## Run locally

Just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

## Deploy

It's fully static — drop it anywhere:

- **Netlify / Vercel:** drag the folder in, or connect the repo (no build command, output dir = root).
- **GitHub Pages:** enable Pages on this branch; the root `index.html` is served.
- **Cloudflare Pages / S3 / any static host:** upload as-is.

Point `instateme.com` (or a subdomain like `buy.instateme.com`) at the host.

## Notes on the content

- The page is marked `noindex,nofollow` — it's for direct outreach, not search.
- The "Request the data room" form composes an email to `jsilver@instateme.com`
  with the buyer's name, thesis, and proof-of-funds flag. No backend required.
  Swap in a form service (Formspree, Tally, etc.) later if you want submissions
  captured server-side.
- A few figures were made **internally consistent** so the page can't contradict
  itself in front of a buyer (owner time stated as "a few hours / ~2 hrs," the
  implied multiple shown correctly as ~2.7×, 2026 shown as the risk-adjusted
  ~$476K, and "gross margin" relabeled to "operating margin"). Adjust to taste.
