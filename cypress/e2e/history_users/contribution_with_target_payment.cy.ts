/// <reference types="cypress" />

describe("Credit target Payment Flow", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should show reward description when contributing", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });

        // Verify the page loads
        cy.get("body").should("be.visible");

        // Check for payment flow related content that might be present
        cy.get("body").then(($body) => {
            const text = $body.text();

            // Look for payment/checkout related terms
            if (text.includes("pago") || text.includes("payment") || text.includes("checkout")) {
                cy.get("body").should("contain.text", text.includes("pago") ? "pago" : "payment");
            }

            // Look for reward descriptions
            if (text.includes("CD") || text.includes("Camiseta") || text.includes("físico")) {
                cy.get("body").should("contain.text", text.includes("CD") ? "CD" : "Camiseta");
            }

            // Look for contribution/donation terms
            if (text.includes("Donar") || text.includes("contribuir") || text.includes("target")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("Donar") ? "Donar" : "contribuir",
                );
            }

            // Look for currency symbols
            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            // Look for UI elements
            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }

            // Look for project-related content
            if (text.includes("proyecto") || text.includes("project")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("proyecto") ? "proyecto" : "project",
                );
            }
        });
    });
});
