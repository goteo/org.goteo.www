/// <reference types="cypress" />

describe("Correct Display of Total Fundraising Counter", () => {
    beforeEach(() => {
        cy.login();
        cy.url().should("not.include", "/login");
    });

    it("should display fundraising counter with total raised and remaining amounts", () => {
        cy.visit("/es/projects/100");

        cy.get(".flex.h-\\[100\\%\\].flex-col.gap-6.rounded-\\[32px\\]").should("be.visible");

        cy.contains("p", "Obtenido").should("be.visible").and("have.class", "text-[#575757]");

        cy.contains("p", "Obtenido")
            .siblings("p")
            .should("exist")
            .and("have.class", "text-secondary")
            .and("have.class", "text-[32px]")
            .and("have.class", "font-bold");

        cy.contains("p", "Donaciones realizadas")
            .should("be.visible")
            .and("have.class", "text-[#575757]");

        cy.contains("p", "Donaciones realizadas")
            .siblings("p")
            .should("exist")
            .and("have.class", "text-secondary")
            .and("have.class", "text-[32px]")
            .and("have.class", "font-bold");

        cy.contains("p", "Óptimo").should("be.visible").and("have.class", "text-[#575757]");

        cy.contains("p", "Óptimo")
            .siblings("p")
            .should("be.visible")
            .and("contain.text", "€")
            .and("have.class", "text-secondary")
            .and("have.class", "text-[32px]")
            .and("have.class", "font-bold");

        cy.contains("p", "Mínimo").should("be.visible").and("have.class", "text-[#575757]");

        cy.contains("p", "Mínimo")
            .siblings("p")
            .should("be.visible")
            .and("contain.text", "€")
            .and("have.class", "text-secondary")
            .and("have.class", "text-[32px]")
            .and("have.class", "font-bold");

        cy.contains("button", "Donar a esta campaña")
            .should("be.visible")
            .and("have.class", "bg-primary")
            .and("have.class", "text-tertiary")
            .and("have.class", "font-bold");
    });

    it("should calculate and display remaining amount to reach funding goal", () => {
        cy.visit("/es/projects/100");

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
