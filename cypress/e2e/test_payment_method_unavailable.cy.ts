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
                    description: "CD físico del álbum junto con 2 camisetas oficiales",
                    money: { amount: 4000, currency: "EUR" },
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

    const navigateToPayment = () => {
        cy.visit("/es/projects/100");
        cy.wait("@project100Rewards");

        cy.get(".flex-col.gap-6 > .flex-row > .flex > .inline-block").click();

        cy.contains("p.text-tertiary.font-bold", "Donación Platoniq")
            .parents(".flex.items-center.justify-between")
            .find("button.cursor-pointer:last")
            .click();

        cy.contains("button", "Continuar").should("be.visible").click();

        cy.url({ timeout: 10000 }).should("not.include", "/login");
        cy.url().should("include", "payment");
    };

    it("should successfully navigate from project to checkout and validate payment form", () => {
        navigateToPayment();

        cy.get("form#payment").should("be.visible");
    });

    it("should display payment methods with correct states and handle disabled wallet", () => {
        navigateToPayment();

        cy.get('input[name="paymentMethod"][value="paypal"]')
            .should("be.visible")
            .and("not.be.disabled");

        cy.get('input[name="paymentMethod"][value="stripe"]')
            .should("be.visible")
            .and("not.be.disabled");

        cy.get('input[value="wallet"]')
            .invoke("attr", "disabled", "disabled")
            .should("be.disabled");

        cy.get('label[data-gateway="wallet"]')
            .invoke("addClass", "opacity-50 cursor-not-allowed")
            .should("have.class", "opacity-50")
            .and("have.class", "cursor-not-allowed");
    });
});
