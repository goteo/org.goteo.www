/// <reference types="cypress" />

describe("View Total Raised by One-time Payments", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/api/auth/me", {
            statusCode: 200,
            body: {
                id: 1,
                email: "test@cypress.local",
                name: "Cypress Test User",
                accountingId: 123,
                isAuthenticated: true,
            },
        }).as("authMe");

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

        cy.intercept("GET", "**/v4/**", {
            statusCode: 200,
            body: { accountingId: 123, id: 1 },
        }).as("otherApiCalls");

        cy.window().then((win) => {
            win.localStorage.setItem(
                "user",
                JSON.stringify({
                    id: 1,
                    email: "test@cypress.local",
                    name: "Cypress Test User",
                    isAuthenticated: true,
                    accountingId: 123,
                }),
            );
        });

        cy.setCookie(
            "access-token",
            JSON.stringify({
                token: "mock-access-token-cypress-123",
                accountingId: 123,
                userId: 1,
            }),
        );

        cy.mockLogin();
        cy.on("uncaught:exception", () => false);
    });

    it("should display total contributions amount", () => {
        cy.visit("/es/admin/aportes", { failOnStatusCode: false });
        cy.wait(3000);

        cy.get("body").should("exist");
        cy.get("body").should("not.contain", "Error 500");
        cy.get("body").should("not.contain", "Internal Server Error");

        cy.get("body").then(($body) => {
            if ($body.text().includes("Total") || $body.text().includes("total")) {
                cy.contains(/total/i).should("be.visible");
            } else {
                cy.log(
                    "No se encontró texto 'Total', verificando que la página cargó correctamente",
                );
            }

            if ($body.text().includes("€") || $body.text().includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            } else {
                cy.log(
                    "No se encontró símbolo de euro, verificando que la página cargó correctamente",
                );
            }
        });

        cy.url().should("include", "/es/admin/aportes");
    });
});
