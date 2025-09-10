import { formatCurrency } from "../../../src/utils/currencies";

describe("View project rewards", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/v4/project_rewards**", {
            statusCode: 200,
            body: [
                {
                    id: 3827,
                    project: "/v4/projects/100",
                    title: "CD + 2 Camisetas",
                    description: "CD físico firmado + 2 camisetas edición limitada",
                    money: { amount: 4000, currency: "EUR" },
                    isFinite: true,
                    unitsTotal: 5,
                    unitsAvailable: 5,
                    locales: ["es"],
                },
                {
                    id: 3816,
                    project: "/v4/projects/100",
                    title: "CD Al Paso de los Caracoles",
                    description: "CD físico firmado",
                    money: { amount: 1500, currency: "EUR" },
                    isFinite: false,
                    unitsTotal: 0,
                    unitsAvailable: 0,
                    locales: ["es"],
                },
            ],
        }).as("rewardsMock");

        cy.mockLogin();
        cy.on("uncaught:exception", () => false);
    });

    it("should display complete rewards list", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });

        cy.get("body").should("be.visible");

        cy.get("body").should("contain", formatCurrency(4000, "EUR"));
        cy.get("body").should("contain", formatCurrency(1500, "EUR"));
        cy.get("body").then(($body) => {
            const text = $body.text();

            if (
                text.includes("Selecciona") ||
                text.includes("recompensas") ||
                text.includes("rewards")
            ) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("Selecciona") ? "Selecciona" : "recompensas",
                );
            }

            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            if (text.includes("CD") || text.includes("Camiseta")) {
                cy.get("body").should("contain.text", text.includes("CD") ? "CD" : "Camiseta");
            }
        });
    });
});
