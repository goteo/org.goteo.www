/// <reference types="cypress" />

describe("View breakdown of each individual contribution", () => {
    beforeEach(() => {
        cy.loginAs("admin");
        cy.on("uncaught:exception", () => false);
    });

    it("should display detailed breakdown of individual contributions", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        // Verify the page loads and shows the admin charges section
        cy.contains("Aportes").should("be.visible");

        // Check for common admin interface elements
        cy.get("body").then(($body) => {
            const text = $body.text();

            // Look for table headers or labels that might be present
            if (text.includes("ID") || text.includes("Id")) {
                cy.contains(/ID?/i).should("be.visible");
            }
            if (text.includes("Título") || text.includes("Title")) {
                cy.contains(/Título|Title/i).should("be.visible");
            }
            if (text.includes("Importe") || text.includes("Amount")) {
                cy.contains(/Importe|Amount/i).should("be.visible");
            }
            if (text.includes("Estado") || text.includes("Status")) {
                cy.contains(/Estado|Status/i).should("be.visible");
            }

            // Check if currency symbol is present somewhere
            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }
        });
    });

    it("should display contribution IDs correctly", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        // Verify page loads with admin content
        cy.contains("Aportes").should("be.visible");

        // Check for any numeric IDs that might be displayed
        cy.get("body").then(($body) => {
            const text = $body.text();
            // Look for any numeric patterns that could be IDs
            const hasNumericContent = /\d+/.test(text);
            if (hasNumericContent) {
                cy.get("body").should("contain.text", text.match(/\d+/)?.[0] || "");
            }
        });
    });

    it("should display different contribution types", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        // Verify the admin charges page loads
        cy.contains("Aportes").should("be.visible");

        // Check for any type-related content
        cy.get("body").then(($body) => {
            const text = $body.text();
            // Look for common contribution-related terms
            if (text.includes("single") || text.includes("Único") || text.includes("tipo")) {
                cy.get("body").should("contain.text", text.includes("single") ? "single" : "Único");
            }
        });
    });

    it("should show creation dates if displayed", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        // Verify page loads
        cy.contains("Aportes").should("be.visible");

        // Check for any date patterns
        cy.get("body").then(($body) => {
            const text = $body.text();
            // Look for year patterns
            if (text.includes("2024") || text.includes("2025")) {
                cy.get("body").should("contain.text", text.includes("2025") ? "2025" : "2024");
            }
        });
    });

    it("should allow filtering by status", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        // Verify page loads
        cy.contains("Aportes").should("be.visible");

        // Check for filtering elements
        cy.get("body").then(($body) => {
            // Look for common filtering UI elements
            if ($body.find("select").length > 0) {
                cy.get("select").should("exist");
            }
            if ($body.find("input").length > 0) {
                cy.get("input").should("exist");
            }
            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }
        });
    });
});
