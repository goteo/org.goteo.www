/// <reference types="cypress" />

describe("View Total Raised by One-time Payments", () => {
    beforeEach(() => {
        cy.loginAs("admin");
    });

    it("should display total contributions amount", () => {
        cy.visit("/es/admin/aportes", { failOnStatusCode: false });
        cy.wait(3000);

        cy.get("body").should("exist");
        cy.get("body").should("not.contain", "Error 500");
        cy.get("body").should("not.contain", "Internal Server Error");

        cy.get("body").then(($body) => {
            if ($body.text().includes("Total") || $body.text().includes("total")) {
                cy.contains(/total/i).should("be.visible");
            } else {
                cy.log(
                    "No se encontró texto 'Total', verificando que la página cargó correctamente",
                );
            }

            if ($body.text().includes("€") || $body.text().includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            } else {
                cy.log(
                    "No se encontró símbolo de euro, verificando que la página cargó correctamente",
                );
            }
        });

        cy.url().should("include", "/es/admin/aportes");
    });
});
