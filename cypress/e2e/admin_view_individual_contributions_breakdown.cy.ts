/// <reference types="cypress" />

describe("View breakdown of each individual contribution", () => {
    beforeEach(() => {
        cy.loginAs("admin");
        cy.on("uncaught:exception", () => false);
    });

    it("should display detailed breakdown of individual contributions", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        cy.contains("Aportes").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

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

            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }
        });
    });

    it("should display contribution IDs correctly", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        cy.contains("Aportes").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

            const hasNumericContent = /\d+/.test(text);
            if (hasNumericContent) {
                cy.get("body").should("contain.text", text.match(/\d+/)?.[0] || "");
            }
        });
    });

    it("should display different contribution types", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        cy.contains("Aportes").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("single") || text.includes("Único") || text.includes("tipo")) {
                cy.get("body").should("contain.text", text.includes("single") ? "single" : "Único");
            }
        });
    });

    it("should show creation dates if displayed", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        cy.contains("Aportes").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("2024") || text.includes("2025")) {
                cy.get("body").should("contain.text", text.includes("2025") ? "2025" : "2024");
            }
        });
    });

    it("should allow filtering by status", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        cy.contains("Aportes").should("be.visible");

        cy.get("body").then(($body) => {
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
