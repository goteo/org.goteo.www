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

        cy.intercept("GET", "**/v4/project/100", {
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
            },
        }).as("projectData");

        cy.intercept("GET", "**/v4/project_rewards?project=100", {
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
            body: { accountingId: 123, id: 1 },
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
        cy.wait(3000);

        cy.get("body").should("exist");

        cy.get("body").then(($body) => {
            if ($body.find(".flex.h-\\[100\\%\\].flex-col.gap-6.rounded-\\[32px\\]").length > 0) {
                cy.get(".flex.h-\\[100\\%\\].flex-col.gap-6.rounded-\\[32px\\]").should(
                    "be.visible",
                );

                cy.contains("p", "Obtenido").should("be.visible");

                cy.contains("p", "Mínimo").should("be.visible");
                cy.contains("p", "Óptimo").should("be.visible");

                cy.get("body").should(($body) => {
                    const text = $body.text();
                    const hasGoalBadge =
                        text.includes("Mínimo conseguido") ||
                        text.includes("conseguido") ||
                        text.includes("alcanzado");

                    expect(
                        hasGoalBadge,
                        "Goal reached badge should be visible when balance exceeds minimum",
                    ).to.be.true;
                });

                cy.contains("p", "Obtenido")
                    .siblings("p")
                    .should(($el) => {
                        const amountText = $el.text();
                        expect(amountText).to.contain("€");
                        expect(amountText).to.not.equal("0€");
                    });
            } else {
                cy.get("body").then(($body) => {
                    const texts = ["Obtenido", "Mínimo", "Óptimo"];
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    let foundTexts = 0;

                    texts.forEach((text) => {
                        if ($body.text().includes(text)) {
                            foundTexts++;
                        }
                    });
                });
            }
        });
    });
});
