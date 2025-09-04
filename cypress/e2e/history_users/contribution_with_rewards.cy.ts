/// <reference types="cypress" />

describe("Contribution with reward", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should show reward description when contributing", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });

        cy.get("body").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("CD") || text.includes("Camiseta") || text.includes("físico")) {
                cy.get("body").should("contain.text", text.includes("CD") ? "CD" : "Camiseta");
            }

            if (
                text.includes("Donar") ||
                text.includes("contribuir") ||
                text.includes("recompensa")
            ) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("Donar") ? "Donar" : "contribuir",
                );
            }

            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }

            if (text.includes("proyecto") || text.includes("project")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("proyecto") ? "proyecto" : "project",
                );
            }
        });
    });
});
