export interface Env {
  EV_CONTENT: KVNamespace;            // editable content (JSON)
  EV_MEDIA?: R2Bucket;                 // project photos
  ACCESS_TEAM_DOMAIN: string;         // e.g. "evcompany.cloudflareaccess.com"
  ACCESS_AUD: string;                 // the Access application's audience tag
  ADMIN_EMAILS: string;               // comma-separated list of people allowed in
  DEV_ADMIN_BYPASS?: string;          // "1" only for local testing; ignored unless the host is localhost
}
export type Ctx = EventContext<Env, string, { user?: { email: string } }>;

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
