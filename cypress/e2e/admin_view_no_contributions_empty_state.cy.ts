/// <reference types="cypress" />

describe("Visualization without contributions", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/v4/gateways**", {
            statusCode: 200,
            body: [
                { name: "stripe", title: "Stripe" },
                { name: "paypal", title: "PayPal" },
            ],
        }).as("gatewaysMock");

        cy.intercept("GET", "**/v4/gateway_charges**", {
            statusCode: 200,
            body: {
                member: [],
                totalItems: 0,
            },
        }).as("emptyChargesMock");

        cy.mockLogin();
        cy.on("uncaught:exception", () => false);
    });

    it("should load admin page even when no contributions exist", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });
        cy.wait("@gatewaysMock");
        cy.wait("@emptyChargesMock");

        cy.contains("Aportes").should("be.visible");
        cy.contains("Total aportes:").should("be.visible");

        cy.contains("Al paso de los Caracoles").should("not.exist");
        cy.contains("Root Goteo").should("not.exist");
    });
});
