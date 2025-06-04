// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Define la interfaz User para el objeto fixture
interface User {
    email: string;
    password: string;
}

interface Users {
    validUser: User;
    invalidUser: User;
}

Cypress.Commands.add(
    "login",
    (username: string = "root@goteo.org", password: string = "RootTestPass") => {
        cy.fixture<Users>("users").then((users) => {
            if (username === "root@goteo.org" && password === "RootTestPass") {
                username = users.validUser.email;
                password = users.validUser.password;
            }
        });

        cy.visit("/login");
        cy.get("input#identifier").type(username);
        cy.get("input#password").type(password);
        cy.get('button[type="submit"]').click();

        cy.on("uncaught:exception", () => false);
    },
);

Cypress.Commands.add("checkHeaderElements", () => {
    cy.get('header a[href="/"] svg').should("be.visible"); // Logo
    cy.get("header nav").should("exist"); // Navigation
    cy.get('header button[aria-label="Ir al checkout"]').should("be.visible"); // Cart button
});

Cypress.Commands.add("changeLanguage", (language: string) => {
    cy.get("select#language-select").select(language);
});

Cypress.Commands.add("checkLoginFormValidation", () => {
    cy.get('button[type="submit"]').click();
    cy.get("input#identifier:invalid").should("exist");

    cy.get("input#identifier").type("test@example.com");
    cy.get('button[type="submit"]').click();
    cy.get("input#password:invalid").should("exist");
});
