/// <reference types="cypress" />

describe("Homepage", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("should display the main header components", () => {
        cy.checkHeaderElements();
    });

    it("should display the main content section", () => {
        cy.get("main").should("exist");
        cy.get("main h1").should("have.text", "Hola!");

        cy.get("select#language-select")
            .should("exist")
            .and("have.value", "es")
            .find("option")
            .should("have.length", 3);

        cy.changeLanguage("en");
        cy.url().should("include", "/en");
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
        cy.get('header button[aria-label="Ir al checkout"]').click();
    });

    it("should have proper accessibility attributes", () => {
        cy.get('header button[aria-label="Ir al checkout"]').should(
            "have.attr",
            "aria-label",
            "Ir al checkout",
        );

        cy.get("select#language-select").should("have.attr", "id", "language-select");
    });

    it("should validate responsive design across devices", () => {
        cy.viewport("iphone-6");
        cy.get("header").should("be.visible");
        cy.get("main").should("be.visible");
        cy.get("header .wrapper").should("exist");
        cy.get("main.wrapper").should("exist");

        cy.viewport("ipad-2");
        cy.get("header").should("be.visible");
        cy.get("main").should("be.visible");
        cy.get("header .wrapper").should("exist");
        cy.get("main.wrapper").should("exist");

        cy.viewport(1280, 800);
        cy.get("header").should("be.visible");
        cy.get("main").should("be.visible");
        cy.get("header .wrapper").should("exist");
        cy.get("main.wrapper").should("exist");
    });
});
