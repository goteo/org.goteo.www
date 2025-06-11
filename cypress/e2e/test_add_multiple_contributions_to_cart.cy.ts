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
                    description: "Descarga digital del librodisco 'Apuntes para un territorio'",
                    money: { amount: 1000, currency: "EUR" },
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
                    description: "Pack de 5 librodiscos + Concierto en formato cuarteto",
                    money: { amount: 150000, currency: "EUR" },
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

        cy.contains("button", "Continuar").should("be.visible").should("be.enabled").click();

        cy.url({ timeout: 10000 }).should("not.include", "/login");
        cy.url().should("include", "payment");
        cy.get("form#payment").should("exist");
    });
});
