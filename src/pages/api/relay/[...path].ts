import { getBaseUrl } from "../../../utils/consts";

import type { APIRoute } from "astro";

/**
 * API Relay Endpoint
 *
 * This endpoint acts as a server-side proxy for authenticated API requests.
 * It prevents exposing user tokens on the client-side by:
 * 1. Accepting requests from the client without auth headers
 * 2. Adding authentication headers on the server-side
 * 3. Forwarding the request to the actual API
 * 4. Returning the response back to the client
 *
 * Usage from client:
 * ```ts
 * const response = await fetch('/api/relay/v4/users/123', {
 *   method: 'GET',
 *   headers: { 'Accept-Language': 'en' }
 * });
 * ```
 */
export const ALL: APIRoute = async ({ request, cookies, params }) => {
    // Extract the API path from the catch-all parameter
    const apiPath = params.path || "";

    // Get the access token from cookies
    const accessToken = cookies.get("access-token")?.value;

    if (!accessToken) {
        return new Response(
            JSON.stringify({ error: "Unauthorized", message: "No access token found" }),
            {
                status: 401,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    try {
        // Parse the token to get the actual bearer token
        const tokenData = JSON.parse(accessToken);
        const bearerToken = tokenData.token || accessToken;

        // Build the target URL
        const url = new URL(request.url);
        const targetUrl = `${getBaseUrl()}/${apiPath}${url.search}`;

        // Prepare headers
        const headers = new Headers(request.headers);
        headers.set("Authorization", `Bearer ${bearerToken}`);

        // Remove host header to avoid conflicts
        headers.delete("host");

        // Prepare request body for methods that support it
        let body: string | null = null;
        if (request.method === "POST" || request.method === "PUT" || request.method === "PATCH") {
            body = await request.text();
        }

        // Forward the request to the actual API
        const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            body,
        });

        // Get the response body
        const responseText = await response.text();

        // Return the response back to the client
        return new Response(responseText, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "application/json",
                // Copy other relevant headers
                ...(response.headers.get("Content-Language") && {
                    "Content-Language": response.headers.get("Content-Language")!,
                }),
            },
        });
    } catch (error) {
        console.error("API Relay Error:", error);

        return new Response(
            JSON.stringify({
                error: "Internal Server Error",
                message: error instanceof Error ? error.message : "Unknown error",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
};
