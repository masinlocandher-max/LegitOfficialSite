# Exact-host routing

Only `legitofficialsite.com` and `www.legitofficialsite.com` return HTTP 308 to `https://www.senzpr.com/legit-official-site/` for GET and HEAD. Paths are not forwarded. The target is outside the allowed source host set, preventing a redirect loop. Unsupported methods return 405 with `Allow: GET, HEAD`; other hosts return 404. HEAD has no response body.

Only the five UTM keys in `campaign-rules.mjs`, with exact approved values, bounded safe syntax and no duplicate keys, may survive. Values are empty until owner campaign approval. Do not put names, email, phone, token, credentials or redirect URLs in this vocabulary. Arbitrary parameters, fragments, URL credentials and unexpected protocols/ports are discarded or rejected. Add unit fixtures whenever approval changes.

The existing domain provider is not identified by this source file. No wildcard redirect or DNS mutation is implied.
