import type { RequestOptions } from "@hey-api/client-fetch";

export const CACHE_NAME = "goteo-v4-api";

function isStaleCache(cached: Response): boolean {
    const cacheControl = cached.headers.get("Cache-Control")?.toLowerCase() ?? "";
    const pragma = cached.headers.get("Pragma")?.toLowerCase() ?? "";

    if (
        cacheControl.includes("no-cache") ||
        cacheControl.includes("must-revalidate") ||
        pragma === "no-cache"
    ) {
        return true;
    }

    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
        const maxAge = parseInt(maxAgeMatch[1], 10) * 1000;
        const dateHeader = cached.headers.get("Date");
        if (dateHeader) {
            const age = Date.now() - new Date(dateHeader).getTime();
            if (age > maxAge) return true;
        }
    }

    const expires = cached.headers.get("Expires");
    if (expires) {
        const expiresTime = new Date(expires).getTime();
        if (!isNaN(expiresTime) && Date.now() > expiresTime) return true;
    }

    const etag = cached.headers.get("ETag");
    if (etag) {
        return true;
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

            if (!cached || isStaleCache(cached)) {
                const headers = new Headers(req.headers);

                const etag = cached?.headers.get("ETag");
                if (etag) headers.set("If-None-Match", etag);

                const response = await originalFetch(new Request(req, { headers }));
                if (response.status === 304 && cached) {
                    const updated = new Response(cached.body, {
                        ...cached,
                        headers: response.headers,
                    });
                    await cache.put(req, updated.clone());

                    return updated;
                }

                if (response.ok) await cache.put(req, response.clone());

                return response;
            }

            return cached;
        };

        return request;
    };
}
