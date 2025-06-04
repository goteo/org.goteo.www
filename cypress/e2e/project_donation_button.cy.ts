/// <reference types="cypress" />

describe("Project Donation Button", () => {
    beforeEach(() => {
        cy.login();
    });

    it("should show the 'Donate to this campaign' button visible and clickable", () => {
        cy.visit("/es/projects/2");
        cy.on("uncaught:exception", () => false);

        cy.url().should("include", "/es/projects/2");
        cy.contains("button", "Donar a esta campaña", { timeout: 10000 })
            .should("be.visible")
            .and("not.be.disabled");
    });
});
