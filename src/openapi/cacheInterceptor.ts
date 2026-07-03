import { client } from "./client/client.gen";
import { createBrowserCacheInterceptor } from "./cacheFetch";

let _interceptor: ReturnType<typeof createBrowserCacheInterceptor> | null = null;
let _interceptorId: number | null = null;

export function getCacheInterceptor() {
    return _interceptor;
}

export function getCacheInterceptorId() {
    return _interceptorId;
}

export function initCacheInterceptor() {
    _interceptor = createBrowserCacheInterceptor();
    _interceptorId = client.interceptors.request.use(_interceptor);
    return _interceptorId;
}

export async function withoutCache<T>(fn: () => Promise<T>): Promise<T> {
    if (!_interceptor) return fn();

    client.interceptors.request.eject(_interceptor);
    try {
        return await fn();
    } finally {
        client.interceptors.request.use(_interceptor);
    }
}
