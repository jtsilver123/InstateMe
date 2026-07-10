# instateme.com

The InstateMe website, hosted on **GitHub Pages** (moved off Wix).

- **`/` (root)** — the main marketing site (`instateme.com`): home, reviews,
  FAQs, state rules, resources/blog, about, booking, referral program, legal.
- **`/buy/`** — the buyer-facing acquisition microsite (formerly
  `buy.instateme.com`, now served at `instateme.com/buy/`). Marked
  `noindex` and excluded from robots/sitemap. See `buy/README.md`.

Everything is plain static HTML/CSS/JS — **no build step is needed to host
it**. The only build is compiling the TypeScript sources to JS, and the
compiled output is committed.

## Structure

```
CNAME                 # instateme.com (GitHub Pages custom domain)
index.html            # home page
<page>/index.html     # every page is a folder with an index.html (clean URLs)
post/<slug>/          # blog posts (URLs preserved from the old Wix site)
assets/               # main-site css, compiled js, images, icons
src/main.ts           # main-site TypeScript (nav, savings calculator, reveals)
buy/                  # acquisition microsite (own assets/, src/, tsconfig)
sitemap.xml           # generated list of indexable pages
robots.txt            # allows all except /buy/ and /entity-creation-success/
404.html              # GitHub Pages custom 404
```

## Integrations

- **Booking** — Cal.com (`team/instateme/residency-consultation`). Every
  "Book Free Consultation" button opens the Cal.com modal via the
  element-click embed; `/meet/` hosts the inline calendar. The `href`
  fallback (`/meet/`) works without JavaScript.
- **Reviews** — testimonial.to wall embed (id `42438543-…`) on the home page
  and `/reviews/`.
- **Payments** — "Start Saving" links to the existing Stripe payment link.

## Development

```bash
npm install        # one-time: installs the TypeScript compiler
npm run build      # compile src/ and buy/src/ TypeScript
npm run typecheck  # strict type-check only
```

After editing `src/main.ts` (or `buy/src/main.ts`), run `npm run build` and
commit the regenerated JS. Never edit `assets/main.js` by hand.

Run locally:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

Page HTML is hand-editable; the shared header/footer are repeated in each
page's `index.html`, so cross-page chrome changes need to be applied to every
page (search & replace works well).

## Deploying

Merging to the default branch publishes via GitHub Pages. See
`DEPLOYMENT.md` for the one-time DNS cutover from Wix and what happens to
`buy.instateme.com`.
