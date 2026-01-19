import { getBaseUrl } from "./consts";
import { extractId } from "./extractId";
import { client } from "../openapi/client/client.gen";
import {
    apiAccountingsIdGetUrl,
    apiGatewayCheckoutsIdGetUrl,
    apiProjectsIdOrSlugGetUrl,
    apiTipjarsIdGetUrl,
    apiUsersIdGetUrl,
} from "../openapi/client/paths.gen";

import type { Accounting, GatewayCheckout, Project, Tipjar } from "../openapi/client";

export async function fetchWithPersistentCache<T>(iri: string, token: string, API_CACHE_NAME: string): Promise<T> {
    const cache = await caches.open(API_CACHE_NAME);

    const cached = await cache.match(iri);
    if (cached) return cached.json();

    const baseUrl = getBaseUrl();
    const fullUrl = joinUrl(baseUrl, iri);

    const response = await fetch(fullUrl, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/ld+json",
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    await cache.put(fullUrl, response.clone());
    return response.json();
}

export async function fetchAccounting(iri: string | null, token: string, API_CACHE_NAME: string) {
    if (!iri) return;

    const url = client.buildUrl({ url: apiAccountingsIdGetUrl, path: { id: extractId(iri) } });
    return fetchWithPersistentCache<Accounting>(url, token, API_CACHE_NAME);
}

export async function fetchUser(iri: string | null, token: string, API_CACHE_NAME: string) {
    if (!iri) return;

    const url = client.buildUrl({ url: apiUsersIdGetUrl, path: { id: extractId(iri) } });
    return fetchWithPersistentCache<User>(url, token, API_CACHE_NAME);
}

export async function fetchProject(iri: string | null, token: string, API_CACHE_NAME: string) {
    if (!iri) return;

    const url = client.buildUrl({
        url: apiProjectsIdOrSlugGetUrl,
        path: { idOrSlug: extractId(iri) },
    });
    return fetchWithPersistentCache<Project>(url, token, API_CACHE_NAME);
}

export async function fetchCheckout(iri: string | null, token: string, API_CACHE_NAME: string) {
    if (!iri) return;

    const url = client.buildUrl({
        url: apiGatewayCheckoutsIdGetUrl,
        path: { id: extractId(iri) },
    });
    return fetchWithPersistentCache<GatewayCheckout>(url, token, API_CACHE_NAME);
}

export async function fetchTipjar(iri: string | null, token: string, API_CACHE_NAME: string) {
    if (!iri) return;

    const url = client.buildUrl({
        url: apiTipjarsIdGetUrl,
        path: { id: extractId(iri) },
    });
    return fetchWithPersistentCache<Tipjar>(url, token, API_CACHE_NAME);
}

function joinUrl(base: string, path: string) {
    return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
