# Vis Processing Agency

Production-oriented Next.js and MongoDB CMS conversion of the supplied Visim HTML template.

## Complete ZIP coverage

- All 25 supplied website HTML pages are retained as public routes.
- The original 12-part template asset archive is checksum-validated and restored during installation.
- A separate checksum-validated production source archive restores the exact CMS/application code before development and every build.
- Original Bootstrap/theme markup, CSS, fonts, imagery, sliders, galleries, menus, popups, counters, accordions, isotope filters, cart panels, and other vendor plugins are preserved.
- Broken vendor links (`course.html`, `price.html`, `login.html`) and the missing `arrow-6.svg` are repaired.
- Runtime deployment intentionally excludes only authoring-only SCSS/source maps, documentation, `.DS_Store`, and macOS duplicate metadata.

## Production features

- MongoDB CMS pages with full HTML, head, CSS, JavaScript, draft/publish, live preview, and per-page SEO
- Global contact/site settings and global content replacement
- Contact, consultation, comment, newsletter, checkout, and order interfaces connected to MongoDB
- Page search, product catalog, shop filtering/sorting, persistent cart, quantities, coupons, wishlist actions, and checkout orders
- Admin management for pages, products, orders, enquiries, media, users, settings, and activity
- GridFS image/PDF storage
- bcrypt password hashing, signed HTTP-only JWT sessions, roles, origin checks, and rate limiting
- User account history, enquiries, and orders
- Dynamic sitemap, robots.txt, Open Graph, Twitter cards, canonical URLs, and JSON-LD
- Verification of the 25-route set, preserved HTML structure, forms, direct and nested CSS assets, catalog data, production build, generated TypeScript types, and live HTTP routes

## Setup

```bash
cp .env.example .env.local
npm install
npm run verify
npm run seed
npm run dev
```

Use a real MongoDB URI and an `AUTH_SECRET` containing at least 32 random characters. Change the administrator credentials before running `npm run seed`.

## Deployment

Node.js 20.9 or newer is required. `postinstall` and `prebuild` restore and checksum-check the production source and original template assets, so standard Node/Vercel-style deployments receive the complete application even though the large assets are stored as repository archive parts.
