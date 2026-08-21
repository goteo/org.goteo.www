import { passwordGrant } from "../../auth/grant";
import { buildSession, setSession } from "../../auth/session";

import type { APIRoute } from "astro";

/**
 * Exposes the current session to client-side code.
 */
export const GET: APIRoute = ({ locals }) => {
    return new Response(JSON.stringify(locals.session ?? null), {
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "private, no-store",
        },
    });
};

/**
 * Handles the POST request to log in using the OAuth2 password grant.
 */
export const POST: APIRoute = async ({ request, cookies, locals }) => {
    try {
        const body = (await request.json()) as { identifier?: string; password?: string };
        const { identifier, password } = body;

        if (typeof identifier !== "string" || typeof password !== "string") {
            throw new Error(locals.t("system.OAuth.The user credentials were incorrect"));
        }

        const token = await passwordGrant({ identifier, password });

        const session = await buildSession(token);

        setSession(cookies, session);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(err);

        return new Response(
            JSON.stringify({
                error: err instanceof Error ? err.message : String(err),
            }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
};
