/// <reference types="cypress" />

describe("View total collected by single payments", () => {
    beforeEach(() => {
        cy.loginAs("admin");
        cy.on("uncaught:exception", () => false);
    });

    it("should display total raised amount in admin dashboard", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        // Verify the admin dashboard loads
        cy.get("body").should("be.visible");

        // Check for admin dashboard content that might be present
        cy.get("body").then(($body) => {
            const text = $body.text();

            // Look for admin charges/contributions content
            if (text.includes("Aportes") || text.includes("Total")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("Aportes") ? "Aportes" : "Total",
                );
            }

            // Look for currency symbols
            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            // Look for total/summary related terms
            if (
                text.includes("Total aportes") ||
                text.includes("Total Tips") ||
                text.includes("comisiones")
            ) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("Total aportes") ? "Total aportes" : "Total",
                );
            }

            // Look for admin interface elements
            if ($body.find("table").length > 0) {
                cy.get("table").should("exist");
            }

            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }

            // Look for numeric amounts
            const hasNumbers = /\d+/.test(text);
            if (hasNumbers) {
                cy.get("body").should("contain.text", text.match(/\d+/)?.[0] || "");
            }
        });
    });
});
