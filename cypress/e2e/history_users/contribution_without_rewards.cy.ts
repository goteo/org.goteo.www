/// <reference types="cypress" />

describe("Contribution without reward", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/v4/project_rewards**", {
            statusCode: 200,
            body: [
                {
                    id: 3827,
                    project: "/v4/projects/100",
                    title: "CD + 2 Camisetas",
                    description: "CD físico firmado + 2 camisetas edición limitada",
                    money: { amount: 4000, currency: "EUR" },
                    hasUnits: true,
                    unitsTotal: 5,
                    unitsAvailable: 5,
                    locales: ["es"],
                },
                {
                    id: 3816,
                    project: "/v4/projects/100",
                    title: "CD Al Paso de los Caracoles",
                    description: "CD físico firmado",
                    money: { amount: 1500, currency: "EUR" },
                    hasUnits: false,
                    unitsTotal: 0,
                    unitsAvailable: 0,
                    locales: ["es"],
                },
            ],
        }).as("rewardsMock");

        cy.intercept("GET", "**/v4/accountings/**", {
            statusCode: 200,
            body: {
                id: 2639,
                name: "Test User Account",
                email: "test@cypress.local",
                accountingId: 2639,
                isActive: true,
            },
        });

        cy.mockLogin();
        cy.on("uncaught:exception", () => false);
    });

    it("should contribute without selecting any reward", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });
        cy.wait("@rewardsMock");

        cy.get(".rounded").type("20");

        cy.get(".basis-1\\/3.gap-6 > :nth-child(2) > .text-tertiary").click();

        cy.url().should("include", "checkout");
    });
});
