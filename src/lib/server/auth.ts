import { type RequestEvent } from "@sveltejs/kit";

import { encodeBase64url } from "@oslojs/encoding";
import { apiUsersIdGet, apiUserTokensIdGet } from "$client";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = "auth-session";

export function generateSessionToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const token = encodeBase64url(bytes);
    return token;
}

export async function createSession(token: string, userId: string, sessionId: number) {
    const session = {
        id: sessionId,
        userId,
        token,
        expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
    };
    console.log(`Created session ${sessionId} for user ${userId}`);
    return session;
}

export async function validateSessionToken(token: string) {
    console.log("Validating session token");
    const [sessionToken, sessionId] = token.split("#");
    console.debug("Session ID:", sessionId);
    console.debug("Session token:", sessionToken);

    if (!sessionToken || !sessionId) {
        console.log("Invalid session token");
        return { session: null, user: null };
    }

    // First get the session
    const { data: session, error: sessionError } = await apiUserTokensIdGet({
        path: { id: sessionId },
        headers: {
            Authorization: `Bearer ${sessionToken}`,
        },
    });

    if (sessionError || typeof session === "undefined") {
        console.log("No session found");
        return { session: null, user: null };
    }

    // Now get the user
    const userId = session.owner?.split("/").pop();
    if (!userId || !session.id) {
        console.log("No user ID found for session");
        return { session: null, user: null };
    }

    const { data: user, error } = await apiUsersIdGet({
        path: { id: userId },
        headers: {
            Authorization: `Bearer ${sessionToken}`,
        },
    });

    if (error || typeof user === "undefined") {
        return { session: null, user: null };
    }

    const renewSession = await createSession(sessionToken, userId, session.id);
    console.log("Session renewed");

    return { session: renewSession, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: number, token: string) {
    const { data: user, error } = await apiUsersIdGet({
        path: { id: sessionId.toString() },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (error || typeof user === "undefined") {
        return { session: null, user: null };
    }
    return { session: null, user };
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
    console.log("Setting session cookie");
    event.cookies.set(sessionCookieName, token, {
        expires: expiresAt,
        path: "/",
    });
}

export function deleteSessionTokenCookie(event: RequestEvent) {
    event.cookies.delete(sessionCookieName, {
        path: "/",
    });
}
