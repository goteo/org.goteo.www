/// <reference types="cypress" />

describe("Viewing without contributions", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/api/auth/me", {
            statusCode: 200,
            body: {
                id: 1,
                email: "test@cypress.local",
                name: "Cypress Test User",
                accountingId: 123,
                isAuthenticated: true,
            },
        }).as("authMe");

        cy.intercept("GET", "**/v4/projects/100", {
            statusCode: 200,
            body: {
                id: 100,
                title: "Proyecto Sin Contribuciones",
                amount: 0,
                minimal: 5000,
                optimal: 10000,
                received: 0,
                num_investors: 0,
                status: "active",
                currency: "EUR",
                description: "Descripción del proyecto sin contribuciones",
                owner: {
                    id: 1,
                    name: "Owner Test",
                    accountingId: 456,
                },
            },
        }).as("projectData");

        cy.intercept("GET", "**/v4/project_rewards?project=100", {
            statusCode: 200,
            body: [],
        }).as("projectRewards");

        cy.intercept("GET", "**/v4/**", {
            statusCode: 200,
            body: { accountingId: 123, id: 1 },
        }).as("otherApiCalls");

        cy.window().then((win) => {
            win.localStorage.setItem(
                "user",
                JSON.stringify({
                    id: 1,
                    email: "test@cypress.local",
                    name: "Cypress Test User",
                    isAuthenticated: true,
                    accountingId: 123,
                }),
            );
        });

        cy.setCookie(
            "access-token",
            JSON.stringify({
                token: "mock-access-token-cypress-123",
                accountingId: 123,
                userId: 1,
            }),
        );

        cy.mockLogin();
        cy.on("uncaught:exception", () => false);
    });

    it("should display progress elements correctly", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });
        cy.wait(3000);

        cy.get("body").should("exist");
        cy.get("body").should("not.contain", "Error 500");
        cy.get("body").should("not.contain", "Internal Server Error");

        cy.get("body").then(($body) => {
            if ($body.find(".flex.h-\\[100\\%\\].flex-col.gap-6.rounded-\\[32px\\]").length > 0) {
                cy.get(".flex.h-\\[100\\%\\].flex-col.gap-6.rounded-\\[32px\\]").should(
                    "be.visible",
                );

                cy.contains("p", "Obtenido").should("be.visible");
                cy.contains("p", "Mínimo").should("be.visible");
                cy.contains("p", "Óptimo").should("be.visible");

                cy.get("body").should("contain.text", "€");

                cy.contains("p", "Obtenido").siblings("p").should("exist");
            } else {
                cy.get("body").should("contain.text", "Obtenido");
                cy.get("body").should("contain.text", "€");
            }
        });

        cy.title().should("not.be.empty");
    });
});
