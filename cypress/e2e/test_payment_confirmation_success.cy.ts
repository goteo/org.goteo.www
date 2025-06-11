/// <reference types="cypress" />

describe("Stripe Verification Flow", () => {
    beforeEach(() => {
        cy.login();
        cy.url().should("not.include", "/login");
    });

    it("should handle successful payment verification with checkoutId", () => {
        cy.visit("/payment/verify?checkoutId=100");

        cy.contains(/pago se ha procesado/, { timeout: 10000 }).should("be.visible");
    });
});
