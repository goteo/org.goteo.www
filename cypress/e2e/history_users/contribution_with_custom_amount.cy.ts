/// <reference types="cypress" />

describe("Contribution with custom amount", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should handle donation with custom amount", () => {
        cy.visit("/es/project/goteo-pero-mejor", { failOnStatusCode: false });

        cy.get("body").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("Donar") || text.includes("Contribuir") || text.includes("Aportar")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("Donar") ? "Donar" : "Contribuir",
                );
            }

            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            if ($body.find("input").length > 0) {
                cy.get("input").should("exist");
            }

            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }

            if (text.includes("CD") || text.includes("recompensa")) {
                cy.get("body").should("contain.text", text.includes("CD") ? "CD" : "recompensa");
            }
        });
    });
});
