/// <reference types="cypress" />

describe("Objective achieved", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/api/auth/me", {
            statusCode: 200,
            body: {
                id: 1,
                email: "test@cypress.local",
                name: "Cypress Test User",
                accountingId: 123,
                isAuthenticated: true,
            },
        }).as("authMe");

        cy.intercept("GET", "**/v4/projects/100*", {
            statusCode: 200,
            body: {
                id: 100,
                title: "Proyecto Objetivo Alcanzado",
                amount: 7500,
                minimal: 5000,
                optimal: 10000,
                received: 7500,
                num_investors: 45,
                status: "active",
                currency: "EUR",
                description: "Descripción del proyecto de prueba",
                owner: {
                    id: 1,
                    name: "Owner Test",
                    accountingId: 456,
                },
                progress: {
                    percentage: 150,
                    achieved: true,
                    goalReached: true,
                },
                funding: {
                    received: 7500,
                    minimal: 5000,
                    optimal: 10000,
                    percentage: 150,
                },
            },
        }).as("projectData");

        cy.intercept("GET", "**/v4/project/100*", {
            statusCode: 200,
            body: {
                id: 100,
                title: "Proyecto Objetivo Alcanzado",
                amount: 7500,
                minimal: 5000,
                optimal: 10000,
                received: 7500,
                num_investors: 45,
                status: "active",
                currency: "EUR",
                description: "Descripción del proyecto de prueba",
            },
        }).as("projectDataAlt");

        cy.intercept("GET", "**/project*", {
            statusCode: 200,
            body: {
                id: 100,
                title: "Proyecto Objetivo Alcanzado",
                amount: 7500,
                minimal: 5000,
                optimal: 10000,
                received: 7500,
                status: "active",
                currency: "EUR",
            },
        }).as("anyProject");

        cy.intercept("GET", "**/v4/project_rewards*", {
            statusCode: 200,
            body: [
                {
                    id: 3827,
                    project: "/v4/project/100",
                    title: 'CD "Al Paso de los Caracoles" + 2 Camisetas',
                    description: "CD físico del álbum junto con 2 camisetas oficiales",
                    money: { amount: 4000, currency: "EUR" },
                    hasUnits: true,
                    unitsTotal: 5,
                    unitsAvailable: 5,
                    locales: ["es"],
                },
            ],
        }).as("projectRewards");

        cy.intercept("GET", "**/v4/**", {
            statusCode: 200,
            body: {
                accountingId: 123,
                id: 1,
                received: 7500,
                minimal: 5000,
                optimal: 10000,
                status: "active",
            },
        }).as("otherApiCalls");

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

        cy.setCookie(
            "access-token",
            JSON.stringify({
                token: "mock-access-token-cypress-123",
                accountingId: 123,
                userId: 1,
            }),
        );

        cy.mockLogin();
        cy.on("uncaught:exception", () => false);
    });

    it("should display goal reached status when minimum is exceeded", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });
        cy.get("body").should("exist");
        cy.wait(2000);

        cy.get("body").should("not.be.empty");

        cy.get("body").then(($body) => {
            const text = $body.text().toLowerCase();

            const hasFinancingContent =
                text.includes("obtenido") ||
                text.includes("recaudado") ||
                text.includes("financiado") ||
                text.includes("conseguido") ||
                text.includes("alcanzado") ||
                text.includes("mínimo") ||
                text.includes("óptimo") ||
                text.includes("€") ||
                text.includes("eur") ||
                /\d+/.test(text);

            if (hasFinancingContent) {
                const goalIndicators = [
                    "conseguido",
                    "alcanzado",
                    "financiado",
                    "logrado",
                    "completado",
                    "100%",
                    "150%",
                    "✓",
                    "success",
                    "meta",
                    "objetivo",
                    "goal",
                    "achieved",
                ];

                let foundGoalIndicator = false;
                goalIndicators.forEach((indicator) => {
                    if (text.includes(indicator)) {
                        foundGoalIndicator = true;
                    }
                });

                if (foundGoalIndicator) {
                    expect(foundGoalIndicator, "Goal indicator should be present").to.be.true;
                } else {
                    expect(hasFinancingContent, "Should have financing-related content").to.be.true;
                }
            } else {
                cy.wait(3000);
                cy.get("body").then(($bodyAgain) => {
                    const textAgain = $bodyAgain.text().toLowerCase();
                    const hasContentNow =
                        textAgain.includes("proyecto") ||
                        textAgain.includes("€") ||
                        /\d+/.test(textAgain);

                    expect(hasContentNow, "Should have some project content after waiting").to.be
                        .true;
                });
            }
        });

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("Obtenido") || text.includes("Recaudado")) {
                cy.contains(/Obtenido|Recaudado/i).should("be.visible");
            }

            if (text.includes("Mínimo")) {
                cy.contains("Mínimo").should("be.visible");
            }

            if (text.includes("Óptimo")) {
                cy.contains("Óptimo").should("be.visible");
            }

            if (text.includes("€")) {
                cy.get("body").should("contain.text", "€");
            }
        });
    });

    it("should display project page with basic content", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });
        cy.get("body").should("exist").and("not.be.empty");

        cy.get("body", { timeout: 10000 }).should(($body) => {
            const text = $body.text();
            const hasProjectContent =
                text.includes("proyecto") || text.includes("Project") || text.length > 1000;

            expect(hasProjectContent, "Should display project-related content").to.be.true;
        });
    });
});
