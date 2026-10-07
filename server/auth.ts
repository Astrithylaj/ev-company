// Checks the Cloudflare Access login on every admin request, on top of Access itself (defence in depth):
// signature against the team's public keys, audience, issuer, expiry, and that the email is on the allow list.
import type { Env } from './env';

type Jwk = JsonWebKey & { kid: string };
let certs: { keys: Jwk[]; at: number } | null = null;

const b64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const decode = (s: string) => JSON.parse(new TextDecoder().decode(b64url(s)));

async function keys(team: string, force = false): Promise<Jwk[]> {
  if (!force && certs && Date.now() - certs.at < 3600_000) return certs.keys;
  const res = await fetch(`https://${team}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error('certs');
  const body = (await res.json()) as { keys: Jwk[] };
  certs = { keys: body.keys, at: Date.now() };
  return body.keys;
}

function cookie(req: Request, name: string) {
  const m = (req.headers.get('cookie') || '').match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export async function adminUser(req: Request, env: Env): Promise<{ email: string } | null> {
  const host = new URL(req.url).hostname;
  if (env.DEV_ADMIN_BYPASS === '1' && (host === 'localhost' || host === '127.0.0.1')) return { email: 'dev@localhost' };

  const token = req.headers.get('Cf-Access-Jwt-Assertion') || cookie(req, 'CF_Authorization');
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;
  const [h, p, sig] = token.split('.');
  if (!h || !p || !sig) return null;
  try {
    const header = decode(h), payload = decode(p);
    if (header.alg !== 'RS256') return null;
    let list = await keys(env.ACCESS_TEAM_DOMAIN);
    let jwk = list.find((k) => k.kid === header.kid);
    if (!jwk) { list = await keys(env.ACCESS_TEAM_DOMAIN, true); jwk = list.find((k) => k.kid === header.kid); }
    if (!jwk) return null;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(sig), new TextEncoder().encode(`${h}.${p}`));
    if (!ok) return null;
    const now = Math.floor(Date.now() / 1000);
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(env.ACCESS_AUD)) return null;
    if (payload.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) return null;
    if (typeof payload.exp !== 'number' || payload.exp < now) return null;
    const email = String(payload.email || '').toLowerCase();
    const allowed = (env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (!email || !allowed.includes(email)) return null;
    return { email };
  } catch {
    return null;
  }
}
