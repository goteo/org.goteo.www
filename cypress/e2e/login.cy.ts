/// <reference types="cypress" />

describe("Login Page", () => {
    beforeEach(() => {
        cy.visit("/login");
        cy.on("uncaught:exception", () => false);
    });

    it("should display the login form elements correctly", () => {
        cy.get("h2").contains("Indícanos tus datos personales").should("be.visible");
        cy.get("h2").contains("Entra en tu cuenta o").should("be.visible");
        cy.get("a").contains("Regístrate").should("be.visible");

        cy.get("form#login").within(() => {
            cy.get("input#identifier").should("exist");
            cy.get("input#password").should("exist");
        });

        cy.get('button[form="login"]').should("be.visible");

        cy.contains("También puedes acceder a través de:").should("be.visible");

        cy.contains("¿Olvidaste tu contraseña?").should("be.visible");
    });

    it("should display floating labels correctly", () => {
        cy.get('label[for="identifier"]').should("exist");

        cy.get("input#identifier").should("be.visible");

        cy.get("input#identifier").type("root@goteo.org");

        cy.get("input#identifier").should("have.value", "root@goteo.org");

        cy.get('label[for="identifier"]').should("be.visible");
    });

    it("should validate form fields appropriately", () => {
        cy.checkLoginFormValidation();
    });
});
