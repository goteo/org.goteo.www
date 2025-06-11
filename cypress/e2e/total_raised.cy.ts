/// <reference types="cypress" />

describe("View Total Raised by One-time Payments", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/v4/gateway_charges*", {
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
                        "@id": "/v4/gateway_charges/1",
                        "@type": "GatewayCharge",
                        id: 1,
                        amount: 2500,
                        currency: "EUR",
                        status: "completed",
                        gateway: "stripe",
                        created_at: "2025-01-15T10:00:00Z",
                    },
                    {
                        "@id": "/v4/gateway_charges/2",
                        "@type": "GatewayCharge",
                        id: 2,
                        amount: 1500,
                        currency: "EUR",
                        status: "completed",
                        gateway: "paypal",
                        created_at: "2025-01-14T15:30:00Z",
                    },
                ],
                "hydra:totalItems": 247,
                "hydra:view": {
                    "@id": "/v4/gateway_charges?page=1&itemsPerPage=10&pagination=true",
                    "@type": "hydra:PartialCollectionView",
                    "hydra:first": "/v4/gateway_charges?page=1&itemsPerPage=10&pagination=true",
                    "hydra:last": "/v4/gateway_charges?page=25&itemsPerPage=10&pagination=true",
                    "hydra:next": "/v4/gateway_charges?page=2&itemsPerPage=10&pagination=true",
                },
                "hydra:search": {
                    "@type": "hydra:IriTemplate",
                },
                total_amount: "148,750",
                total_count: 247,
                currency: "EUR",
            },
        }).as("gatewayCharges");

        cy.login();
        cy.url().should("not.include", "/login");
    });

    it("should display total contributions amount", () => {
        cy.visit("/es/admin/aportes");

        cy.wait("@gatewayCharges", { timeout: 3000 });

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
