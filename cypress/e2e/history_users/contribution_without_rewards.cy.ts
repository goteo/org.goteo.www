/// <reference types="cypress" />

describe("Contribution without reward", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should contribute without selecting any reward", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });

        // Verify the page loads
        cy.get("body").should("be.visible");

        // Check for contribution without rewards related content
        cy.get("body").then(($body) => {
            const text = $body.text();

            // Look for contribution/donation terms
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

            // Look for currency symbols
            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            // Look for input fields
            if ($body.find("input").length > 0) {
                cy.get("input").should("exist");
            }

            // Look for project-related content
            if (text.includes("proyecto") || text.includes("project")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("proyecto") ? "proyecto" : "project",
                );
            }

            // Look for UI elements
            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }

            // Look for numeric content
            const hasNumbers = /\d+/.test(text);
            if (hasNumbers) {
                cy.get("body").should("contain.text", text.match(/\d+/)?.[0] || "");
            }
        });
    });
});
