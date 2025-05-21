/// <reference types="cypress" />
/* eslint-disable cypress/no-unnecessary-waiting */

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
                    money: {
                        amount: 4000,
                        currency: "EUR",
                    },
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
        cy.wait(1000);

        cy.get("label[data-gateway='paypal']", { timeout: 10000 }).should("be.visible").click();

        cy.get("input[name='paymentMethod'][value='paypal']", { timeout: 5000 }).should(
            "be.checked",
        );

        cy.get("form#payment button[type='submit']", { timeout: 10000 })
            .should("be.visible")
            .should("be.enabled");
    });
});
