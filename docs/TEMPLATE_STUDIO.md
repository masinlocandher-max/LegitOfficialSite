# Editable client website templates

The owner's 2 November 2026 instruction expands this repository to own reusable visitor website templates and their editing surface. This is an explicit addition to the earlier redirect-only boundary. SENZ remains the provider; Senzapp remains the account, entitlement, and publishing owner.

## Start and use

```sh
npm run dev
# Open http://127.0.0.1:4173
npm run check
npm test
npm run build
```

For repeatable browser checks: `npm ci`, `npx playwright install chromium`, then `npm run test:browser`. Playwright is a development-only dependency, pinned in the lockfile. Set `CHROMIUM_EXECUTABLE_PATH` to use an existing supported Chromium installation. `QA_OUTPUT_DIR` optionally places screenshots outside the repository; otherwise the test uses an OS temporary directory.

Choose or preview a design, edit the content, style, and sections, then inspect the desktop/mobile and visitor previews. Save a draft on the device, download its editable JSON backup, or download a self-contained HTML website preview. Imported drafts are validated before they replace anything. Replacing a current draft requires an explicit choice; switching designs can retain all client content.

The editor uses native JavaScript, HTML, and CSS, consistent with the existing dependency-free repository and the customer application's frontend. No new framework, service, tracker, login system, customer database, or package runtime dependency was added.

## Initial library

| Template | Initial website use | Distinct composition |
| --- | --- | --- |
| Atelier | Creative studio | Editorial split hero, horizontal work rows |
| Presence | Consultant or professional | Business introduction, service columns |
| Gather | Local business or hospitality | Wide photograph first, centered welcome |
| Outline | Freelancer or personal brand | Bold typographic statement, project columns |
| Forma | Shop or maker's collection | Product-led hero and photographic collection |
| Horizon | Company or organization | Centered purpose and wide architectural image |
| Calm | Salon, wellness, appointment services | Arched image and ordered service list |
| Stay | Accommodation or venue inquiries | Wide space photograph and accommodation cards |
| Table | Restaurant menu or ordering destination | Large menu typography, round food photo, menu rows |
| Frame | Photography or design portfolio | Wide photographic work and staggered projects |
| Signal | Startup or launch page | Oversized centered statement and explanation columns |
| Occasion | Event or celebration | Editorial invitation and programme list |
| Chapter | Education, workshops, or programmes | Split learning introduction and programme columns |
| Common | Community, association, or cause | Large mission introduction and initiative rows |
| Address | Property or viewing inquiries | Property introduction, wide photo, listing cards |
| Portrait | Personal profile or résumé | Personal introduction and experience rows |

All are responsive one-page website configurations. Additional navigation scrolls to the chosen sections; it does not imply a multi-page CMS. Client text, images, logos, contact details, services/products, prices or durations, FAQs, gallery items, section order and visibility, color palette, button color, and typography are editable. There are no invented prices, testimonials, customer counts, registrations, or completed transactions.

## Templates versus digital products

A template is the visitor-facing design and content. A digital product adds a separately activated workflow. The Tools panel offers quote requests and a place to connect the public HTTPS link of an existing active tool. It does not buy, grant, or activate an entitlement. No payment processing or ordering form is simulated.

- Appointment templates can link to a separately activated booking destination. The existing SENZ Booking engine supports appointment requests, not deposits or automatic reminders.
- Stay templates initially support reservation inquiries. Overnight availability, room inventory, and deposits require separately scoped and verified services.
- Table supports menu presentation and a link to an existing order destination. SENZ QR Menu and Digital Catalog do **not** process orders or payments. Full ordering/checkout is a separate custom scope until a verified offering exists.
- Occasion can link to separately activated event registration. The existing Event Systems engine does not sell tickets.
- Forma can link to a separate inquiry catalog; inquiry lists are not paid orders.
- Add-on names and limits were checked against Senzapp `src/catalog.js` when implemented. `studio/lib/addons.mjs` is a UI suggestion map, not an independent commercial catalog. It contains no prices, availability flags, payment URLs, or release assertions.

## Modules and contract

- `studio/lib/templates.mjs`: stable template IDs, palette choices, sample content, and `createDraft` / `changeTemplate`.
- `studio/lib/model.mjs`: schema version 1, strict import normalization, maximum lengths and item counts, safe image/link types, and section reordering.
- `studio/lib/render.mjs`: pure `renderSite(draft, options)` HTML document renderer. Uses the same renderer in gallery, editor, visitor preview, and exported website.
- `studio/lib/editor.mjs`: scoped field editors and add-on presentation.
- `studio/lib/storage.mjs`: explicit local persistence and editable backup import/export; handles unavailable/quota-limited storage without reporting a successful save.
- `studio/lib/media.mjs`: local raster uploads, resizing, and export embedding. SVG is not accepted. Metadata is removed by browser canvas encoding.
- `studio/app.mjs`: gallery, filters, draft state, editor tabs, confirmations, and desktop/mobile preview sizing.
- `studio/site.css`: shared visitor base and distinct template compositions.
- `studio/studio.css`: client editor styling, responsive layout, keyboard focus, reduced motion.

`renderSite` accepts bundled trusted CSS, an asset base, optional embedded assets, and an embedded font. Customer documents cannot supply arbitrary CSS, HTML, JavaScript, iframe markup, font URLs, or remote image URLs. Links must be HTTPS (without credentials), and built-in email/phone actions use validated values. Custom button colors use automatically selected black/white text for contrast. Uploaded raster images are stored in the draft as bounded data URLs. Drafts have a maximum size of 8 MB.

Visitor previews are sandboxed without scripts or same-origin access. There is no postMessage command listener and no third-party tracking. Preview/export documents are `noindex,nofollow`. The self-contained HTML download embeds its sample/uploaded images and font; it works without the development server. It is a preview, not evidence of publication.

## Senzapp integration boundary

The studio currently saves to this browser only. It is not connected to signed-in cloud drafts. It must not be described as deployed, purchased, or available in a customer account until integrated and verified there.

For integration, import the template modules and styles into the customer app at a pinned commit (or adopt a reviewed package transport). Keep one upstream definition in this repository rather than copying editable catalogs that can diverge. Mount the editor under the existing authenticated website workspace. Replace local persistence with the existing server-authorized workspace storage, preserving membership, seat, role, license, CSRF, media ownership, and tenant isolation checks. Never accept the client draft as an entitlement.

The current Senzapp presentation enum does not already contain these 16 templates. Do not silently push this schema into its existing settings endpoint. Add a versioned server-side document contract, validate it there, migrate existing website data deliberately, and use the shared renderer for private previews and public output. Public media delivery needs existing tenant-owned media checks; local embedded image data is not a replacement for the managed media lifecycle.

Publication must continue through Senzapp's verified activation and customer approval path, with license-end and unpublish behavior preserved. An externally configured tool link only navigates to that tool; its availability and access controls remain that tool's responsibility. This work does not change production routes, release flags, domains, checkout, or cloud storage.

The acquisition host remains redirect-only. `npm run build` builds `dist/studio` as a mountable surface, not a new apex-domain application. Do not deploy the dev server or expose the entire repository. The included dev server serves only `studio/`, defaults to loopback, and rejects writes and repository-file access.

## Assets

Inter is self-hosted with its license. Georgia and system fonts provide the editorial alternatives. The ceramic still life, architectural interior, and meal are generated sample imagery for template demonstration; they are not photographs of actual client premises, products, or projects. They are replaceable in the editor and must be reviewed before any real client publication. No SENZ logo approximation or real customer identity was invented.

## Visual implementation direction

Reference concepts established a white/navy editor shell, elevated pill buttons, a three-column desktop gallery, a 385px editor rail, neutral gray preview stage, and cream editorial Atelier composition. The gallery was expanded from six to sixteen templates following the owner's additional instruction. Search, extra use-case filters, a Tools tab, import/export actions, explicit local-save status, and full downstream sections are intentional functional extensions. Atelier uses a separate photo frame instead of text over a full-bleed image so arbitrary client uploads cannot obscure the headline or button. The original template directions retain their distinct palette, typography, and composition; photos remain replaceable and their focus is editable.
