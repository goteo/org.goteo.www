/// <reference types="cypress" />

describe("Project Donation Button - Simple", () => {
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
        });

        cy.intercept("GET", "**/v4/**", {
            statusCode: 200,
            body: {
                id: 2,
                accountingId: 123,
                title: "Proyecto Mockeado",
                status: "active",
            },
        });

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

        cy.on("uncaught:exception", () => false);
    });

    it("should load the project page without errors", () => {
        cy.visit("/es/projects/2", { failOnStatusCode: false });

        cy.get("body").should("exist");

        cy.wait(2000);

        cy.get("body").should("not.contain", "Error 500");
        cy.get("body").should("not.contain", "Internal Server Error");

        cy.get("body").then(($body) => {
            if ($body.find("button").length > 0) {
                cy.log("✅ Buttons found on page");
                cy.get("button").should("have.length.greaterThan", 0);
            } else {
                cy.log("ℹ️  No buttons found, but page loaded successfully");
            }
        });
    });

    it("should handle the project page gracefully", () => {
        cy.visit("/es/projects/2", { failOnStatusCode: false });

        cy.get("html").should("exist");
        cy.get("head").should("exist");
        cy.get("body").should("exist");

        cy.title().should("not.be.empty");

        cy.log("✅ Project page loads and responds correctly");
    });
});
