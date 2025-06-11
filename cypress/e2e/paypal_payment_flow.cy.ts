/// <reference types="cypress" />

describe("PayPal Payment Flow", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/v4/project_rewards?project=100", {
            statusCode: 200,
            body: [
                {
                    id: 3827,
                    project: "/v4/projects/100",
                    title: 'CD "Al Paso de los Caracoles" + 2 Camisetas',
                    description: "Descripción de ejemplo",
                    money: { amount: 4000, currency: "EUR" },
                    hasUnits: true,
                    unitsTotal: 5,
                    unitsAvailable: 5,
                    locales: ["es"],
                },
            ],
        }).as("rewardsApi");

        cy.login();
        cy.url().should("not.include", "/login");
    });

    it("should complete the donation flow from checkout to payment with PayPal", () => {
        cy.visit("/es/projects/100");
        cy.wait("@rewardsApi");

        cy.url().should("include", "/projects/100");

        cy.get(".flex-col.gap-6 > .flex-row > .flex > .inline-block").click();

        cy.contains("p.text-tertiary.font-bold", "Donación Platoniq")
            .parents(".flex.items-center.justify-between")
            .find("button.cursor-pointer:last")
            .click();

        cy.contains("button", "Continuar").should("be.visible").should("be.enabled").click();

        cy.url({ timeout: 10000 }).should("not.include", "/login");
        cy.url().should("include", "payment");

        cy.get("form#payment", { timeout: 5000 }).should("exist");

        cy.get("label[data-gateway='paypal']").should("be.visible").click();

        cy.get("input[name='paymentMethod'][value='paypal']").should("be.checked");
        cy.get("form#payment button[type='submit']").should("be.visible").and("be.enabled");
    });
});
