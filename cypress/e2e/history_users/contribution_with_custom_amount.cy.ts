/// <reference types="cypress" />

describe("Contribution with custom amount", () => {
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

    it("should handle donation with custom amount", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });
        cy.wait("@rewardsMock");

        cy.get(".grid > :nth-child(2)").should("be.visible");

        cy.get(".grid > :nth-child(2) > .inline-block").should("be.visible").click();

        cy.get("dialog[open]").should("exist");

        cy.get("dialog[open]").within(() => {
            // eslint-disable-next-line cypress/unsafe-to-chain-command
            cy.get('input[type="text"]').should("be.visible").clear().type("320");

            cy.get('input[type="text"]').should("have.value", "320");

            cy.get("button").contains("Donar").click();
        });

        cy.get("body").should(($body) => {
            const text = $body.text().toLowerCase();
            const url = window.location.href.toLowerCase();

            const hasPaymentIndicators =
                text.includes("payment") ||
                text.includes("pago") ||
                text.includes("paypal") ||
                text.includes("checkout") ||
                url.includes("payment") ||
                url.includes("checkout") ||
                url.includes("donation");

            expect(hasPaymentIndicators, "Should reach payment-related page").to.be.true;
        });
    });
});
