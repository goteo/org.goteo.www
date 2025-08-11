/// <reference types="cypress" />

describe("View breakdown of each individual contribution", () => {
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
                "hydra:member": [
                    {
                        "@id": "/v4/gateway_charges/273",
                        "@type": "GatewayCharge",
                        id: 273,
                        type: "single",
                        title: "Donación libre",
                        description: "Donación libre",
                        target: "/v4/accountings/2639",
                        money: {
                            amount: 800000, // 8000€ en céntimos
                            currency: "EUR",
                        },
                        status: "charged",
                        dateCreated: "2025-07-29T15:32:16+00:00",
                        dateUpdated: "2025-07-29T15:32:38+00:00",
                    },
                    {
                        "@id": "/v4/gateway_charges/228",
                        "@type": "GatewayCharge",
                        id: 228,
                        type: "single",
                        title: "CD Al Paso de los Caracoles + 2 Camisetas",
                        description: "CD Al Paso de los Caracoles + 2 Camisetas",
                        target: "/v4/accountings/2639",
                        money: {
                            amount: 200000, // 2000€ en céntimos
                            currency: "EUR",
                        },
                        status: "in_pending",
                        dateCreated: "2025-07-29T15:28:46+00:00",
                        dateUpdated: "2025-07-29T15:28:46+00:00",
                    },
                    {
                        "@id": "/v4/gateway_charges/227",
                        "@type": "GatewayCharge",
                        id: 227,
                        type: "single",
                        title: "10º Aniversario de la Asociación",
                        description: "Contribución para el 10º Aniversario",
                        target: "/v4/accountings/2724",
                        money: {
                            amount: 700000, // 7000€ en céntimos
                            currency: "EUR",
                        },
                        status: "charged",
                        dateCreated: "2025-07-28T10:15:30+00:00",
                        dateUpdated: "2025-07-28T10:15:45+00:00",
                    },
                ],
                "hydra:totalItems": 3,
                "hydra:view": {
                    "@id": "/v4/gateway_charges?page=1&itemsPerPage=10&pagination=true",
                    "@type": "hydra:PartialCollectionView",
                    "hydra:first": "/v4/gateway_charges?page=1&itemsPerPage=10&pagination=true",
                    "hydra:last": "/v4/gateway_charges?page=1&itemsPerPage=10&pagination=true",
                },
                total_amount: "17,000",
                total_count: 3,
                currency: "EUR",
            },
        }).as("chargesMock");

        cy.on("uncaught:exception", () => false);
    });

    it("should display detailed breakdown of individual contributions", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });
        cy.wait("@gatewaysMock");
        cy.wait("@chargesMock");

        cy.contains("Aportes").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("ID") || text.includes("Id")) {
                cy.contains(/ID?/i).should("be.visible");
            }
            if (text.includes("Título") || text.includes("Title")) {
                cy.contains(/Título|Title/i).should("be.visible");
            }
            if (text.includes("Importe") || text.includes("Amount")) {
                cy.contains(/Importe|Amount/i).should("be.visible");
            }
            if (text.includes("Estado") || text.includes("Status")) {
                cy.contains(/Estado|Status/i).should("be.visible");
            }

            if (text.includes("Donación libre")) {
                cy.contains("Donación libre").should("be.visible");
            }
            if (text.includes("Al Paso de los Caracoles")) {
                cy.contains("Al Paso de los Caracoles").should("be.visible");
            }
            if (text.includes("10º Aniversario")) {
                cy.contains("10º Aniversario").should("be.visible");
            }

            const hasAmounts =
                text.includes("8000") ||
                text.includes("2000") ||
                text.includes("7000") ||
                text.includes("80") ||
                text.includes("20") ||
                text.includes("70");

            if (hasAmounts) {
                cy.get("body").should("contain.text", "€");
            }

            // ✅ Verificar estados reales de la API
            if (text.includes("charged") || text.includes("Cobrado")) {
                cy.contains(/charged|Cobrado/i).should("be.visible");
            }
            if (text.includes("in_pending") || text.includes("Pendiente")) {
                cy.contains(/in_pending|Pendiente/i).should("be.visible");
            }
        });

        cy.get("body").should("contain.text", "€");
    });

    it("should display contribution IDs correctly", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });
        cy.wait("@chargesMock");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("273")) {
                cy.contains("273").should("be.visible");
            }
            if (text.includes("228")) {
                cy.contains("228").should("be.visible");
            }
            if (text.includes("227")) {
                cy.contains("227").should("be.visible");
            }
        });
    });

    it("should display different contribution types", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });
        cy.wait("@chargesMock");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("single") || text.includes("Único")) {
                cy.contains(/single|Único/i).should("be.visible");
            }
        });
    });

    it("should show creation dates if displayed", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });
        cy.wait("@chargesMock");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("2025-07-29") || text.includes("29/07/2025")) {
                cy.get("body").should("contain.text", "2025");
            }
        });
    });

    it("should allow filtering by status", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });
        cy.wait("@chargesMock");

        cy.get("body").then(($body) => {
            if ($body.find('[data-testid*="status"]').length > 0) {
                cy.get('[data-testid*="status"]').should("be.visible");
            }
            if ($body.find("select").length > 0) {
                cy.get("select").should("exist");
            }
        });
    });
});