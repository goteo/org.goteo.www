import type { RequestOptions } from "@hey-api/client-fetch";

export const CACHE_NAME = "goteo-v4-api";

const DEFAULT_MAX_AGE_MS = 10_000;

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
        const originalFetch = opts.fetch ?? globalThis.fetch;

        opts.fetch = async (req: Request) => {
            if (req.method !== "GET") return originalFetch(req);

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
                await cache.put(req, updated.clone());
                return updated;
            }

            if (response.ok) {
                await cache.put(req, response.clone());
            }

            return response;
        };

        return request;
    };
}
