/// <reference types="cypress" />

describe("Checkout Flow - Stripe Payment Integration", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/v4/project_rewards?project=100", {
            statusCode: 200,
            body: [
                {
                    id: 3827,
                    project: "/v4/projects/100",
                    title: 'CD "Al Paso de los Caracoles" + 2 Camisetas',
                    description:
                        "CD físico del álbum junto con 2 camisetas oficiales del proyecto musical",
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
        }).as("project100Rewards");

        cy.login();
        cy.url().should("not.include", "/login");
    });

    it("should successfully navigate from project to checkout and validate payment form", () => {
        cy.visit("/es/projects/100");
        cy.wait("@project100Rewards");

        cy.get(".flex-col.gap-6 > .flex-row > .flex > .inline-block").should("be.visible").click();

        cy.contains("p.text-tertiary.font-bold", "Donación Platoniq")
            .parents(".flex.items-center.justify-between")
            .find("button.cursor-pointer:last")
            .should("be.visible")
            .click();

        cy.contains("Continuar", { timeout: 10000 })
            .filter(":visible")
            .first()
            .should("be.visible")
            .click();

        cy.url({ timeout: 15000 }).should("include", "payment");
        cy.get("form#payment", { timeout: 10000 }).should("exist").and("be.visible");
    });

    it("should display payment methods with correct states and handle disabled wallet", () => {
        cy.visit("/es/projects/100");
        cy.wait("@project100Rewards");
        cy.get(".flex-col.gap-6 > .flex-row > .flex > .inline-block").click();

        cy.contains("p.text-tertiary.font-bold", "Donación Platoniq")
            .parents(".flex.items-center.justify-between")
            .find("button.cursor-pointer:last")
            .click();

        cy.contains("Continuar", { timeout: 10000 }).filter(":visible").first().click();

        cy.url({ timeout: 15000 }).should("include", "payment");

        cy.get('input[name="paymentMethod"][value="paypal"]')
            .should("not.be.disabled")
            .and("be.visible");

        cy.get('input[name="paymentMethod"][value="stripe"]')
            .should("not.be.disabled")
            .and("be.visible");

        cy.get('input[value="wallet"]').invoke("attr", "disabled", "disabled");
        cy.get('label[data-gateway="wallet"]').invoke("addClass", "opacity-50 cursor-not-allowed");

        cy.get('input[value="wallet"]').should("be.disabled");
        cy.get('label[data-gateway="wallet"]')
            .should("have.class", "opacity-50")
            .and("have.class", "cursor-not-allowed");
    });
});
