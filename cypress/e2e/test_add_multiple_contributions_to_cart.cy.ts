/// <reference types="cypress" />

describe("Checkout Flow - Multiple Contributions", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/v4/project_rewards?project=10", {
            statusCode: 200,
            body: [
                {
                    id: 4002,
                    project: "/v4/projects/10",
                    title: "Descarga digital de 'Apuntes para un territorio'",
                    description:
                        "Descarga digital del librodisco 'Apuntes para un territorio'\r\n\r\n¡Tu aportación desgrava! Descubre cuánto te devolverá Hacienda [AQUÍ](https://www.goteo.org/calculadora-fiscal)",
                    money: {
                        amount: 1000,
                        currency: "EUR",
                    },
                    hasUnits: false,
                    unitsTotal: 0,
                    unitsAvailable: 0,
                    locales: ["es"],
                },
            ],
        }).as("project10Rewards");

        cy.intercept("GET", "**/v4/project_rewards?project=20", {
            statusCode: 200,
            body: [
                {
                    id: 4001,
                    project: "/v4/projects/20",
                    title: "Concierto con banda",
                    description:
                        "Pack de 5 librodiscos de 'Apuntes para un territorio' \r\n+ Concierto en formato cuarteto para cualquier aforo o espacio (gastos de transporte y manutención, si fueran necesarios, no incluídos en el precio)\r\n\r\n¡Tu aportación desgrava! Descubre cuánto te devolverá Hacienda [AQUÍ](https://www.goteo.org/calculadora-fiscal)",
                    money: {
                        amount: 150000,
                        currency: "EUR",
                    },
                    hasUnits: false,
                    unitsTotal: 0,
                    unitsAvailable: 0,
                    locales: ["es"],
                },
            ],
        }).as("project20Rewards");

        cy.login();
        cy.url().should("not.include", "/login");
    });

    it("should successfully add multiple project contributions to cart and proceed to payment", () => {
        cy.visit("/es/projects/10");
        cy.wait("@project10Rewards");
        cy.get(".flex-col.gap-6 > .flex-row > .flex > .inline-block").click();

        cy.visit("/es/projects/20");
        cy.wait("@project20Rewards");
        cy.get(".flex-col.gap-6 > .flex-row > .flex > .inline-block").click();

        cy.contains("p.text-tertiary.font-bold", "Donación Platoniq")
            .parents(".flex.items-center.justify-between")
            .find("button.cursor-pointer:last")
            .click();

        cy.contains("Continuar", { timeout: 10000 })
            .filter(":visible")
            .first()
            .should("be.visible")
            .click({ force: true });

        cy.url({ timeout: 15000 }).should("include", "payment");
        cy.get("form#payment", { timeout: 10000 }).should("exist");
    });
});
