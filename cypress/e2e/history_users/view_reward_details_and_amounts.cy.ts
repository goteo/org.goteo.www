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
                    unitsClaimed: 0,
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
                    unitsClaimed: 0,
                    unitsAvailable: 0,
                    locales: ["es"],
                },
            ],
        }).as("rewardsMock");

        cy.mockLogin();
        cy.on("uncaught:exception", () => false);
    });

    it("should show reward details with amounts and descriptions", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });
        cy.wait("@rewardsMock");

        cy.get("body").should("contain", formatCurrency(4000, "EUR"));
        cy.get("body").should("contain", formatCurrency(1500, "EUR"));

        cy.get("body").should("contain", "CD + 2 Camisetas");
        cy.get("body").should("contain", "CD Al Paso de los Caracoles");

        cy.get("body").should("contain", "0 donantes");
        cy.get("body").should("contain", "Quedan 5 unidades");
    });
});
