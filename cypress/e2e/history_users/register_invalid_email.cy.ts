/// <reference types="cypress" />

describe("Register with Invalid Email", () => {
    beforeEach(() => {
        cy.on("uncaught:exception", () => false);
    });

    it("Register with invalid email address (Negative Case)", () => {
        cy.visit("/register", { failOnStatusCode: false });
        cy.wait(2000);

        cy.get("body").should("exist");
        cy.get("form#register").should("be.visible");

        cy.get("input#firstname").type("John");
        cy.get("input#lastname").type("Doe");
        cy.get("input#identifier").type("email-invalido");
        cy.get("input#password").type("SecurePassword123");
        cy.get("input#terms").check();
        cy.get("input#cookies").check();

        cy.get('button[type="submit"]').contains("Registrarse").click();

        cy.get("input#identifier").then(() => {
            cy.url().should("include", "/register");
        });
    });
});
