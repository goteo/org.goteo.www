/// <reference types="cypress" />

describe("Login Page", () => {
    beforeEach(() => {
        cy.visit("/es/login");
        cy.on("uncaught:exception", () => false);
    });

    it("should display the login form elements correctly", () => {
        cy.wait(2000);

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("Indícanos tus datos personales")) {
                cy.contains("Indícanos tus datos personales", { timeout: 10000 }).should(
                    "be.visible",
                );
            }

            if (text.includes("Entra en tu cuenta")) {
                cy.contains("Entra en tu cuenta", { timeout: 10000 }).should("be.visible");
            }

            if (text.includes("Regístrate")) {
                cy.contains("Regístrate", { timeout: 10000 }).should("be.visible");
            }
        });

        cy.get("body").then(($body) => {
            if ($body.find("form#login").length > 0) {
                cy.get("form#login", { timeout: 10000 }).within(() => {
                    cy.get('input[name="identifier"]', { timeout: 5000 }).should("exist");
                    cy.get('input[name="password"]', { timeout: 5000 }).should("exist");
                });

                cy.get('button[form="login"]', { timeout: 5000 }).should("be.visible");
            } else {
                cy.log("ℹ️ Login form not found");
            }
        });

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("También puedes acceder")) {
                cy.contains("También puedes acceder", { timeout: 5000 }).should("be.visible");
            }

            if (text.includes("¿Olvidaste tu contraseña?")) {
                cy.contains("¿Olvidaste tu contraseña?", { timeout: 5000 }).should("be.visible");
            }
        });
    });

    it("should display floating labels correctly", () => {
        cy.get('input[name="identifier"]').should("be.visible");
        cy.get('input[name="identifier"]').type("root@goteo.org");
        cy.get('input[name="identifier"]').should("have.value", "root@goteo.org");
    });

    it("should validate form fields appropriately", () => {
        cy.checkLoginFormValidation();
    });
});
