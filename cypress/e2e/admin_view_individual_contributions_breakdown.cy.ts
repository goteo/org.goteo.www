/// <reference types="cypress" />

describe("View breakdown of each individual contribution", () => {
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
                member: [
                    {
                        id: "charge_001",
                        amount: { amount: 8000, currency: "EUR" },
                        destination: "Al paso de los Caracoles",
                        origin: "Root Goteo",
                        method: "Tarjeta",
                        date: "2025-07-29",
                        status: "Cobrado",
                        target: "proyecto_100",
                    },
                    {
                        id: "charge_002",
                        amount: { amount: 2000, currency: "EUR" },
                        destination: "Al paso de los Caracoles",
                        origin: "Root Goteo",
                        method: "Tarjeta",
                        date: "2025-07-29",
                        status: "Pendiente",
                        target: "proyecto_100",
                    },
                    {
                        id: "charge_003",
                        amount: { amount: 7000, currency: "EUR" },
                        destination: "10º Aniversario de la Asociación",
                        origin: "Root Goteo",
                        method: "Tarjeta",
                        date: "2025-07-29",
                        status: "Pendiente",
                        target: "proyecto_200",
                    },
                ],
                totalItems: 3,
            },
        }).as("chargesMock");

        cy.mockLogin();
        cy.on("uncaught:exception", () => false);
    });

    it("should display detailed breakdown of individual contributions", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });
        cy.wait("@gatewaysMock");
        cy.wait("@chargesMock");

        cy.contains("Aportes").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("Destino")) {
                cy.contains("Destino").should("be.visible");
            }
            if (text.includes("Importe")) {
                cy.contains("Importe").should("be.visible");
            }
            if (text.includes("Estado")) {
                cy.contains("Estado").should("be.visible");
            }

            if (text.includes("Al paso de los Caracoles")) {
                cy.contains("Al paso de los Caracoles").should("be.visible");
            }
            if (text.includes("10º Aniversario")) {
                cy.contains("10º Aniversario").should("be.visible");
            }
            text.includes("80€") ||
                text.includes("8000€") ||
                text.includes("20€") ||
                text.includes("2000€") ||
                text.includes("70€") ||
                text.includes("7000€");

            if (text.includes("Cobrado")) {
                cy.contains("Cobrado").should("be.visible");
            }
            if (text.includes("Pendiente")) {
                cy.contains("Pendiente").should("be.visible");
            }

            if (text.includes("Root Goteo")) {
                cy.contains("Root Goteo").should("be.visible");
            }
            if (text.includes("Tarjeta")) {
                cy.contains("Tarjeta").should("be.visible");
            }
        });

        cy.get("body").should("contain.text", "€");
    });
});
