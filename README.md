# bradentonbushhogging.com

Static landing page for Bradenton Bush-Hogging Co. — bush hogging, lot mowing
and land clearing in Bradenton, Palmetto, Parrish and Ellenton, Florida.

No build step, no framework, no dependencies. Cloudflare Pages serves these
files as-is.

---

## Before your first deploy: paste your Web3Forms key

`index.html` has a placeholder:

```html
<input type="hidden" name="access_key" value="PASTE-YOUR-WEB3FORMS-KEY-HERE">
```

Replace it with the access key Web3Forms emailed you. Leads go to whatever
address that key is registered to — the key is the routing, so your email
address never appears in the page source.

Search the file for `PASTE-YOUR-WEB3FORMS-KEY-HERE`. It appears once.

The key is not a secret in the usual sense (it ships in the HTML by design),
but it's also not something to hand out. If it ever gets abused, revoke and
regenerate it at web3forms.com.

---

## Deploy

Cloudflare Pages → Create a project → Connect to Git → pick this repo.

Build settings:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `/` |
| Root directory | `/` |

There is nothing to build. If Pages asks for a command, leaving it blank is
correct — a build command here would only introduce a way for deploys to fail.

Every push to `main` deploys automatically. Pull requests get their own
preview URL.

---

## Custom domain

Pages → your project → Custom domains → add `bradentonbushhogging.com` and
`www.bradentonbushhogging.com`.

Set the redirect direction in the dashboard: `www` → apex, so you have one
canonical hostname. The canonical tag and the sitemap both point at the apex
(no `www`), so keep it that way or update both.

HTTPS is automatic. There is no HTTPS redirect in `_redirects` because
Cloudflare handles it before your files are ever reached.

---

## Files

```
index.html          the whole site — one page
thank-you.html      no-JS form fallback landing page
css/styles.css      all styling
js/main.js          form validation, submission, UX
assets/img/         SVG illustration, favicon, OG share image
_headers            security headers + caching (replaces .htaccess)
_redirects          old PHP URLs -> the form anchor
robots.txt
sitemap.xml
```

### `_headers` and `_redirects`

These are Cloudflare Pages' equivalent of `.htaccess`, which does nothing here.
`_headers` carries the security headers and cache policy; `_redirects` catches
the dead PHP URLs from the old host so any stale link lands on the form rather
than a 404.

Note the cache split: assets are cached for a year, HTML for zero seconds. If
you cache HTML, your edits appear to have no effect for hours. The `?v=` query
strings on the CSS and JS links are what let assets be cached aggressively —
bump them when you change those files.

---

## Editing

Edit, commit, push. That's the deploy.

Things that live in more than one place — change all of them together:

- **Phone.** `(941) 909-BUSH` on the buttons, `(941) 909-2874` in the footer
  and schema. All `tel:` links use `+19419092874`. The numeric form is what
  goes on Google Business Profile and directories; keep it consistent.
- **Coordinates.** `27.4850111, -82.4481625` appears **four** times: the
  `geo.position` meta, `ICBM` meta, `geo` in the JSON-LD, and `geoMidpoint`
  in `serviceArea`. If you move the pin in your Business Profile, update all four.
- **Address.** `9408 E State Road 64, Bradenton, FL 34212` — in the footer and
  the JSON-LD. Use that exact string on every directory listing.

---

## Images

The illustration is hand-built SVG — a few KB, sharp at any size, no licensing
risk. It's a placeholder for something better: photos of your own equipment on
your own jobs. Before/after pairs from real Manatee County lots will outconvert
any illustration here.

Name files descriptively when you add them
(`bush-hogging-parrish-fl-before-after.jpg`), keep them under ~300KB, and write
alt text as: what's happening + equipment + city + FL.

---

## Local preview

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. The form posts to Web3Forms over the network,
so it works from localhost too — be aware that test submissions send real email.
