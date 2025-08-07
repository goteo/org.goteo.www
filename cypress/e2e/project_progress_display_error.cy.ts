/// <reference types="cypress" />

describe("Error in progress display", () => {
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
                title: "Proyecto con Datos Incompletos",
                budget: {
                    minimum: { money: { amount: 5000, currency: "EUR" } },
                    optimum: { money: { amount: 10000, currency: "EUR" } },
                },
                accounting: "/v4/accountings/100",
            },
        }).as("projectData");

        cy.intercept("GET", "**/v4/accountings/100", {
            statusCode: 200,
            body: {
                id: 100,
                balance: null,
            },
        }).as("accountingErrorData");

        cy.intercept("GET", "**/v4/accounting_balance_points**", {
            statusCode: 500,
            body: { error: "Internal server error" },
        }).as("balancePointsError");

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

    it("should handle gracefully when accounting data is incomplete", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });
        cy.wait(3000);

        cy.get("body").should("exist");
        cy.get("body").should("not.contain", "Error 500");
        cy.get("body").should("not.contain", "Internal Server Error");

        cy.get("body").then(($body) => {
            if ($body.find(".flex.h-\\[100\\%\\].flex-col.gap-6.rounded-\\[32px\\]").length > 0) {
                cy.contains("p", "Obtenido").should("be.visible");

                cy.contains("p", "Mínimo").should("be.visible");
                cy.contains("p", "Óptimo").should("be.visible");

                cy.get("body").should("contain.text", "€");
            } else {
                cy.contains("Obtenido").should("be.visible");
                cy.title().should("not.be.empty");
            }
        });
    });
});
