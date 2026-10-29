# K Gems International

Marketing site for K Gems International (Pvt) Ltd — Sri Lankan fine gemstones,
with a scroll-driven 3D hero, collection, documentation guidance and private
enquiries.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, React Three Fiber
and GSAP ScrollTrigger.

## Getting started

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>.

```bash
npm run lint     # ESLint
npm run build    # production build
npm start        # serve the production build
```

## Content to verify before launch

- **Inventory** — `data/gemstones.ts` contains demonstration listings. Replace
  references, weights, origins, treatment, certification and availability with
  verified stock before publishing.
- **Contact details and locations** — `lib/site.ts`.
- **Legal pages** — `app/privacy/page.tsx` and `app/terms/page.tsx`.
- **Site URL** — set `NEXT_PUBLIC_SITE_URL` in the deployment environment so
  canonical links, the sitemap and structured data use the production domain.

## Enquiries

`POST /api/enquiry` validates submissions, applies rate limiting and origin
checks, then appends the record to `.data/enquiries.jsonl` (gitignored) and
optionally forwards it to a webhook.

```bash
ENQUIRY_WEBHOOK_URL="https://example.com/hooks/enquiries"
ENQUIRY_WEBHOOK_SECRET="optional-bearer-token"
```

For a serverless deployment, point `ENQUIRY_WEBHOOK_URL` at an email or CRM
endpoint: the local `.data` file is not durable on ephemeral filesystems.

Rate limiting allows 5 enquiries per IP every 15 minutes, held in memory per
instance. Client IPs are taken from the platform, not from request headers the
visitor can set. Set `ENQUIRY_TRUSTED_IP_HEADER` to the header your host sets
from the real connection (for example `cf-connecting-ip` or `x-real-ip`). With
no value set, the rightmost `X-Forwarded-For` entry is used. Limits are per
instance, so a multi-instance deployment needs a shared store to enforce them
globally. Request bodies are capped at 20 KB, and the cap is enforced while
reading the stream, not just from the `Content-Length` header.

## Brand assets

The supplied artwork is `K Gems Sapphire Logo.png` at the project root. Its
transparency checkerboard is flattened into the pixels, so the circular emblem
is masked and rebuilt rather than used directly.

```bash
node scripts/build-logo-assets.mjs
```

This writes `public/brand/k-gems-badge.webp`, `app/icon.png`,
`app/apple-icon.png` and `public/og.jpg`. It requires `sharp` and, for the
social card typography, the Cormorant Garamond and Inter fonts. If the fonts
are not installed system-wide, point `FONTCONFIG_FILE` at a fontconfig file that
includes them.
