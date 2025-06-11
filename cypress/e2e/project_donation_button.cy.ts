/// <reference types="cypress" />

describe("Project Donation Button", () => {
    beforeEach(() => {
        cy.login();
        cy.on("uncaught:exception", () => false);
    });

    it("should show the 'Donate to this campaign' button visible and clickable", () => {
        cy.visit("/es/projects/2");

        cy.contains("button", "Donar a esta campaña").should("be.visible").and("be.enabled");
    });
});
