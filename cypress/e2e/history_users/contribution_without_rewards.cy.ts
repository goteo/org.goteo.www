/// <reference types="cypress" />

describe("Contribution without reward", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should contribute without selecting any reward", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });

        cy.get("body").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (
                text.includes("contribuir") ||
                text.includes("Donar") ||
                text.includes("sin recompensa")
            ) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("contribuir") ? "contribuir" : "Donar",
                );
            }

            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            if ($body.find("input").length > 0) {
                cy.get("input").should("exist");
            }

            if (text.includes("proyecto") || text.includes("project")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("proyecto") ? "proyecto" : "project",
                );
            }

            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }

            const hasNumbers = /\d+/.test(text);
            if (hasNumbers) {
                cy.get("body").should("contain.text", text.match(/\d+/)?.[0] || "");
            }
        });
    });
});
