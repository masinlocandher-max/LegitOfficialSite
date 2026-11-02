# PURPOSE

This repository owns the acquisition domain redirect, related domain architecture, and the reusable **client website template library**.

SENZ sells it. SENZ App owns customer accounts and publication. Legit Official Site supplies the acquisition routing and website design templates.

FMB&CO → SENZ Strategic Communications & Digital Solutions → SENZ products and services. Legit Official Site is a digital solution by SENZ, not a separate company.

## WHAT THIS REPOSITORY OWNS

Exact-host acquisition routing, approved campaign parameter rules, domain boundaries, repeatable service delivery documentation, and 16 editable visitor website templates with a client-facing template studio. The template library was added at the owner's request after the initial redirect-only architecture.

## WHAT THIS REPOSITORY DOES NOT OWN

The canonical public product page belongs to Senz. Customer accounts, entitlements, billing, and publication belong to Senzapp. The template studio is a reusable design/editor surface, not a second company, marketing site, authentication system, checkout, or customer database. Its current saved drafts are browser-local and explicitly labeled that way.

## CANONICAL DOMAIN

legitofficialsite.com and www.legitofficialsite.com → https://www.senzpr.com/legit-official-site/. No wildcard redirect.

## RELATED REPOSITORIES

| Repository | Role |
| --- | --- |
| [Senz](https://github.com/masinlocandher-max/Senz) | Sell and explain |
| [Senzapp](https://github.com/masinlocandher-max/Senzapp) (private) | Deliver and operate |
| [LegitOfficialSite](https://github.com/masinlocandher-max/LegitOfficialSite) | Acquire, route, and own reusable visitor website templates |

## SOURCE-OF-TRUTH RULES

`redirect.mjs` and `campaign-rules.mjs` own routing. `studio/lib/templates.mjs` owns template definitions and `studio/lib/model.mjs` owns their versioned document format. Senzapp proves product capability; Senz decides whether and how products are offered. Template and add-on suggestions do not approve availability, prices, or customer access.

## DEPLOYMENT STATUS

Redirect behavior is verified locally. Live acquisition-host routing is not verified. No DNS, nameserver, MX, SPF, DKIM, DMARC, CAA or hosting setting was changed. See docs/operations/ECOSYSTEM_VERIFICATION.md.

## Development and reference

Run `npm run dev` and open `http://127.0.0.1:4173` for the template studio. `npm run build` produces the portable static studio in `dist/studio`. `npm run check` and `npm test` check all modules, templates, imports, export safety, local storage, and acquisition routing. `npm run test:browser` runs the repeatable browser journeys when Playwright and Chromium are installed. See [template studio and integration contract](docs/TEMPLATE_STUDIO.md).

[Top-level inventory](docs/architecture/DIRECTORY_AUDIT.md) records the earlier redirect-only audit. [Verification](docs/operations/ECOSYSTEM_VERIFICATION.md) distinguishes source, local tests, CI and live evidence. No current template work changes DNS, the acquisition handler, production release flags, or the customer app.

LEGIT OFFICIAL SITE — A Digital Solution by SENZ.

YOUR WEBSITE. YOUR SPACE. YOUR RULES.

Customer control remains subject to laws, security, hosting policies, intellectual-property rights, SENZ terms and agreed technical limits.

Read [service delivery](SERVICE_DELIVERY.md), [domain architecture](docs/DOMAIN_ARCHITECTURE.md), [customer subdomains](docs/CUSTOMER_SUBDOMAINS.md), [deployment](docs/DEPLOYMENT.md), and [commercial boundaries](docs/COMMERCIAL_BOUNDARIES.md). Approved campaign values are empty until a campaign is authorized; unknown values and personal information are not forwarded.
