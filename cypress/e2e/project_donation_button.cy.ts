/// <reference types="cypress" />

describe("Project Donation Button", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/v4/project_rewards?project=2", {
            statusCode: 200,
            body: [
                {
                    id: 4001,
                    project: "/v4/projects/2",
                    title: "Recompensa del Proyecto 2",
                    description: "Una recompensa de ejemplo para el proyecto 2",
                    money: { amount: 2000, currency: "EUR" },
                    hasUnits: true,
                    unitsTotal: 10,
                    unitsAvailable: 8,
                    locales: ["es"],
                },
            ],
        }).as("project2Rewards");

        cy.intercept("GET", "**/v4/projects/2", {
            statusCode: 200,
            body: {
                id: 2,
                title: "Proyecto 2 de Prueba",
                amount: 8500,
                minimal: 3000,
                optimal: 15000,
                received: 8500,
                num_investors: 25,
                status: "active",
                currency: "EUR",
            },
        }).as("project2Data");

        cy.login();
        cy.on("uncaught:exception", () => false);
    });

    it("should show the 'Donate to this campaign' button visible and clickable", () => {
        cy.visit("/es/projects/2");

        cy.wait("@project2Rewards", { timeout: 3000 });

        cy.contains("button", "Donar a esta campaña").should("be.visible").and("be.enabled");
    });
});
