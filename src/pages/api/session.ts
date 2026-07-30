import type { APIRoute } from "astro";

/**
 * Exposes the current session to client-side code.
 *
 * The session cookie is http-only, so the browser cannot read it on its own. Serving the
 * session from here — rather than serializing it into the island props of every page —
 * keeps the access and refresh tokens out of the HTML document, which is what allows the
 * public pages to be cached without leaking one visitor's credentials to the next.
 */
export const GET: APIRoute = ({ locals }) => {
    return new Response(JSON.stringify(locals.session ?? null), {
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "private, no-store",
        },
    });
};
