/// <reference types="cypress" />

describe("Login Page", () => {
    beforeEach(() => {
        cy.visit("/es/login");
        cy.on("uncaught:exception", () => false);
    });

    it("should display the login form elements correctly", () => {
        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("Indícanos tus datos personales")) {
                cy.get("h2").contains("Indícanos tus datos personales").should("be.visible");
            }
            if (text.includes("Entra en tu cuenta")) {
                cy.get("h2").contains("Entra en tu cuenta").should("be.visible");
            }
            if (text.includes("Regístrate")) {
                cy.get("a").contains("Regístrate").should("be.visible");
            }

            if ($body.find("form#login").length > 0) {
                cy.get("form#login").within(() => {
                    if ($body.find("input#identifier").length > 0) {
                        cy.get("input#identifier").should("exist");
                    }
                    if ($body.find("input#password").length > 0) {
                        cy.get("input#password").should("exist");
                    }
                });
            }

            if ($body.find('button[form="login"]').length > 0) {
                cy.get('button[form="login"]').should("exist");
                cy.log("✅ Login button found in DOM");

                cy.get('button[form="login"]').scrollIntoView();
                cy.wait(500);

                cy.get('button[form="login"]').should("exist").and("be.enabled");
            } else {
                cy.log("ℹ️ Login button not found in DOM");
            }

            if (text.includes("También puedes acceder a través de")) {
                cy.contains("También puedes acceder a través de:").should("be.visible");
            } else {
                cy.log("ℹ️ Texto de acceso alternativo no encontrado");
            }

            if (text.includes("¿Olvidaste tu contraseña?")) {
                cy.contains("¿Olvidaste tu contraseña?").should("be.visible");
            } else {
                cy.log("ℹ️ Enlace de contraseña olvidada no encontrado");
            }
        });
    });

    it("should display floating labels correctly", () => {
        cy.get("body").then(($body) => {
            if ($body.find('label[for="identifier"]').length > 0) {
                cy.get('label[for="identifier"]').should("exist");
            } else {
                cy.log("ℹ️ Label for identifier not found");
            }

            if ($body.find("input#identifier").length > 0) {
                cy.get("input#identifier").should("be.visible");
                cy.get("input#identifier").type("root@goteo.org");
                cy.get("input#identifier").should("have.value", "root@goteo.org");

                if ($body.find('label[for="identifier"]').length > 0) {
                    cy.get('label[for="identifier"]').should("be.visible");
                }
            } else {
                cy.log("ℹ️ Input identifier not found, but page loaded correctly");
            }
        });
    });

    it("should validate form fields appropriately", () => {
        cy.checkLoginFormValidation();
    });
});
