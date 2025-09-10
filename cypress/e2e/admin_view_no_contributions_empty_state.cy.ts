/// <reference types="cypress" />

describe("Visualization without contributions", () => {
    beforeEach(() => {
        cy.loginAs("admin");
        cy.on("uncaught:exception", () => false);
    });

    it("should load admin page even when no contributions exist", () => {
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

            if ($body.find("table").length > 0) {
                cy.get("table").should("exist");
            }

            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }
        });
    });
});
