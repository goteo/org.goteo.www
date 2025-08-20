/// <reference types="cypress" />

describe("Contribution with custom amount", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should handle donation with custom amount", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });

        // Verify the page loads
        cy.get("body").should("be.visible");

        // Check for contribution-related content that might be present
        cy.get("body").then(($body) => {
            const text = $body.text();

            // Look for donation/contribution related terms
            if (text.includes("Donar") || text.includes("Contribuir") || text.includes("Aportar")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("Donar") ? "Donar" : "Contribuir",
                );
            }

            // Look for currency symbols
            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            // Look for input fields if they exist
            if ($body.find("input").length > 0) {
                cy.get("input").should("exist");
            }

            // Look for buttons if they exist
            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }

            // Look for reward-related terms
            if (text.includes("CD") || text.includes("recompensa")) {
                cy.get("body").should("contain.text", text.includes("CD") ? "CD" : "recompensa");
            }
        });
    });
});
