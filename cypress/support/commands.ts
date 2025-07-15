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
        if (Cypress.env("CI") || Cypress.env("MOCK_AUTH")) {
            cy.mockLogin();
            return;
        }

        cy.fixture<Users>("users").then((users) => {
            if (username === "root@goteo.org" && password === "RootTestPass") {
                username = users.validUser.email;
                password = users.validUser.password;
            }
        });

        cy.visit("/login");
        cy.get("input#identifier").type(username);
        cy.get("input#password").type(password);
        cy.get('button[form="login"]').click();

        cy.on("uncaught:exception", () => false);
    },
);

Cypress.Commands.add("mockLogin", () => {
    cy.intercept("POST", "**/api/auth/login", {
        statusCode: 200,
        body: {
            access_token: "mock-access-token-cypress-123",
            refresh_token: "mock-refresh-token-cypress-456",
            user: {
                id: 1,
                email: "test@cypress.local",
                name: "Cypress Test User",
                accountingId: 123,
            },
        },
    }).as("loginRequest");

    cy.intercept("GET", "**/api/auth/me", {
        statusCode: 200,
        body: {
            id: 1,
            email: "test@cypress.local",
            name: "Cypress Test User",
            accountingId: 123,
        },
    }).as("authMe");

    cy.setCookie(
        "access-token",
        JSON.stringify({
            token: "mock-access-token-cypress-123",
            accountingId: 123,
            userId: 1,
        }),
    );

    cy.window().then((win) => {
        win.localStorage.setItem(
            "user",
            JSON.stringify({
                id: 1,
                email: "test@cypress.local",
                name: "Cypress Test User",
                isAuthenticated: true,
                accountingId: 123,
            }),
        );
    });

    cy.visit("/");
});

Cypress.Commands.add("loginBypass", () => {
    cy.setCookie(
        "access-token",
        JSON.stringify({
            token: "cypress-bypass-token",
            accountingId: 999,
            userId: 1,
        }),
    );

    cy.window().then((win) => {
        win.localStorage.setItem(
            "user",
            JSON.stringify({
                id: 1,
                email: "cypress@test.local",
                name: "Cypress Bypass User",
                isAuthenticated: true,
                accountingId: 999,
            }),
        );
    });
});

Cypress.Commands.add("checkHeaderElements", () => {
    cy.get('header a[href="/"] svg').should("be.visible"); // Logo
    cy.get("header nav").should("exist"); // Navigation
    cy.get('header button[aria-label="Ir al checkout"]').should("be.visible"); // Cart button
});

Cypress.Commands.add("changeLanguage", (language: string) => {
    cy.get("select#language-select").select(language);
});

Cypress.Commands.add("checkLoginFormValidation", () => {
    cy.get('button[form="login"]').click();
    cy.get("input#identifier:invalid").should("exist");

    cy.get("input#identifier").type("test@example.com");
    cy.get('button[form="login"]').click();
    cy.get("input#password:invalid").should("exist");
});
