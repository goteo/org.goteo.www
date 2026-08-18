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
        const body = (await request.json()) as { username?: string; password?: string };
        const { username, password } = body;

        if (typeof username !== "string" || typeof password !== "string") {
            throw new Error(locals.t("system.OAuth.client.error"));
        }

        const token = await passwordGrant({ identifier: username, password });

        const session = await buildSession(token);

        setSession(cookies, session);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: any) {
        return new Response(
            JSON.stringify({
                error_description: err.message || locals.t("system.OAuth.client.error"),
            }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
};
