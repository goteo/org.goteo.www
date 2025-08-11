/// <reference types="cypress" />

describe("View total collected by single payments", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/v4/gateway_charges**", {
            statusCode: 200,
            body: {
                member: [
                    {
                        id: "charge_001",
                        amount: { amount: 4000, currency: "EUR" },
                        destination: "Al paso de los Caracoles",
                        origin: "Root Goteo",
                        method: "Tarjeta",
                        date: "2025-07-29",
                        status: "Cobrado",
                    },
                    {
                        id: "charge_002",
                        amount: { amount: 2000, currency: "EUR" },
                        destination: "Al paso de los Caracoles",
                        origin: "Root Goteo",
                        method: "Tarjeta",
                        date: "2025-07-29",
                        status: "Pendiente",
                    },
                    {
                        id: "charge_003",
                        amount: { amount: 3500, currency: "EUR" },
                        destination: "10º Aniversario de la Asociación",
                        origin: "Root Goteo",
                        method: "Tarjeta",
                        date: "2025-07-29",
                        status: "Cobrado",
                    },
                ],
                totalItems: 3,
            },
        }).as("chargesMock");

        cy.mockLogin();
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
