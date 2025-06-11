/// <reference types="cypress" />

describe("Correct Display of Total Fundraising Counter", () => {
    beforeEach(() => {
        cy.intercept("GET", "**/v4/project_rewards?project=100", {
            statusCode: 200,
            body: [
                {
                    id: 3827,
                    project: "/v4/projects/100",
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

        cy.intercept("GET", "**/v4/projects/100", {
            statusCode: 200,
            body: {
                id: 100,
                title: "Proyecto de Prueba",
                amount: 12500,
                minimal: 5000,
                optimal: 25000,
                received: 12500,
                num_investors: 45,
                status: "active",
                currency: "EUR",
            },
        }).as("projectData");

        cy.login();
        cy.url().should("not.include", "/login");
    });

    const verifyCounterElement = (label: any, shouldContainEuro = false) => {
        cy.contains("p", label).should("be.visible").and("have.class", "text-[#575757]");

        cy.contains("p", label)
            .siblings("p")
            .should(shouldContainEuro ? "be.visible" : "exist")
            .and("have.class", "text-secondary")
            .and("have.class", "text-[32px]")
            .and("have.class", "font-bold")
            .then(($el) => {
                if (shouldContainEuro) {
                    expect($el.text()).to.contain("€");
                }
            });
    };

    it("should display fundraising counter with total raised and remaining amounts", () => {
        cy.visit("/es/projects/100");

        cy.wait("@projectRewards", { timeout: 3000 });

        cy.get(".flex.h-\\[100\\%\\].flex-col.gap-6.rounded-\\[32px\\]").should("be.visible");

        verifyCounterElement("Obtenido");
        verifyCounterElement("Donaciones realizadas");
        verifyCounterElement("Óptimo", true);
        verifyCounterElement("Mínimo", true);

        cy.contains("button", "Donar a esta campaña")
            .should("be.visible")
            .and("have.class", "bg-primary")
            .and("have.class", "text-tertiary")
            .and("have.class", "font-bold");
    });

    it("should calculate and display remaining amount to reach funding goal", () => {
        cy.visit("/es/projects/100");

        cy.wait("@projectRewards", { timeout: 3000 });

        cy.contains("p", "Obtenido")
            .siblings("p")
            .invoke("text")
            .then((obtainedText) => {
                cy.contains("p", "Óptimo")
                    .siblings("p")
                    .invoke("text")
                    .then((optimalText) => {
                        const obtained = parseFloat(obtainedText.replace(/[€,]/g, "")) || 0;
                        const optimal = parseFloat(optimalText.replace(/[€,]/g, ""));
                        const remaining = optimal - obtained;

                        cy.log(
                            `Obtained: ${obtained}€, Optimal: ${optimal}€, Remaining: ${remaining}€`,
                        );

                        expect(remaining).to.be.at.least(0);
                    });
            });
    });
});
