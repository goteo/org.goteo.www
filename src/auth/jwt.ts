export interface JWT {
    /**
     * Audience (who or what the token is intended for)
     */
    aud: string;

    /**
     * JWT ID (unique identifier for this token)
     */
    jti: string;

    /**
     * Issued at (seconds since Unix epoch)
     */
    iat: number;

    /**
     * Not valid before (seconds since Unix epoch)
     */
    nbf: number;

    /**
     * Expiration time (seconds since Unix epoch)
     */
    exp: number;

    /**
     * Subject (whom the token refers to)
     */
    sub: string;

    scopes?: string[];
}

/**
 * @param token The base64 encoded JWT string
 * @returns The decoded JWT object
 */
export function decodeJWT(token: string): JWT {
    const payload = token.split(".")[1];

    const json = Buffer.from(payload, "base64url").toString();

    return JSON.parse(json);
}
