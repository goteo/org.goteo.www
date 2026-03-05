/**
 * Access token structure stored in the access-token cookie
 * Contains user authentication and profile information
 */
export interface AccessToken {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
}
