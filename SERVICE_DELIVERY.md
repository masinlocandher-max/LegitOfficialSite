# Repeatable service delivery

## Offer

Legit Official Site is a SENZ managed website service for individuals, professionals, personal brands, businesses, companies and organizations. It is not restricted to registered businesses and does not confer identity or business verification.

Start with the smallest useful public presence. Personal, Professional, Business and Company are website configurations, not four brands or approved paid plans. Package names and prices remain unapproved. The public page is quote-led.

## Source of truth

- Reusable visitor designs and the local template studio now live in this repository under `studio/`, following the owner's 2 November 2026 template instruction. See `docs/TEMPLATE_STUDIO.md`. The studio is not yet wired into Senzapp's authenticated storage/publishing engine; browser-local drafts and HTML previews do not activate or publish a customer website. The existing engine capabilities below remain separate until an integration is implemented and verified.

- Commercial approval, public pricing and offer copy: `Senz/commercial/catalog.json`. Product-specific questionnaire presentation: `Senz/components/legit-official-site.json`; it has no independent commercial status or prices.
- Technical capabilities and production evidence: `Senzapp/src/catalog.js`; shared projections are generated and validated, never independently edited.
- The eligible management engine retains the `business-website` entitlement identifier to preserve purchased licenses. Its editor supports personal, professional, business and company presentation, approved contrast-safe themes, typography, layout, section priorities, section titles, photos, content and calls to action.
- This engine remains a one-page website. It does not implement custom-domain routing, ordering, online payments, arbitrary page creation or a blog. Multi-page/custom projects and integrations need an agreed delivery scope; do not sell an unimplemented self-service capability.
- The shared app release gate remains false. Production readiness, payment/agreement verification and any organization seats are still required. New marketing does not activate software. A private authenticated preview is available before publication; it does not send inquiries. Edits to published content are immediate, so unpublish first for private revisions. No staged revision/approval queue exists.

## Delivery stages and evidence

1. **Request:** collect the audience, visitor goals and domain preference. Transfer only fixed choice identifiers in the URL. Names, contact information and free text stay in the consented inquiry body.
2. **Scope:** identify essential content, pages, actions, customization and maintenance. Check the live capability and delivery capacity before including each add-on.
3. **Quote:** itemize setup, recurring service, domains, additional pages, content work, integrations, taxes where applicable, revision limits and delivery date. Publish no estimated or invented prices.
4. **Agreement:** record content/data rights, domain registrant, renewal payer, design/license terms, custom code, licensed SENZ components, hosting, export, cancellation and migration terms. These are agreement requirements, not preapproved contractual language.
5. **Payment / authorized agreement:** verify the actual record. A payment claim, submitted request or accepted recommendation is not an entitlement.
6. **Account:** create/invite the customer into the confirmed environment only when management tools are included and the deployment is approved. Show only eligible purchased tools; assign institutional seats where required.
7. **Content:** collect approved text, brand colors, typography preferences, photographs, service/product information, contact methods, domain control and necessary content rights. Never ask for passwords in a public form.
8. **Preparation:** build on the reusable website engine where it fits. Use a separate scoped build for requirements beyond its actual capabilities. Customize the visible identity meaningfully.
9. **Review:** record the customer's review and corrections. Verify text, links, form delivery, mobile layout, keyboard operation, contrast, SEO, privacy and domain configuration.
10. **Activation:** record approval, confirmed delivery, license/hosting period and launch URL. Then publish. Validate a real visitor-to-owner journey on the production environment before describing it as operational.
11. **Aftercare:** provide the management path, renewal dates, update process and support details. Agree optional upgrades only when they solve a real need.

## Domain options

- `name.legitofficialsite.com`: a managed subdomain licence, subject to provisioned DNS, TLS, routing and service terms; not ownership of the apex domain. Automated tenant provisioning is not implemented by the acquisition redirect.
- Customer-owned custom domain: remains with its registrant; connection is separate from ownership.
- New custom domain: confirm purchaser/registrant, registration fee, renewal fee, access and transfer arrangements before purchase. It is not included by default.

The app engine currently serves `/s/<slug>` on its configured app origin. Customer subdomains and independent custom domains need a separately verified hosting/routing implementation before activation. Never point a customer's hostname at an unrelated tenant or publish unverified DNS targets.

## Operations and measurement

The website reuses its existing inquiry delivery backend. The selector emits non-personal `senz:analytics` events and forwards to `dataLayer` only if one already exists. No analytics collector was found in the current site; events are hooks, not a claim of stored conversion reporting. Configure collection and the corresponding privacy terms before reporting funnel counts.

Measure qualified requests, quote acceptance, time to launch, support effort, recurring margin and renewals once a real collector and operating process exist. A completed page or passing local test is not evidence of payment, account activation, live email delivery or commercial readiness.
