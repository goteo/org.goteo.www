// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// ========== INTERFACES EXISTENTES ==========
interface User {
    email: string;
    password: string;
}

interface Users {
    validUser: User;
    invalidUser: User;
}

// ========== COMANDOS ESCALABLES NUEVOS ==========
// NOTA: Los tipos UserProfile y UserRole están definidos en index.d.ts

/**
 * Comando escalable para autenticación por rol
 * Configura automáticamente intercepts, localStorage y cookies
 */
Cypress.Commands.add("loginAs", (role: UserRole) => {
    cy.fixture("user-profiles").then((profiles) => {
        const profile = profiles[role];

        if (!profile) {
            throw new Error(`Profile '${role}' not found in user-profiles.json`);
        }

        // Si es guest, no configurar autenticación
        if (role === "guest") {
            cy.clearCookies();
            cy.clearLocalStorage();
            return;
        }

        // 1. Configurar intercept para /api/auth/me
        cy.intercept("GET", "**/api/auth/me", {
            statusCode: 200,
            body: {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                accountingId: profile.accountingId,
                roles: profile.roles,
                isAdmin: profile.isAdmin,
            },
        }).as("authMe");

        // 2. Configurar intercept para login (opcional)
        cy.intercept("POST", "**/api/auth/login", {
            statusCode: 200,
            body: {
                access_token: profile.token,
                refresh_token: `refresh-${profile.token}`,
                user: {
                    id: profile.id,
                    email: profile.email,
                    name: profile.name,
                    accountingId: profile.accountingId,
                    roles: profile.roles,
                },
            },
        }).as("loginRequest");

        // 3. Configurar cookie access-token
        cy.setCookie(
            "access-token",
            JSON.stringify({
                id: profile.id,
                token: profile.token,
                accountingId: profile.accountingId,
                isAdmin: profile.isAdmin,
            }),
        );

        // 4. Configurar localStorage
        cy.window().then((win) => {
            win.localStorage.setItem(
                "user",
                JSON.stringify({
                    id: profile.id,
                    email: profile.email,
                    name: profile.name,
                    accountingId: profile.accountingId,
                    roles: profile.roles,
                    isAdmin: profile.isAdmin,
                }),
            );
        });

        // 5. Configurar intercepts adicionales comunes
        cy.setupCommonIntercepts(profile);

        // 6. Manejar excepciones no capturadas
        cy.on("uncaught:exception", () => false);
    });
});

/**
 * Configurar intercepts comunes basados en el perfil del usuario
 */
Cypress.Commands.add("setupCommonIntercepts", (profile: UserProfile) => {
    // Intercept genérico para otras llamadas API
    cy.intercept("GET", "**/v4/**", {
        statusCode: 200,
        body: {
            accountingId: profile.accountingId,
            id: profile.id,
        },
    }).as("otherApiCalls");

    // Intercept específico para gateway_charges si es admin
    if (profile.isAdmin) {
        cy.intercept("GET", "**/v4/gateway_charges*", {
            statusCode: 200,
            headers: {
                "content-type": "application/ld+json",
            },
            body: {
                "@context": "/v4/contexts/GatewayCharge",
                "@id": "/v4/gateway_charges",
                "@type": "hydra:Collection",
                "hydra:member": [
                    {
                        "@id": "/v4/gateway_charges/1",
                        "@type": "GatewayCharge",
                        id: 1,
                        amount: 2500,
                        currency: "EUR",
                        status: "completed",
                        gateway: "stripe",
                        created_at: "2025-01-15T10:00:00Z",
                    },
                ],
                "hydra:totalItems": 247,
                "hydra:view": {
                    "@id": "/v4/gateway_charges?page=1&itemsPerPage=10&pagination=true",
                    "@type": "hydra:PartialCollectionView",
                },
                total_amount: "148,750",
                total_count: 247,
                currency: "EUR",
            },
        }).as("gatewayCharges");
    }
});

/**
 * Comando para verificar que el usuario tiene los roles correctos
 */
Cypress.Commands.add("verifyUserRole", (expectedRole: UserRole) => {
    cy.fixture("user-profiles").then((profiles) => {
        const profile = profiles[expectedRole];

        cy.window().then((win) => {
            const user = JSON.parse(win.localStorage.getItem("user") || "{}");
            expect(user.roles).to.deep.equal(profile.roles);
            expect(user.isAdmin).to.equal(profile.isAdmin);
        });
    });
});

/**
 * Comando para visitar página con autenticación automática
 */
Cypress.Commands.add("visitAs", (role: UserRole, url: string) => {
    cy.loginAs(role);
    cy.visit(url, { failOnStatusCode: false });
});

// ========== COMANDOS EXISTENTES (MANTENER COMPATIBILIDAD) ==========

Cypress.Commands.add(
    "login",
    (username: string = "root@goteo.org", password: string = "RootTestPass") => {
        console.warn(
            '⚠️  cy.login() is deprecated. Use cy.loginAs("user") or cy.loginAs("admin") instead',
        );

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
    console.warn('⚠️  cy.mockLogin() is deprecated. Use cy.loginAs("admin") instead');

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
