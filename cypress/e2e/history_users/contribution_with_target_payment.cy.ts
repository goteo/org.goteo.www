/// <reference types="cypress" />

describe("Credit target Payment Flow", () => {
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
                {
                    id: 3818,
                    project: "/v4/projects/100",
                    title: "CD + Camiseta",
                    description: "CD físico firmado + camiseta",
                    money: { amount: 3000, currency: "EUR" },
                    hasUnits: false,
                    unitsTotal: 0,
                    unitsAvailable: 0,
                    locales: ["es"],
                },
            ],
        }).as("rewardsMock");

        cy.mockLogin();
        cy.on("uncaught:exception", () => false);
    });

    it("should show reward description when contributing", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });
        cy.wait("@rewardsMock");

        cy.get(".grid > :nth-child(2) > .inline-block").click();

        cy.get("dialog[open]").should(
            "contain",
            "CD físico firmado + 2 camisetas edición limitada",
        );

        cy.get("dialog[open]").within(() => {
            cy.get("button").contains("Donar").click();
        });

        cy.url().should("include", "checkout");

        cy.get(".gap-4 > .bg-primary").click();

        cy.url().should("include", "payment");
    });
});
