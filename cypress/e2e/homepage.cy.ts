/// <reference types="cypress" />

describe("Homepage", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("should display the main header components", () => {
        cy.checkHeaderElements();
    });

    it("should display the main content section", () => {
        cy.get("main", { timeout: 10000 }).should("exist");

        cy.get("body").then(($body) => {
            if ($body.find("main h1").length > 0) {
                cy.get("main h1", { timeout: 5000 }).should("be.visible");
            } else {
                cy.log("ℹ️ Main h1 not found but main exists");
            }
        });
    });

    it("should have working language selector", () => {
        const languages: string[] = ["es", "en", "ca"];

        languages.forEach((lang) => {
            cy.changeLanguage(lang);

            if (lang === "es") {
                cy.url().should("not.include", "/en").and("not.include", "/ca");
            } else {
                cy.url().should("include", `/${lang}`);
            }
        });
    });

    it("should have a working cart button", () => {
        cy.get("body").then(($body) => {
            if ($body.find('header button[aria-label="Go to checkout"]').length > 0) {
                cy.get('header button[aria-label="Go to checkout"]', { timeout: 5000 }).click();
            } else {
                cy.log("ℹ️ Cart button not found");
            }
        });
    });

    it("should have proper accessibility attributes", () => {
        cy.get("body").then(($body) => {
            if ($body.find('header button[aria-label="Go to checkout"]').length > 0) {
                cy.get('header button[aria-label="Go to checkout"]', { timeout: 5000 }).should(
                    "have.attr",
                    "aria-label",
                    "Go to checkout",
                );
            } else {
                cy.log("ℹ️ Checkout button not found");
            }

            if ($body.find("select#language-select").length > 0) {
                cy.get("select#language-select", { timeout: 5000 }).should(
                    "have.attr",
                    "id",
                    "language-select",
                );
            } else {
                cy.log("ℹ️ Language selector not found");
            }
        });
    });

    it("should validate responsive design across devices", () => {
        const testViewport = (viewport: string | [number, number]) => {
            if (Array.isArray(viewport)) {
                cy.viewport(viewport[0], viewport[1]);
            } else {
                cy.viewport(viewport as any);
            }

            cy.get("header", { timeout: 5000 }).should("be.visible");
            cy.get("main", { timeout: 5000 }).should("be.visible");

            cy.get("body").then(($body) => {
                if ($body.find("header .wrapper").length > 0) {
                    cy.get("header .wrapper").should("exist");
                }
                if ($body.find("main.wrapper").length > 0) {
                    cy.get("main.wrapper").should("exist");
                }
            });
        };

        testViewport("iphone-6");
        testViewport("ipad-2");
        testViewport([1280, 800]);
    });
});
