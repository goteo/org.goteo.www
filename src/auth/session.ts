import { refreshToken } from "./grant";
import { decodeJWT } from "./jwt";
import {
    apiAccountingsIdGet,
    apiUsersIdorganizationGet,
    apiUsersIdOrHandleGet,
    apiUsersIdpersonGet,
} from "../openapi/client";
import { extractId } from "../utils/extractId";

import type { OAuthToken, Session } from "./types";
import type { AstroCookies } from "astro";

const COOKIE_NAME = "session";

/**
 * Retrieve the session data from session cookie
 * @param cookies AstroCookies interface
 * @returns The Session data
 */
export async function getSession(cookies: AstroCookies): Promise<Session | undefined> {
    const auth = cookies.get(COOKIE_NAME);

    if (!auth) return undefined;

    const session: Session = auth.json();
    session.expires_at = new Date(session.expires_at);

    if (!isExpired(session)) {
        return session;
    }

    try {
        const token = await refreshToken(session.token);
        const fresh = await buildSession(token);

        setSession(cookies, fresh);

        return fresh;
    } catch (err) {
        console.error(err);
        clearSession(cookies);

        return undefined;
    }
}

/**
 * Store the session data into a secure, http-only cookie
 * @param cookies AstroCookies interface
 * @param session The Session data
 */
export function setSession(cookies: AstroCookies, session: Session) {
    cookies.set(COOKIE_NAME, session, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
    });
}

/**
 * Delete the session data from session cookie
 * @param cookies AstroCookies interface
 */
export function clearSession(cookies: AstroCookies) {
    cookies.delete(COOKIE_NAME, { path: "/" });
}

/**
 * Checks if a given session is expired
 * @param session The session to check for expiration
 * @param margin Time (in ms) of margin to consider a session expired before the actual expiration date
 * @returns `true` if the given session is expired
 */
export function isExpired(session: Session, margin: number = 300000): boolean {
    return Date.now() >= session.expires_at.getTime() - margin;
}

/**
 * Obtain session data from a given OAuth token
 * @param token An OAuth /token response
 * @returns A storable Session object
 */
export async function buildSession(token: OAuthToken): Promise<Session> {
    const jwt = decodeJWT(token.access_token);

    const expiresAt = new Date(jwt.exp * 1000);

    if (new Date() > expiresAt) {
        throw new Error("Cannot build a Session from an expired token");
    }

    const { data: user } = await apiUsersIdOrHandleGet({
        path: { idOrHandle: jwt.sub },
        headers: token.asHttpHeaders,
    });

    if (!user) {
        throw new Error("The User of the token does not exist");
    }

    const {
        [0]: { data: accounting, error: accountingError },
        [1]: { data: person },
        [2]: { data: organization },
    } = await Promise.all([
        apiAccountingsIdGet({
            path: { id: extractId(user.accounting)! },
            headers: token.asHttpHeaders,
        }),
        apiUsersIdpersonGet({
            path: { id: String(user.id) },
            headers: token.asHttpHeaders,
        }),
        apiUsersIdorganizationGet({
            path: { id: String(user.id) },
            headers: token.asHttpHeaders,
        }),
    ]);

    if (!accounting || accountingError) {
        console.error(accountingError);
        throw new Error("Could not retrieve Accounting for the User of the token");
    }

    return {
        token,
        user: user,
        expires_at: expiresAt,
        accounting: accounting,
        person: person!,
        organization,
    };
}
