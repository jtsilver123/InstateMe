# Moving instateme.com off Wix — cutover guide

The repo is ready to serve `instateme.com` from GitHub Pages. Nothing
changes until you (1) merge this branch to the default branch and
(2) update DNS. Do the steps in order — the site keeps working throughout.

## 0. What's changing

| Before | After |
| --- | --- |
| `instateme.com` → Wix | `instateme.com` → GitHub Pages (this repo) |
| `buy.instateme.com` → GitHub Pages (this repo) | `instateme.com/buy/` (same content, new URL) |

One repo can only serve **one** custom domain on GitHub Pages, so the
acquisition site now lives at `/buy/` under the main domain. Update any
outreach links from `buy.instateme.com` → `instateme.com/buy/`.

## 1. Merge this branch

Merge `claude/instateme-website-redesign-eddo7u` into the default branch
(`claude/zen-mayer-yu2tt8`). The `CNAME` file changes from
`buy.instateme.com` to `instateme.com` — from this moment GitHub stops
answering for `buy.instateme.com`, so do step 2 soon after.

## 2. Point DNS at GitHub Pages

At your DNS provider (wherever instateme.com's nameservers live — currently
Wix if you registered the domain there):

1. **Apex (`instateme.com`)** — create four `A` records:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   (Optionally add the `AAAA` records `2606:50c0:8000::153` … `8003::153`.)
2. **`www.instateme.com`** — `CNAME` record → `jtsilver123.github.io`
3. Delete/replace the old Wix `A`/`CNAME` records for `@` and `www`.
4. `buy.instateme.com` — either delete the record, or keep a redirect
   (see step 5).

If the domain is registered with Wix, you can keep registration there and
just edit the DNS records — or transfer the domain out entirely once the
site is off Wix.

## 3. Configure GitHub Pages

In the repo: **Settings → Pages**

1. Source: *Deploy from a branch* → default branch, `/ (root)`.
2. Custom domain: `instateme.com` (should auto-fill from the CNAME file).
3. Wait for the DNS check to pass, then enable **Enforce HTTPS**
   (certificate provisioning can take up to ~24h after DNS propagates).

`www.instateme.com` will 301-redirect to `instateme.com` automatically once
both records exist.

## 4. Decommission Wix

After confirming `instateme.com` serves the new site (check from your phone
on cellular, not just your computer, to dodge DNS caching):

1. In Wix: unpublish the site / cancel the premium plan renewal.
2. Keep the Wix account until the domain and any connected email are safely
   moved.
3. Old Wix URLs are preserved on the new site (`/faq`, `/reviews`,
   `/state-rules`, `/resources`, `/about`, `/meet`, `/referral-program`,
   `/post/<slug>`, `/privacy-policy`, `/terms-and-conditions`, …) so no
   redirects are needed — Google will re-crawl the same paths.
4. In Google Search Console, submit `https://instateme.com/sitemap.xml`.

## 5. What about buy.instateme.com?

Links in the wild pointing at `buy.instateme.com` will stop resolving once
its DNS record is removed. Options:

- **Cheapest**: delete the DNS record and use `instateme.com/buy/` in all
  future outreach.
- **Keep old links alive**: put the domain behind a redirect service
  (Cloudflare redirect rule, or your DNS host's URL-forwarding) sending
  `buy.instateme.com/*` → `https://instateme.com/buy/`.

## 6. Integration notes

- **Booking (Cal.com)**: all CTAs use `team/instateme/residency-consultation`.
- **Reviews**: testimonial.to wall — manage reviews at testimonial.to.
- **Stripe**: "Start Saving" uses the existing payment link.
- **Wix Bookings and Wix forms are gone.** The `/meet/` page now uses
  Cal.com. The Wix `chat center` no longer exists — FAQs point to booking
  instead.
- A backup "Book Your Free Consultation" Tally form exists at
  `tally.so/r/kdxqj1` (created during migration, currently unused by the
  site). Keep it as a lead-capture fallback or delete it in Tally.
