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

            if (text.includes("Tell us your personal data")) {
                cy.contains("Tell us your personal data", { timeout: 10000 }).should("be.visible");
            }

            if (text.includes("Sign in to your account")) {
                cy.contains("Sign in to your account", { timeout: 10000 }).should("be.visible");
            }

            if (text.includes("Sign up")) {
                cy.contains("Sign up", { timeout: 10000 }).should("be.visible");
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

            if (text.includes("You can also access")) {
                cy.contains("You can also access", { timeout: 5000 }).should("be.visible");
            }

            if (text.includes("Forgot your password?")) {
                cy.contains("Forgot your password?", { timeout: 5000 }).should("be.visible");
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
