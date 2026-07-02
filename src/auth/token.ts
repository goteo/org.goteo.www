import type { OAuthToken } from "./types";

export function withHttpHeaders(token: OAuthToken): OAuthToken {
    switch (token.token_type) {
        case "Bearer":
            return {
                ...token,
                asHttpHeaders: { Authorization: `${token.token_type} ${token.access_token}` },
            };
    }

    return token;
}
