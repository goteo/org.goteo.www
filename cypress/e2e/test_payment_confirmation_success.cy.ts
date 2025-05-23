/// <reference types="cypress" />

describe("Stripe Payment Flow", () => {
    beforeEach(() => {
        cy.login();
        cy.url().should("not.include", "/login");
    });

    it("should handle successful payment verification with checkoutId", () => {
        cy.visit("/payment/verify?checkoutId=100");

        cy.get("body", { timeout: 15000 }).should("be.visible");

        cy.contains(/pago se ha procesado/, { timeout: 15000 }).should("exist");
    });
});
