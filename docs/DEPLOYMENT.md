# Acquisition redirect deployment

The dependency-free Fetch handler is source and locally tested behavior, not a provisioned edge service. Preserve the existing domain provider and infrastructure. No provider was changed or authenticated for deployment in this change.

Before activation, inspect/export current DNS and redirect rules, identify the actual edge/forwarding service and verify HTTPS for apex/www. Prefer the existing provider's routing capability if it can enforce exact hosts, methods and query-value allowlists. Otherwise deploy this handler to the existing compatible edge runtime. Never attach a wildcard route. DNS alone cannot redirect an HTTP path.

Run `npm run check`, `npm test` and the cross-repository contract check. On a real host verify HTTP and HTTPS, apex/www, GET/HEAD, POST rejection, approved campaigns, unsafe/duplicate parameter removal, canonical destination and a customer-subdomain negative test. Compare DNS exports to ensure nameservers and MX/SPF/DKIM/DMARC/CAA remain unchanged. Retain the previous edge rule for rollback.

`release-evidence.json` remains historical evidence of the previous public product page; it does not attest to this redirect deployment. Current observations are recorded in docs/operations/ECOSYSTEM_VERIFICATION.md. No GoDaddy or Railway use is authorized.
