/// <reference types="cypress" />

describe("View total collected by single payments", () => {
    beforeEach(() => {
        cy.loginAs("admin");

        cy.intercept("GET", "**/v4/gateway_charges**", {
            statusCode: 200,
            headers: {
                "content-type": "application/ld+json",
            },
            body: {
                "@context": "/v4/contexts/GatewayCharge",
                "@id": "/v4/gateway_charges",
                "@type": "hydra:Collection",
                "hydra:member": [
                    {
                        "@id": "/v4/gateway_charges/charge_001",
                        "@type": "GatewayCharge",
                        id: "charge_001",
                        amount: 4000,
                        currency: "EUR",
                        status: "completed",
                        gateway: "stripe",
                        created_at: "2025-07-29T15:32:16+00:00",
                        destination: "Al paso de los Caracoles",
                        origin: "Root Goteo",
                        method: "Tarjeta",
                    },
                    {
                        "@id": "/v4/gateway_charges/charge_002",
                        "@type": "GatewayCharge",
                        id: "charge_002",
                        amount: 2000,
                        currency: "EUR",
                        status: "pending",
                        gateway: "stripe",
                        created_at: "2025-07-29T15:28:46+00:00",
                        destination: "Al paso de los Caracoles",
                        origin: "Root Goteo",
                        method: "Tarjeta",
                    },
                    {
                        "@id": "/v4/gateway_charges/charge_003",
                        "@type": "GatewayCharge",
                        id: "charge_003",
                        amount: 3500,
                        currency: "EUR",
                        status: "completed",
                        gateway: "paypal",
                        created_at: "2025-07-29T10:15:30+00:00",
                        destination: "10º Aniversario de la Asociación",
                        origin: "Root Goteo",
                        method: "Tarjeta",
                    },
                ],
                "hydra:totalItems": 3,
                "hydra:view": {
                    "@id": "/v4/gateway_charges?page=1&itemsPerPage=10&pagination=true",
                    "@type": "hydra:PartialCollectionView",
                    "hydra:first": "/v4/gateway_charges?page=1&itemsPerPage=10&pagination=true",
                    "hydra:last": "/v4/gateway_charges?page=1&itemsPerPage=10&pagination=true",
                },
                total_amount: "9,500",
                total_count: 3,
                currency: "EUR",
            },
        }).as("chargesMock");

        cy.on("uncaught:exception", () => false);
    });

    it("should display total raised amount in admin dashboard", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });
        cy.wait("@chargesMock");

        cy.contains("Aportes").should("be.visible");

        cy.contains("Total aportes:").should("be.visible");

        cy.get("body").should("contain.text", "€");

        cy.contains("Total Tips:").should("be.visible");
        cy.contains("Total comisiones:").should("be.visible");
    });
});