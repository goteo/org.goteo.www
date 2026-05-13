import type { RequestOptions } from "@hey-api/client-fetch";

export const PLATINIQ_API_CACHE = "goteo-v4-api";

export function createBrowserCacheInterceptor(cacheName: string = PLATINIQ_API_CACHE) {
    return async (request: Request, opts: RequestOptions): Promise<Request> => {
        const originalFetch = opts.fetch ?? globalThis.fetch;
        opts.fetch = async (req: Request) => {
            if (req.method !== "GET") return originalFetch(req);
            const cache = await caches.open(cacheName);
            const cached = await cache.match(req);
            if (cached) return cached;
            const response = await originalFetch(req);
            if (response.ok) await cache.put(req, response.clone());
            return response;
        };
        return request;
    };
}
