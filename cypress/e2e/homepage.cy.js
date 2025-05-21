/// <reference types="cypress" />

describe("Homepage", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("should display the main header components", () => {
        // Usar el comando personalizado para verificar el header
        cy.checkHeaderElements();
    });

    it("should display the main content section", () => {
        // Verificar main tag y contenido
        cy.get("main").should("exist");
        cy.get("main h1").should("have.text", "Hola!");

        // Verificar selector de idioma
        cy.get("select#language-select")
            .should("exist")
            .and("have.value", "es")
            .find("option")
            .should("have.length", 3);

        // Probar cambio de idioma
        cy.changeLanguage("en");
        cy.url().should("include", "/en");
    });

    it("should have working language selector", () => {
        const languages = ["es", "en", "ca"];

        // Probar todas las opciones de idioma
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
        // Agregar aquí una verificación del comportamiento esperado
    });

    it("should have proper accessibility attributes", () => {
        // Verificar atributos de accesibilidad
        cy.get('header button[aria-label="Ir al checkout"]').should(
            "have.attr",
            "aria-label",
            "Ir al checkout",
        );

        cy.get("select#language-select").should("have.attr", "id", "language-select");
    });

    it("should validate responsive design across devices", () => {
        // Test mobile view
        cy.viewport("iphone-6");
        cy.get("header").should("be.visible");
        cy.get("main").should("be.visible");
        cy.get("header .wrapper").should("exist");
        cy.get("main.wrapper").should("exist");

        // Test tablet view
        cy.viewport("ipad-2");
        cy.get("header").should("be.visible");
        cy.get("main").should("be.visible");
        cy.get("header .wrapper").should("exist");
        cy.get("main.wrapper").should("exist");

        // Test desktop view
        cy.viewport(1280, 800);
        cy.get("header").should("be.visible");
        cy.get("main").should("be.visible");
        cy.get("header .wrapper").should("exist");
        cy.get("main.wrapper").should("exist");
    });
});
