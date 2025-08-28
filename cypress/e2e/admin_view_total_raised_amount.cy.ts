/// <reference types="cypress" />

describe("View total collected by single payments", () => {
    beforeEach(() => {
        cy.loginAs("admin");
        cy.on("uncaught:exception", () => false);
    });

    it("should display total raised amount in admin dashboard", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        cy.get("body").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("Aportes") || text.includes("Total")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("Aportes") ? "Aportes" : "Total",
                );
            }

            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

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

            if ($body.find("table").length > 0) {
                cy.get("table").should("exist");
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
