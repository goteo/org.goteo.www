import type { Accounting, Organization, Person, User } from "../openapi/client";

/**
 * Object received from OAuth flows with the v4 API OAuth layer.
 */
export interface OAuthToken {
    [x: string]: any;
    token_type: string;

    /**
     * An integer representing the TTL of the access token
     */
    expires_in: number;

    /**
     * A JWT signed with the authorization server's private key.
     */
    access_token: string;

    /**
     * An encrypted payload that can be used to refresh the access token when it expires.
     */
    refresh_token?: string;
}

/**
 * Represents an authenticated User session.
 */
export interface Session {
    /**
     * The token that authenticates the session.
     */
    token: OAuthToken;

    /**
     * Date of expiration of the session.
     */
    expires_at: Date;

    /**
     * The session owner.
     */
    user: User;

    /**
     * Accounting object of the session owner.
     */
    accounting: Accounting;

    /**
     * Person data of the session owner.
     */
    person: Person;

    /**
     * Organization data, if any, of the session owner.
     */
    organization?: Organization;
}
