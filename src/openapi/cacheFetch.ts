export const PLATINIQ_API_CACHE = "platiniq-api";

export function createCachedFetch(
    cacheName: string = PLATINIQ_API_CACHE,
): (request: Request) => ReturnType<typeof fetch> {
    return async (request: Request) => {
        if (typeof window === "undefined" || request.method !== "GET") {
            return fetch(request);
        }

        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        if (response.ok) {
            await cache.put(request, response.clone());
        }
        return response;
    };
}
