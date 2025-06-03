/// <reference types="cypress" />

describe("View Total Raised by One-time Payments", () => {
    beforeEach(() => {
        cy.login();
        cy.url().should("not.include", "/login");
    });

    it("should display total contributions amount", () => {
        cy.visit("/es/admin/aportes");

        cy.contains("Total aportes:")
            .should("be.visible")
            .and("have.class", "text-base")
            .and("have.class", "font-semibold")
            .and("have.class", "text-[#575757]");

        cy.get(".text-secondary")
            .should("be.visible")
            .and("contain.text", "€")
            .and("have.class", "text-[40px]");
    });
});
