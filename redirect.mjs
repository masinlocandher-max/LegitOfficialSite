import {APPROVED_CAMPAIGN_VALUES} from './campaign-rules.mjs';
// Redirect-only edge handler. Never serves a duplicate marketing page or captures tenant subdomains.
export const TARGET = 'https://www.senzpr.com/legit-official-site/';
export const HOSTS = new Set(['legitofficialsite.com', 'www.legitofficialsite.com']);
export const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
export function destination(input, approvedValues = APPROVED_CAMPAIGN_VALUES) {
  let source;
  try { source = new URL(input); } catch { return null; }
  if (!['http:', 'https:'].includes(source.protocol) || source.username || source.password || source.port) return null;
  if (!HOSTS.has(source.hostname.toLowerCase())) return null;
  const target = new URL(TARGET);
  for (const key of CAMPAIGN_KEYS) {
    const value = source.searchParams.get(key);
    // Campaign labels only: reject common PII and token shapes even under UTM keys.
    if (source.searchParams.getAll(key).length !== 1) continue;
    if (approvedValues[key]?.includes(value) && value && value.length <= 80 && /^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/.test(value) &&
        !/\d{7,}/.test(value.replace(/[ _-]/g,'')) && !/[a-zA-Z0-9]{24,}/.test(value)) target.searchParams.set(key, value);
  }
  return target.href;
}
export function handle(request) {
  const location = destination(request.url);
  if (!location) return new Response(request.method==='HEAD'?null:'Host not configured', {status:404,headers:{'Cache-Control':'no-store'}});
  if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed', {status:405,headers:{Allow:'GET, HEAD','Cache-Control':'no-store'}});
  return new Response(null,{status:308,headers:{Location:location,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
}
export default {fetch:handle};
