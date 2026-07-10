# InstateMe — Acquisition microsite

A single-page, buyer-facing site for the sale of **InstateMe**. It tells the
acquisition story end-to-end — opportunity, business model, financials, unit
economics, the six-state expansion, moat, risks, ideal buyer, and the ask —
and ends in a gated **"Request the data room"** step (a mailto to Jake) instead
of linking to any shared folder.

## Files

```
index.html           # the whole page
src/main.ts          # TypeScript source — sticky nav, mobile menu, scroll reveals,
                     #   animated bars, request form, market-opportunity calculator
assets/main.js       # COMPILED from src/main.ts (this is what the page loads — do not edit by hand)
assets/styles.css    # brand styling (orange · cream · forest green · ink)
assets/logo.svg      # mortarboard wordmark
assets/favicon.svg
tsconfig.json        # strict TypeScript config (compiles src → assets)
package.json         # build scripts + the TypeScript dev dependency
```

The deployed site is plain static HTML/CSS/JS — **no build step is needed to
host it**. The only build is compiling the TypeScript source to `assets/main.js`,
which is committed so any static host serves it directly.

## Development (TypeScript)

The interactive script is written in **strict TypeScript** (`src/main.ts`) and
compiled to `assets/main.js`.

```bash
npm install        # one-time: installs the TypeScript compiler
npm run build      # compile src/main.ts → assets/main.js
npm run watch      # recompile on save while developing
npm run typecheck  # strict type-check only (no emit)
```

After editing `src/main.ts`, run `npm run build` and commit the regenerated
`assets/main.js` along with it. Never edit `assets/main.js` directly.

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
