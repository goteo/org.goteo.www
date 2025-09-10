/// <reference types="cypress" />

describe("Login with Incorrect Password", () => {
    beforeEach(() => {
        cy.on("uncaught:exception", () => false);
    });

    it("Login with valid email but incorrect password (Negative Case)", () => {
        cy.visit("/login", { failOnStatusCode: false });
        cy.wait(2000);

        cy.get("body").should("exist");
        cy.get("form#login").should("be.visible");

        cy.get("input#identifier").type("root@goteo.org");
        cy.get("input#password").type("wrong-password");
        cy.get('button[form="login"]').click();

        cy.get("#login-error-content").should("be.visible");
        // .and("contain.text", "login.error.invalidCredentials")
    });
});
