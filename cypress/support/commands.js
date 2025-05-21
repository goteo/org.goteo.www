// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Comando personalizado para reutilizar el login
Cypress.Commands.add("login", (username = "root@goteo.org", password = "RootTestPass") => {
    // Cargar datos de prueba desde fixtures
    cy.fixture("users").then((users) => {
        // Usar datos de fixture si no se proporcionan parámetros
        if (username === "root@goteo.org" && password === "RootTestPass") {
            username = users.validUser.email;
            password = users.validUser.password;
        }
    });

    // Visitar página de login y enviar el formulario
    cy.visit("/login");
    cy.get("input#identifier").type(username);
    cy.get("input#password").type(password);
    cy.get('button[type="submit"]').click();

    // Ignorar excepciones no capturadas durante el login
    cy.on("uncaught:exception", () => false);
});

// Comando para verificar elementos básicos del header
Cypress.Commands.add("checkHeaderElements", () => {
    cy.get('header a[href="/"] svg').should("be.visible"); // Logo
    cy.get("header nav").should("exist"); // Navigation
    cy.get('header button[aria-label="Ir al checkout"]').should("be.visible"); // Cart button
});

// Comando para cambiar el idioma
Cypress.Commands.add("changeLanguage", (language) => {
    cy.get("select#language-select").select(language);
});

// Comando para verificar la validación del formulario de login
Cypress.Commands.add("checkLoginFormValidation", () => {
    cy.get('button[type="submit"]').click();
    cy.get("input#identifier:invalid").should("exist");

    cy.get("input#identifier").type("test@example.com");
    cy.get('button[type="submit"]').click();
    cy.get("input#password:invalid").should("exist");
});
