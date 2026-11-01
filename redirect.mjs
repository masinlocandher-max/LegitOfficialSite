// Redirect-only edge handler. Never serves a duplicate marketing page or captures tenant subdomains.
export const TARGET = 'https://senzpr.com/legit-official-site';
export const HOSTS = new Set(['legitofficialsite.com', 'www.legitofficialsite.com']);
export const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
export function destination(input) {
  const source = new URL(input);
  if (!HOSTS.has(source.hostname.toLowerCase())) return null;
  const target = new URL(TARGET);
  for (const key of CAMPAIGN_KEYS) {
    const value = source.searchParams.get(key);
    if (value && value.length <= 200 && !/[\r\n\u0000-\u001f]/.test(value)) target.searchParams.set(key, value);
  }
  return target.href;
}
export function handle(request) {
  const location = destination(request.url);
  if (!location) return new Response('Host not configured', {status:404,headers:{'Cache-Control':'no-store'}});
  if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed', {status:405,headers:{Allow:'GET, HEAD','Cache-Control':'no-store'}});
  return new Response(null,{status:308,headers:{Location:location,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
}
export default {fetch:handle};
