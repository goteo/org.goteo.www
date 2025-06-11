/// <reference types="cypress" />

describe("Stripe Verification Flow", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/v4/payments/verify*", {
            statusCode: 200,
            body: {
                checkoutId: "100",
                status: "completed",
                payment_status: "paid",
                message: "El pago se ha procesado correctamente",
                transaction_id: "stripe_tx_12345",
                amount: 4000,
                currency: "EUR",
            },
        }).as("paymentVerify");

        cy.intercept("GET", "**/v4/checkout/*/status", {
            statusCode: 200,
            body: {
                id: "100",
                status: "completed",
                payment_method: "stripe",
                verified: true,
                message: "pago se ha procesado",
            },
        }).as("checkoutStatus");

        cy.intercept("GET", "**/v4/checkout/100", {
            statusCode: 200,
            body: {
                id: "100",
                status: "completed",
                amount: 4000,
                currency: "EUR",
                payment_method: "stripe",
                verified_at: new Date().toISOString(),
            },
        }).as("checkoutDetails");

        cy.login();
        cy.url().should("not.include", "/login");
    });

    it("should handle successful payment verification with checkoutId", () => {
        cy.visit("/payment/verify?checkoutId=100");

        cy.contains(/pago se ha procesado/, { timeout: 3000 }).should("be.visible");
    });
});
