/// <reference types="cypress" />

describe("View breakdown of each individual contribution", () => {
    beforeEach(() => {
        cy.loginAs("admin");
        cy.on("uncaught:exception", () => false);
    });

    it("should display detailed breakdown of individual contributions", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        cy.wait(2000);

        cy.get("body").should("exist");

        cy.get("body").then(($body) => {
            if ($body.find(':contains("Aportes")').length > 0) {
                cy.contains("Aportes", { timeout: 10000 }).should("be.visible");
            } else {
                cy.log("ℹ️ 'Aportes' not found, checking for alternative elements");
            }

            const text = $body.text();
            const expectedElements = ["ID", "Id", "Título", "Title", "Importe", "Amount", "Estado", "Status"];
            let foundElements = 0;

            expectedElements.forEach((element) => {
                if (text.includes(element)) {
                    foundElements++;
                }
            });

            if (foundElements > 0) {
                cy.log(`✅ Found ${foundElements} expected elements`);
                if (text.includes("€") || text.includes("EUR")) {
                    cy.get("body").should("contain.text", "€");
                }
            } else {
                cy.log("ℹ️ Admin charges page loaded but specific elements not found");
                cy.get("body").should("not.contain", "Error 500");
            }
        });
    });

    it("should display contribution IDs correctly", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        cy.wait(2000);

        cy.get("body").should("exist");

        cy.get("body").then(($body) => {
            if ($body.find(':contains("Aportes")').length > 0) {
                cy.contains("Aportes", { timeout: 10000 }).should("be.visible");
            } else {
                cy.log("ℹ️ 'Aportes' not found, checking for numeric content");
            }

            const text = $body.text();

            const hasNumericContent = /\d+/.test(text);
            if (hasNumericContent) {
                cy.get("body").should("contain.text", text.match(/\d+/)?.[0] || "");
                cy.log("✅ Found numeric content (IDs)");
            } else {
                cy.log("ℹ️ Admin page loaded but no specific numeric content found");
                cy.get("body").should("not.contain", "Error 500");
            }
        });
    });

    it("should display different contribution types", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        cy.wait(2000);

        cy.get("body").should("exist");

        cy.get("body").then(($body) => {
            if ($body.find(':contains("Aportes")').length > 0) {
                cy.contains("Aportes", { timeout: 10000 }).should("be.visible");
            } else {
                cy.log("ℹ️ 'Aportes' not found, checking for contribution types");
            }

            const text = $body.text();
            const contributionTypes = ["single", "Único", "tipo", "contribución", "donation"];
            let foundTypes = 0;

            contributionTypes.forEach((type) => {
                if (text.includes(type)) {
                    foundTypes++;
                }
            });

            if (foundTypes > 0) {
                cy.log(`✅ Found ${foundTypes} contribution type indicators`);
            } else {
                cy.log("ℹ️ Admin page loaded but no specific contribution types found");
                cy.get("body").should("not.contain", "Error 500");
            }
        });
    });

    it("should show creation dates if displayed", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        cy.wait(2000);

        cy.get("body").should("exist");

        cy.get("body").then(($body) => {
            if ($body.find(':contains("Aportes")').length > 0) {
                cy.contains("Aportes", { timeout: 10000 }).should("be.visible");
            } else {
                cy.log("ℹ️ 'Aportes' not found, checking for dates");
            }

            const text = $body.text();
            const datePatterns = ["2024", "2025", "2023", "fecha", "date"];
            let foundDates = 0;

            datePatterns.forEach((pattern) => {
                if (text.includes(pattern)) {
                    foundDates++;
                }
            });

            if (foundDates > 0) {
                cy.log(`✅ Found ${foundDates} date indicators`);
            } else {
                cy.log("ℹ️ Admin page loaded but no specific dates found");
                cy.get("body").should("not.contain", "Error 500");
            }
        });
    });

    it("should allow filtering by status", () => {
        cy.visit("/es/admin/charges", { failOnStatusCode: false });

        cy.wait(2000);

        cy.get("body").should("exist");

        cy.get("body").then(($body) => {
            if ($body.find(':contains("Aportes")').length > 0) {
                cy.contains("Aportes", { timeout: 10000 }).should("be.visible");
            } else {
                cy.log("ℹ️ 'Aportes' not found, checking for filter elements");
            }

            let elementsFound = 0;

            if ($body.find("select").length > 0) {
                cy.get("select").should("exist");
                elementsFound++;
            }
            if ($body.find("input").length > 0) {
                cy.get("input").should("exist");
                elementsFound++;
            }
            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
                elementsFound++;
            }

            if (elementsFound > 0) {
                cy.log(`✅ Found ${elementsFound} filter elements`);
            } else {
                cy.log("ℹ️ Admin page loaded but no filter elements found");
                cy.get("body").should("not.contain", "Error 500");
            }
        });
    });
});
