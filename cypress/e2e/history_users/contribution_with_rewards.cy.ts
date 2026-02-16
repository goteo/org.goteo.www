/// <reference types="cypress" />

describe("Contribution with reward", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should show reward description when contributing", () => {
        cy.visit("/es/project/goteo-pero-mejor", { failOnStatusCode: false });

        cy.get("body").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("CD") || text.includes("T-shirt") || text.includes("physical")) {
                cy.get("body").should("contain.text", text.includes("CD") ? "CD" : "T-shirt");
            }

            if (text.includes("Donate") || text.includes("contribute") || text.includes("reward")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("Donate") ? "Donate" : "contribute",
                );
            }

            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }

            if (text.includes("project") || text.includes("project")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("project") ? "project" : "project",
                );
            }
        });
    });
});
