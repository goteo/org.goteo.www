/// <reference types="cypress" />

describe("Login Page", () => {
    beforeEach(() => {
        cy.visit("/login");
        // Manejar excepciones no capturadas en todas las pruebas
        cy.on("uncaught:exception", () => false);
    });

    it("should display the login form elements correctly", () => {
        // Verificar encabezados
        cy.get("h2").contains("Indícanos tus datos personales").should("be.visible");
        cy.get("h2").contains("Entra en tu cuenta o").should("be.visible");
        cy.get("a").contains("Regístrate").should("be.visible");

        // Verificar formulario y campos
        cy.get("form#login").within(() => {
            cy.get("input#identifier").should("exist");
            cy.get("input#password").should("exist");
            cy.get('button[type="submit"]').contains("Iniciar sesión").should("be.visible");
        });

        // Verificar opciones sociales y enlace de recuperación
        cy.contains("También puedes acceder a través de:").should("be.visible");

        cy.contains("¿Olvidaste tu contraseña?").should("be.visible");
    });

    it("should display floating labels correctly", () => {
        // Verificar etiquetas y comportamiento al escribir
        cy.get('label[for="identifier"]').should("exist");

        // Verificar que el input es visible
        cy.get("input#identifier").should("be.visible");

        // Escribir en el campo
        cy.get("input#identifier").type("root@goteo.org");

        // Verificar el valor después de escribir
        cy.get("input#identifier").should("have.value", "root@goteo.org");

        // Verificar que la etiqueta sigue visible después de escribir
        cy.get('label[for="identifier"]').should("be.visible");
    });

    it("should validate form fields appropriately", () => {
        // Utilizar el comando personalizado para verificar la validación
        cy.checkLoginFormValidation();
    });

    it("should attempt login with valid user credentials", () => {
        cy.fixture("users").then((users) => {
            // Utilizar datos del fixture para el login
            cy.login(users.validUser.email, users.validUser.password);

            // Verificar intento de login
            cy.get("form#login").should("exist");
        });
    });

    it("should handle login errors correctly", () => {
        cy.fixture("users").then((users) => {
            // Intentar login con credenciales incorrectas del fixture
            cy.login(users.invalidUser.email, users.invalidUser.password);

            // Verificar que permanecemos en la página de login
            cy.url().should("include", "/login");
            cy.get("form#login").should("exist");
        });
    });
});
