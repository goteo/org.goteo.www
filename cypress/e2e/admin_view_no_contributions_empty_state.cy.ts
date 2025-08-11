/// <reference types="cypress" />

describe("Visualization without contributions", () => {
    beforeEach(() => {
        cy.loginAs("admin");

        cy.intercept("GET", "**/v4/gateways**", {
            statusCode: 200,
            body: [
                { name: "stripe", title: "Stripe" },
                { name: "paypal", title: "PayPal" },
            ],
        }).as("gatewaysMock");

        cy.intercept("GET", "**/v4/gateway_charges**", {
            statusCode: 200,
            headers: {
                "content-type": "application/ld+json",
            },
            body: {
                "@context": "/v4/contexts/GatewayCharge",
                "@id": "/v4/gateway_charges",
                "@type": "hydra:Collection",
                "hydra:member": [],
                "hydra:totalItems": 0,
                "hydra:view": {
                    "@id": "/v4/gateway_charges?page=1&itemsPerPage=10&pagination=true",
                    "@type": "hydra:PartialCollectionView",
                },
                total_amount: "0",
                total_count: 0,
                currency: "EUR",
            },
        }).as("emptyChargesMock");

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
