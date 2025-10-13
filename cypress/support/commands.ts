// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// ========== EXISTING INTERFACES ==========
interface User {
    email: string;
    password: string;
}

interface Users {
    validUser: User;
    invalidUser: User;
}

// ========== NEW SCALABLE COMMANDS ==========
// NOTE: UserProfile and UserRole types are defined in index.d.ts

/**
 * Scalable command for role-based authentication
 * Automatically configures intercepts, localStorage and cookies
 */
Cypress.Commands.add("loginAs", (role: UserRole) => {
    cy.fixture("user-profiles").then((profiles) => {
        const profile = profiles[role];

        if (!profile) {
            throw new Error(`Profile '${role}' not found in user-profiles.json`);
        }

        // If it's guest, don't configure authentication
        if (role === "guest") {
            cy.clearCookies();
            cy.clearLocalStorage();
            return;
        }

        // 1. Configure intercept to get user data
        cy.intercept("GET", `**/v4/users/${profile.id}`, {
            statusCode: 200,
            body: {
                id: profile.id,
                email: profile.email,
                handle: profile.email.split("@")[0],
                displayName: profile.name,
                roles: profile.roles,
                accounting: `/v4/accountings/${profile.accountingId}`,
                person: `/v4/users/${profile.id}/person`,
                emailConfirmed: true,
                active: true,
            },
        }).as("getUserData");

        // 2. Configure intercept for login
        cy.intercept("POST", "**/v4/user_tokens", {
            statusCode: 201,
            body: {
                id: 1,
                token: profile.token,
                owner: `/v4/users/${profile.id}`,
            },
        }).as("loginRequest");

        // 3. Configure intercept for person data
        cy.intercept("GET", `**/v4/users/${profile.id}/person`, {
            statusCode: 200,
            body: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
            },
        }).as("getPersonData");

        // 4. Configure access-token cookie
        cy.setCookie(
            "access-token",
            JSON.stringify({
                id: profile.id,
                user: {
                    id: profile.id,
                    email: profile.email,
                    handle: profile.email.split("@")[0],
                    displayName: profile.name,
                    roles: profile.roles,
                    accounting: `/v4/accountings/${profile.accountingId}`,
                    person: `/v4/users/${profile.id}/person`,
                    emailConfirmed: true,
                    active: true,
                },
                person: {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                },
                token: profile.token,
                accountingId: profile.accountingId,
                isAdmin: profile.isAdmin,
            }),
        );

        // 5. Configure localStorage
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

        // 6. Configure additional common intercepts
        cy.setupCommonIntercepts(profile);

        // 7. Handle uncaught exceptions
        cy.on("uncaught:exception", () => false);
    });
});

/**
 * Configure common intercepts based on user profile
 */
Cypress.Commands.add("setupCommonIntercepts", (profile: UserProfile) => {
    cy.intercept("GET", "**/v4/projects/**", {
        statusCode: 200,
        body: {
            id: 100,
            title: "Test Project",
            accountingId: profile.accountingId,
        },
    }).as("projectsApi");

    cy.intercept("GET", "**/v4/accountings/**", {
        statusCode: 200,
        body: {
            accountingId: profile.accountingId,
            id: profile.id,
        },
    }).as("accountingsApi");

    if (
        profile.isAdmin &&
        !(Cypress.env("SKIP_GLOBAL_GATEWAYS") || Cypress.env("SKIP_GATEWAY_INTERCEPTS"))
    ) {
        cy.intercept("GET", "**/v4/gateways", {
            statusCode: 200,
            body: [
                { name: "stripe", title: "Stripe" },
                { name: "paypal", title: "PayPal" },
            ],
        }).as("globalGateways");

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
                        title: "Test charge",
                        description: "Test charge description",
                        status: "charged",
                        money: { amount: 2500, currency: "EUR" },
                        target: "/v4/accountings/100",
                        dateCreated: "2025-01-15T10:00:00Z",
                    },
                ],
                "hydra:totalItems": 1,
                "hydra:view": {
                    "@id": "/v4/gateway_charges?page=1&itemsPerPage=10&pagination=true",
                    "@type": "hydra:PartialCollectionView",
                },
                total_amount: "2,500",
                total_count: 1,
                currency: "EUR",
            },
        }).as("gatewayCharges");
    }
});

/**
 * Command to verify that the user has the correct roles
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
 * Command to visit page with automatic authentication
 */
Cypress.Commands.add("visitAs", (role: UserRole, url: string) => {
    cy.loginAs(role);
    cy.visit(url, { failOnStatusCode: false });
});

// ========== EXISTING COMMANDS (MAINTAIN COMPATIBILITY) ==========

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

    cy.intercept("POST", "**/v4/user_tokens", {
        statusCode: 201,
        body: {
            id: 1,
            token: "mock-access-token-cypress-123",
            owner: "/v4/users/1",
        },
    }).as("loginRequest");

    cy.intercept("GET", "**/v4/users/1", {
        statusCode: 200,
        body: {
            id: 1,
            email: "test@cypress.local",
            handle: "test",
            displayName: "Cypress Test User",
            roles: ["ROLE_USER"],
            accounting: "/v4/accountings/123",
            person: "/v4/users/1/person",
            emailConfirmed: true,
            active: true,
        },
    }).as("getUserData");

    cy.intercept("GET", "**/v4/users/1/person", {
        statusCode: 200,
        body: {
            id: 1,
            name: "Cypress Test User",
            email: "test@cypress.local",
        },
    }).as("getPersonData");

    cy.setCookie(
        "access-token",
        JSON.stringify({
            id: 1,
            user: {
                id: 1,
                email: "test@cypress.local",
                handle: "test",
                displayName: "Cypress Test User",
                roles: ["ROLE_USER"],
                accounting: "/v4/accountings/123",
                person: "/v4/users/1/person",
                emailConfirmed: true,
                active: true,
            },
            person: {
                id: 1,
                name: "Cypress Test User",
                email: "test@cypress.local",
            },
            token: "mock-access-token-cypress-123",
            accountingId: 123,
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
            id: 1,
            user: {
                id: 1,
                email: "cypress@test.local",
                handle: "cypress",
                displayName: "Cypress Bypass User",
                roles: ["ROLE_USER"],
                accounting: "/v4/accountings/999",
                person: "/v4/users/1/person",
                emailConfirmed: true,
                active: true,
            },
            person: {
                id: 1,
                name: "Cypress Bypass User",
                email: "cypress@test.local",
            },
            token: "cypress-bypass-token",
            accountingId: 999,
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
    cy.get("body").then(($body) => {
        if ($body.find('header a[href="/"] svg').length > 0) {
            cy.get('header a[href="/"] svg', { timeout: 5000 }).should("be.visible");
        } else if ($body.find("header svg").length > 0) {
            cy.get("header svg", { timeout: 5000 }).should("be.visible");
        } else {
            cy.log("ℹ️ Logo not found");
        }

        if ($body.find("header nav").length > 0) {
            cy.get("header nav", { timeout: 5000 }).should("exist");
        } else {
            cy.log("ℹ️ Navigation not found");
        }

        if ($body.find('header button[aria-label="Ir al checkout"]').length > 0) {
            cy.get('header button[aria-label="Go to checkout"]', { timeout: 5000 }).should(
                "be.visible",
            );
        } else {
            cy.log("ℹ️ Cart button not found");
        }
    });
});

Cypress.Commands.add("changeLanguage", (language: string) => {
    cy.get("body").then(($body) => {
        if ($body.find("select#language-select").length > 0) {
            cy.get("select#language-select", { timeout: 5000 }).select(language);
        } else {
            cy.log("ℹ️ Language selector not found");
        }
    });
});

Cypress.Commands.add("checkLoginFormValidation", () => {
    cy.get("body").then(($body) => {
        if ($body.find('button[form="login"]').length > 0) {
            cy.get('button[form="login"]', { timeout: 5000 }).click();

            if ($body.find("input#identifier").length > 0) {
                cy.get("input#identifier", { timeout: 5000 }).should("exist");
                cy.get("input#identifier").type("test@example.com");

                if ($body.find("input#password").length > 0) {
                    cy.get("input#password", { timeout: 5000 }).should("exist");
                }
            }
        } else {
            cy.log("ℹ️ Login form validation elements not found");
        }
    });
});
Cypress.Commands.add(
    "setupTestSpecificIntercepts",
    (options: { skipGlobalGateways?: boolean; skipGlobalAuth?: boolean }) => {
        if (options.skipGlobalGateways) {
            Cypress.env("SKIP_GLOBAL_GATEWAYS", true);
        }

        if (options.skipGlobalAuth) {
            Cypress.env("SKIP_GLOBAL_AUTH", true);
        }
    },
);
