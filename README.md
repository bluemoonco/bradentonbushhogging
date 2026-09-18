# bradentonbushhogging.com

Static site for Bradenton Bush-Hogging Co. — deployed via Cloudflare Pages.

## Repo structure

```
index.html     ← entire site (single-page)
_headers       ← Cloudflare Pages security headers
_redirects     ← www → apex redirect
README.md
```

## Before going live — one required step

**Set up Web3Forms** so the quote form delivers leads:

1. Go to [web3forms.com](https://web3forms.com)
2. Enter your email and grab the free access key
3. Open `index.html` and find this line (near the form):
   ```html
   <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_KEY">
   ```
4. Replace `YOUR_WEB3FORMS_KEY` with your actual key
5. Commit and push — done

Form submissions will arrive as email to whatever address you registered at Web3Forms.

## Deploying to Cloudflare Pages

1. Push this repo to GitHub
2. Log into [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create a project
3. Connect GitHub → select this repo
4. Build settings:
   - **Build command:** *(leave blank — static site)*
   - **Build output directory:** `/` (root)
5. Deploy
6. Add custom domain: `bradentonbushhogging.com`
7. Point DNS in Cloudflare: add a CNAME record for `@` → `<your-pages-subdomain>.pages.dev`

## Making updates

Edit `index.html` → commit → push to main → Cloudflare Pages auto-deploys in ~30 seconds.

You can ask Claude (or ChatGPT) to edit specific sections by pasting the relevant HTML.
