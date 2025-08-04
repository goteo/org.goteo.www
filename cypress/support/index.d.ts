/// <reference types="cypress" />

// ========== TIPOS GLOBALES ==========
interface UserProfile {
    id: number | null;
    email: string | null;
    name: string;
    accountingId: number | null;
    roles: string[];
    isAdmin: boolean;
    isAuthenticated: boolean;
    token: string | null;
}

type UserRole = "admin" | "user" | "userWithAdmin" | "moderator" | "guest";

// ========== EXTENSIÓN DE CYPRESS ==========
declare namespace Cypress {
    interface Chainable<Subject = any> {
        // ========== COMANDOS ESCALABLES NUEVOS ==========

        /**
         * 🚀 NUEVO: Autenticación escalable por rol
         * Configura automáticamente intercepts, localStorage y cookies
         * @example cy.loginAs('admin')
         * @example cy.loginAs('user')
         * @example cy.loginAs('userWithAdmin')
         * @example cy.loginAs('moderator')
         * @example cy.loginAs('guest')
         */
        loginAs(role: UserRole): Chainable<void>;

        /**
         * 🚀 NUEVO: Visitar página con autenticación automática
         * @example cy.visitAs('admin', '/es/admin/charges')
         * @example cy.visitAs('user', '/es/project/123')
         */
        visitAs(role: UserRole, url: string): Chainable<void>;

        /**
         * 🚀 NUEVO: Verificar que el usuario tiene los roles correctos
         * @example cy.verifyUserRole('admin')
         */
        verifyUserRole(expectedRole: UserRole): Chainable<void>;

        /**
         * 🚀 NUEVO: Configurar intercepts comunes automáticamente
         * @example cy.setupCommonIntercepts(profile)
         */
        setupCommonIntercepts(profile: UserProfile): Chainable<void>;

        // ========== COMANDOS EXISTENTES ==========

        /**
         * ⚠️  DEPRECATED: Usar cy.loginAs('user') en su lugar
         * Custom command to log in to the application
         * @example cy.login()
         * @example cy.login('user@example.com', 'password123')
         */
        login(username?: string, password?: string): Chainable<void>;

        /**
         * ⚠️  DEPRECATED: Usar cy.loginAs('admin') en su lugar
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
    }
}
