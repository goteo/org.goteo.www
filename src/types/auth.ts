/**
 * Object received from OAuth flows with the v4 API OAuth layer.
 */
export interface OAuthResponse {
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
