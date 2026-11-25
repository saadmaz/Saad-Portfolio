/**
 * Runs the server handlers as Cloudflare Pages Functions.
 *
 * Handlers are written against a small Node-style request/response pair
 * (req.headers, req.query, req.body; res.status().json()), which keeps them
 * easy to unit test. `pagesFunction` turns one into a Pages `onRequest`, and
 * `runHandler` lets the routing middleware call one directly (rewrites such
 * as /rss.xml → feed).
 *
 * Bindings (secrets and vars set in the Cloudflare dashboard) are copied onto
 * process.env, so handlers read configuration the same way in tests and on
 * Cloudflare (nodejs_compat is enabled in wrangler.toml).
 */

/** Static-asset binding Cloudflare Pages provides as env.ASSETS. */
export interface AssetFetcher {
  fetch(input: Request | string): Promise<Response>;
}

export interface PagesEnv {
  ASSETS?: AssetFetcher;
  [key: string]: unknown;
}

export interface PagesContext {
  request: Request;
  env: PagesEnv;
  next: (input?: Request | string) => Promise<Response>;
  waitUntil?: (p: Promise<unknown>) => void;
}

type HeaderValue = string | undefined;
type Body = ConstructorParameters<typeof Response>[0];

export interface ApiRequest {
  method?: string;
  url?: string;
  headers: Record<string, HeaderValue>;
  query: Record<string, string | undefined>;
  // Parsed JSON (or the raw text when it isn't JSON); handlers validate it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  socket?: { remoteAddress?: string };
  /** Reads a built static file (dist/…) without going back through the middleware. */
  asset?: (path: string) => Promise<Response | null>;
}

export interface ApiResponse {
  setHeader(name: string, value: string): ApiResponse;
  status(code: number): ApiResponse;
  json(data: unknown): ApiResponse;
  send(body: string | Uint8Array): ApiResponse;
  end(): ApiResponse;
  redirect(code: number, location: string): ApiResponse;
}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => unknown | Promise<unknown>;

/** Copies string bindings onto process.env (idempotent per isolate). */
export function bindEnv(env: PagesEnv) {
  const target = (globalThis as { process?: { env?: Record<string, string> } }).process;
  if (!target) return;
  target.env ??= {};
  for (const [k, v] of Object.entries(env)) if (typeof v === "string") target.env[k] = v;
}

async function toApiRequest(
  request: Request,
  env: PagesEnv,
  query?: Record<string, string>,
): Promise<ApiRequest> {
  const url = new URL(request.url);
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
  let body: unknown;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const text = await request.text();
    if (text.length > 100_000) body = "";
    else {
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = text;
      }
    }
  }
  const assets = env.ASSETS;
  return {
    method: request.method,
    url: url.pathname + url.search,
    headers,
    query: { ...Object.fromEntries(url.searchParams), ...query },
    body,
    socket: { remoteAddress: headers["cf-connecting-ip"] },
    asset: assets
      ? async (path) => {
          try {
            const r = await assets.fetch(new URL(path, url.origin).toString());
            return r.ok ? r : null;
          } catch {
            return null;
          }
        }
      : undefined,
  };
}

/** Collects what a handler writes and turns it into a Web Response. */
class ResponseBuilder implements ApiResponse {
  code = 200;
  headers = new Headers();
  body: Body = null;

  setHeader(name: string, value: string) {
    this.headers.set(name, value);
    return this;
  }
  status(code: number) {
    this.code = code;
    return this;
  }
  json(data: unknown) {
    if (!this.headers.has("content-type"))
      this.headers.set("content-type", "application/json; charset=utf-8");
    this.body = JSON.stringify(data);
    return this;
  }
  send(body: string | Uint8Array) {
    this.body = body as Body;
    return this;
  }
  end() {
    return this;
  }
  redirect(code: number, location: string) {
    this.code = code;
    this.headers.set("location", location);
    return this;
  }
  toResponse() {
    const empty = this.code === 204 || this.code === 304 || this.body === null;
    return new Response(empty ? null : this.body, { status: this.code, headers: this.headers });
  }
}

export async function runHandler(
  handler: ApiHandler,
  request: Request,
  env: PagesEnv,
  query?: Record<string, string>,
): Promise<Response> {
  bindEnv(env);
  const res = new ResponseBuilder();
  await handler(await toApiRequest(request, env, query), res);
  return res.toResponse();
}

/** `export const onRequest = pagesFunction(handler)` in functions/api/*.ts. */
export const pagesFunction =
  (handler: ApiHandler) =>
  (ctx: PagesContext): Promise<Response> =>
    runHandler(handler, ctx.request, ctx.env);
