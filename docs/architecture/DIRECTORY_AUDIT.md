# Top-level responsibility audit — 2 November 2026

Scope update after this initial audit: the owner explicitly requested editable client website templates in this repository. `studio/`, `scripts/`, `e2e/`, and the template regression tests now own that reusable surface. See [template studio responsibilities](../TEMPLATE_STUDIO.md). This audit below records the earlier redirect-only reorganization, not a prohibition on the newly requested template work.

Audit covered tracked files, package scripts/imports, routes, API access checks, schema/migrations, tests, workflows, environment examples, CNAME/canonical tags and deployment references. Original source blobs were checked against upstream GitHub trees before editing. No useful customer tool or infrastructure was deleted. Git history retains original files; historical documents are not current operational instructions.

| Item | Decision | Reason |
| --- | --- | --- |
| `.github/` | KEEP | Existing CI retained; app adds actual cross-repository validation. |
| `README.md` | MERGE | Replaced contradictory responsibility/status instructions with one authoritative map and references. |
| `SERVICE_DELIVERY.md` | KEEP | Retained existing source/content; references and tests preserved. |
| `campaign-rules.mjs` | KEEP | Retained existing source/content; references and tests preserved. |
| `docs/` | KEEP | Distinct architecture, commercial, deployment, security and operations references. Superseded duplicates marked historical. |
| `package.json` | KEEP | Retained existing source/content; references and tests preserved. |
| `redirect.mjs` | KEEP | Retained existing source/content; references and tests preserved. |
| `redirect.test.mjs` | KEEP | Retained existing source/content; references and tests preserved. |
| `release-evidence.json` | KEEP | Preserved historical release evidence; current verification is separate and does not rewrite past claims as new evidence. |
| `test/` | KEEP | Unit/API regression and boundary tests. |

No per-customer repository was introduced. No auth, customer database, licenses or private execution was found in the active Senz public runtime; the unused historical Supabase schema was archived rather than copied into a live app migration. Existing app schema and purchased data remain intact. Source files under docs/archive and case-studies are not executable deployment instructions.
