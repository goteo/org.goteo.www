/// <reference types="cypress" />

describe("Register with Valid Email", () => {
    beforeEach(() => {
        cy.on("uncaught:exception", () => false);
    });

    it("Register with valid email address", () => {
        cy.visit("/es/register", { failOnStatusCode: false });
        cy.wait(2000);

        cy.get("body").should("exist");
        cy.get("form#register").should("be.visible");

        cy.get("input#firstname").type("John");
        cy.get("input#lastname").type("Doe");
        cy.get("input#identifier").type("root@goteo.org");
        cy.get("input#password").type("RootTestPass");
        cy.get("input#terms").check();
        cy.get("input#cookies").check();

        cy.get('button[type="submit"]').contains("Registrarse").click();

        cy.get("body").should("not.contain", "Error 500");
    });
});
