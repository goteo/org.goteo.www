import { withHttpHeaders } from "./token";

import type { OAuthToken } from "./types";

export async function authorizationCode(args: {
    code: string;
    redirectUri: string;
}): Promise<OAuthToken> {
    const params = new URLSearchParams();
    params.set("grant_type", "authorization_code");
    params.set("code", args.code);
    params.set("redirect_uri", args.redirectUri);
    params.set("client_id", import.meta.env.OAUTH2_CLIENT_ID);
    params.set("client_secret", import.meta.env.OAUTH2_CLIENT_SECRET);

    const oauth: OAuthToken = await fetch(new URL("/oauth/token", import.meta.env.PUBLIC_API_URL), {
        method: "POST",
        body: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
        .then((res) => res.json())
        .then((token) => withHttpHeaders(token));

    if (oauth.error!) {
        console.error(oauth);
        throw new Error(oauth.error_description);
    }

    return oauth;
}

export async function refreshToken(token: OAuthToken): Promise<OAuthToken> {
    if (token.refresh_token === undefined) {
        throw new Error("Cannot refresh the given token as it does not have a refresh_token");
    }

    const params = new URLSearchParams();
    params.set("grant_type", "refresh_token");
    params.set("refresh_token", token.refresh_token);
    params.set("client_id", import.meta.env.OAUTH2_CLIENT_ID);
    params.set("client_secret", import.meta.env.OAUTH2_CLIENT_SECRET);

    const oauth: OAuthToken = await fetch(new URL("/oauth/token", import.meta.env.PUBLIC_API_URL), {
        method: "POST",
        body: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
        .then((res) => res.json())
        .then((token) => withHttpHeaders(token));

    if (oauth.error!) {
        console.error(oauth);
        throw new Error(oauth.error_description);
    }

    return oauth;
}
