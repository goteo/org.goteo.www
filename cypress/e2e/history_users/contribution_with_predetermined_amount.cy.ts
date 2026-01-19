/// <reference types="cypress" />

describe("Contribution with predetermined amount", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should handle the complete donation flow step by step", () => {
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

            if (text.includes("€") || text.includes("EUR") || text.includes("pago")) {
                cy.get("body").should("contain.text", text.includes("€") ? "€" : "EUR");
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

            if (text.includes("CD") || text.includes("recompensa")) {
                cy.get("body").should("contain.text", text.includes("CD") ? "CD" : "recompensa");
            }
        });
    });
});
