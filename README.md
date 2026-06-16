# iac-ops.com — Landing Site

Temporary "in development" landing page for **Innovative Access Consultants, LLC**,
deployed to Cloudflare Pages (free tier). Single self-contained `index.html` —
no build step, no dependencies.

## Preview locally

```sh
open index.html          # macOS — opens in default browser
```

## Deploy to Cloudflare Pages

### Option A — Wrangler CLI (fastest, wrangler 4.x already installed)

```sh
cd ~/Projects/iac-ops-site
wrangler pages deploy . --project-name=iac-ops-site
```

First run prompts a browser login to your Cloudflare account.
Subsequent deploys are instant.

### Option B — Dashboard (no CLI)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Upload assets**
2. Drag this folder (or `index.html`) in → **Deploy**

## Attach the custom domain

Because `iac-ops.com` is already on Cloudflare, this is two clicks:

1. Pages project → **Custom domains → Set up a custom domain**
2. Add `iac-ops.com` (apex) and `www.iac-ops.com`
3. Cloudflare auto-creates the proxied DNS records (apex uses CNAME flattening)

> **DNS note:** the web records (apex/www → Pages) are independent of the
> email **MX** records. Setting up Pages will not disturb email, and vice
> versa — they are different record types.

## Editing copy

All copy is inline in `index.html`. The likely edits:

- Headline — currently *"We build the systems that run your operation."*
- Lede paragraph — the one-sentence description of what IAC does
- Contact address — currently `lucas@iac-ops.com`

If the brand positioning changes (consulting firm vs. product), the headline
and lede are the only blocks that need to move.
