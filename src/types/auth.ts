/**
 * Access token structure stored in the access-token cookie
 * Contains user authentication and profile information
 */
export interface AccessToken {
    id: number;
    token: string;
    accountingId: string;
    isAdmin?: boolean;
    user: {
        id: number;
        email: string;
        name: string;
    };
    person: {
        name: string;
        avatar?: string;
    };
}
