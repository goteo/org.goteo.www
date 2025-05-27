/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable<Subject = any> {
        /**
         * Custom command to log in to the application
         * @example cy.login()
         * @example cy.login('user@example.com', 'password123')
         */
        login(username?: string, password?: string): Chainable<void>;

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
