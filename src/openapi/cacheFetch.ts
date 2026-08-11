import type { RequestOptions } from "@hey-api/client-fetch";

export const CACHE_NAME = "goteo-v4-api";

const DEFAULT_MAX_AGE_MS = 10_000;

/**
 * Whether a response may be written to the cache at all.
 *
 * Cache Storage is not the HTTP cache: `cache.put()` stores whatever it is handed and never
 * consults the response's own directives. Anything marked `no-store` or `private` is meant
 * for one reader on one occasion, so honouring those here is what keeps that promise.
 */
function isStorable(response: Response): boolean {
    const cacheControl = response.headers.get("Cache-Control")?.toLowerCase() ?? "";

    return !cacheControl.includes("no-store") && !cacheControl.includes("private");
}

function isStaleCache(cached: Response, defaultMaxAgeMs: number = DEFAULT_MAX_AGE_MS): boolean {
    const cacheControl = cached.headers.get("Cache-Control")?.toLowerCase() ?? "";

    if (
        cacheControl.includes("no-cache") ||
        cacheControl.includes("must-revalidate") ||
        cached.headers.get("Pragma")?.toLowerCase() === "no-cache"
    ) {
        return true;
    }

    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) * 1000 : defaultMaxAgeMs;

    if (!maxAgeMatch) {
        const expires = cached.headers.get("Expires");
        if (expires) {
            const expiresTime = new Date(expires).getTime();
            if (!isNaN(expiresTime)) {
                const remaining = expiresTime - Date.now();
                return remaining <= 0;
            }
        }
    }

    const dateHeader = cached.headers.get("Date") ?? cached.headers.get("Last-Modified");
    if (dateHeader) {
        const age = Date.now() - new Date(dateHeader).getTime();
        if (age > maxAge) return true;
    }

    return false;
}

export function createBrowserCacheInterceptor(cacheName: string = CACHE_NAME) {
    return async (request: Request, opts: RequestOptions): Promise<Request> => {
        if (import.meta.env.PUBLIC_DISABLE_CACHE === "true") {
            return request;
        }
        const originalFetch = opts.fetch ?? globalThis.fetch;

        opts.fetch = async (req: Request) => {
            /**
             * Authenticated responses never go near this cache.
             *
             * `cache.match()` keys on the URL — request headers only enter the key when the
             * stored response says so through `Vary`. Two people asking the same URL with
             * different bearer tokens therefore land on the same entry, and whoever asks
             * second reads what the first one fetched. The cache is also shared by everyone
             * using the browser profile, so it outlives a logout.
             *
             * Skipping the cache entirely costs a ten-second dedupe window (see
             * `DEFAULT_MAX_AGE_MS`) and leaves the `ETag` revalidation to the network, which
             * is a small price for not keeping one reader's data where another can reach it.
             */
            if (req.method !== "GET" || req.headers.has("Authorization")) {
                return originalFetch(req);
            }

            const cache = await caches.open(cacheName);
            const cached = await cache.match(req);

            if (cached && !isStaleCache(cached)) {
                return cached;
            }

            const headers = new Headers(req.headers);

            const etag = cached?.headers.get("ETag");
            if (etag) headers.set("If-None-Match", etag);

            const lastModified = cached?.headers.get("Last-Modified");
            if (!etag && lastModified) headers.set("If-Modified-Since", lastModified);

            const response = await originalFetch(new Request(req, { headers }));

            if (response.status === 304 && cached) {
                const updated = new Response(cached.body, {
                    ...cached,
                    headers: response.headers,
                });

                // The revalidation may be the moment the resource turns private. Drop what we
                // hold rather than refreshing it, so the entry does not outlive its welcome.
                if (isStorable(updated)) {
                    await cache.put(req, updated.clone());
                } else {
                    await cache.delete(req);
                }

                return updated;
            }

            if (response.ok && isStorable(response)) {
                await cache.put(req, response.clone());
            }

            return response;
        };

        return request;
    };
}
