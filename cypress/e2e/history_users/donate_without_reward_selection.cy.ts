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
                    hasUnits: true,
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
                    hasUnits: false,
                    unitsTotal: 0,
                    unitsAvailable: 0,
                    locales: ["es"],
                },
            ],
        }).as("rewardsMock");

        cy.mockLogin();
        cy.on("uncaught:exception", () => false);
    });

    it("should show option to donate without reward", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });
        cy.wait("@rewardsMock");

        cy.get("body").should("contain", "Renuncio a una recompensa individual");
        cy.get("body").should("contain", "solo quiero ayudar al proyecto");

        cy.get('input[placeholder*="Seleccione el aporte"]').should("exist");
        cy.get("body").should("contain", "Donar");
    });
});
