/// <reference types="cypress" />
/* eslint-disable cypress/no-unnecessary-waiting */

describe("Realizar un pago único para apoyar un proyecto", () => {
    beforeEach(() => {
        // Primero hacer login antes de visitar la página del proyecto
        cy.login();
        cy.url().should("not.include", "/login");
    });

    it("debería mostrar el botón 'Donar a esta campaña' visible y clickeable", () => {
        // 1. Visitar la página de algún proyecto
        cy.visit("/es/projects/2");
        cy.on("uncaught:exception", () => false);

        // 2. Verificar que el botón existe, es visible y no está deshabilitado
        cy.url().should("include", "/es/projects/2");
        cy.contains("button", "Donar a esta campaña", { timeout: 10000 })
            .should("be.visible")
            .and("not.be.disabled");
    });

    it("debería completar el flujo de donación desde checkout hasta el pago con Stripe", () => {
        // 1. Ir directamente a la página de checkout
        cy.visit("/es/checkout");
        cy.on("uncaught:exception", () => false);

        // 2. Encontrar el botón de continuar y esperar a que esté completamente cargado
        cy.get("astro-island[client-render-time]", { timeout: 15000 }).should("exist");
        cy.wait(2000);

        cy.contains("Continuar", { timeout: 10000 })
            .filter(":visible")
            .first()
            .should("be.enabled")
            .click({ force: true });

        // 3. Verificar que estamos en la página de selección de metodo de pago
        cy.url({ timeout: 15000 }).should("include", "payment");
        cy.get("form#payment", { timeout: 10000 }).should("exist");
        cy.wait(1000);

        // 4. Seleccionar Stripe
        cy.get("label[data-gateway='stripe']", { timeout: 10000 }).should("be.visible").click();

        // 5. Verificar que el radio button de Stripe está seleccionado
        cy.get("input[name='paymentMethod'][value='stripe']", { timeout: 5000 }).should(
            "be.checked",
        );

        // 6. Hacer click en el botón continuar
        cy.get("form#payment button[type='submit']", { timeout: 10000 })
            .should("be.enabled")
            .click();
    });

    it("debería completar el flujo de donación desde checkout hasta el pago con Stripe", () => {
        // 1. Ir directamente a la página de checkout
        cy.visit("/es/checkout");
        cy.on("uncaught:exception", () => false);

        // 2. Encontrar el botón de continuar y esperar a que esté completamente cargado
        cy.get("astro-island[client-render-time]", { timeout: 15000 }).should("exist");
        cy.wait(2000);

        cy.contains("Continuar", { timeout: 10000 })
            .filter(":visible")
            .first()
            .should("be.enabled")
            .click({ force: true });

        // 3. Verificar que estamos en la página de selección de metodo de pago
        cy.url({ timeout: 15000 }).should("include", "payment");
        cy.get("form#payment", { timeout: 10000 }).should("exist");
        cy.wait(1000);

        // 4. Seleccionar Stripe
        cy.get("label[data-gateway='paypal']", { timeout: 10000 }).should("be.visible").click();

        // 5. Verificar que el radio button de Paypal está seleccionado
        cy.get("input[name='paymentMethod'][value='paypal']", { timeout: 5000 }).should(
            "be.checked",
        );

        // 6. Hacer click en el botón continuar
        cy.get("form#payment button[type='submit']", { timeout: 10000 })
            .should("be.enabled")
            .click();
    });
});
