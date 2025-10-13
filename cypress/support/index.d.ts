/// <reference types="cypress" />

// ========== GLOBAL TYPES ==========
interface UserProfile {
    id: number | null;
    email: string | null;
    name: string;
    accountingId: number | null;
    roles: string[];
    isAdmin: boolean;
    token: string | null;
}

type UserRole = "admin" | "user" | "userWithAdmin" | "moderator" | "guest";

// ========== CYPRESS EXTENSION ==========
declare namespace Cypress {
    interface Chainable<Subject = any> {
        // ========== NEW SCALABLE COMMANDS ==========

        /**
         * 🚀 NEW: Scalable role-based authentication
         * Automatically configures intercepts, localStorage and cookies
         * @example cy.loginAs('admin')
         * @example cy.loginAs('user')
         * @example cy.loginAs('userWithAdmin')
         * @example cy.loginAs('moderator')
         * @example cy.loginAs('guest')
         */
        loginAs(role: UserRole): Chainable<void>;

        /**
         * 🚀 NEW: Visit page with automatic authentication
         * @example cy.visitAs('admin', '/es/admin/charges')
         * @example cy.visitAs('user', '/es/project/123')
         */
        visitAs(role: UserRole, url: string): Chainable<void>;

        /**
         * 🚀 NEW: Verify that the user has the correct roles
         * @example cy.verifyUserRole('admin')
         */
        verifyUserRole(expectedRole: UserRole): Chainable<void>;

        /**
         * 🚀 NEW: Configure common intercepts automatically
         * @example cy.setupCommonIntercepts(profile)
         */
        setupCommonIntercepts(profile: UserProfile): Chainable<void>;

        // ========== EXISTING COMMANDS ==========

        /**
         * ⚠️  DEPRECATED: Use cy.loginAs('user') instead
         * Custom command to log in to the application
         * @example cy.login()
         * @example cy.login('user@example.com', 'password123')
         */
        login(username?: string, password?: string): Chainable<void>;

        /**
         * ⚠️  DEPRECATED: Use cy.loginAs('admin') instead
         * Custom command to mock authentication (useful for CI)
         * @example cy.mockLogin()
         */
        mockLogin(): Chainable<void>;

        /**
         * Custom command to bypass authentication by setting state directly
         * @example cy.loginBypass()
         */
        loginBypass(): Chainable<void>;

        /**
         * Custom command to check header elements
         * @example cy.checkHeaderElements()
         */
        checkHeaderElements(): Chainable<void>;

        /**
         * Custom command to change language
         * @example cy.changeLanguage('en')
         */
        changeLanguage(language: string): Chainable<void>;

        /**
         * Custom command to check login form validation
         * @example cy.checkLoginFormValidation()
         */
        checkLoginFormValidation(): Chainable<void>;

        /**
         * Command that actually uses the Subject type parameter
         */
        customCommand(): Chainable<Subject>;

        setupTestSpecificIntercepts(options: {
            skipGlobalGateways?: boolean;
            skipGlobalAuth?: boolean;
        }): void;
    }
}
