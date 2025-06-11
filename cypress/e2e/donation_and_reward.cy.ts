/// <reference types="cypress" />

describe("Project Page - Donation and Reward Verification", () => {
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
        }).as("project100Rewards");

        cy.login();
        cy.url().should("not.include", "/login");
    });

    it("should display donation and reward elements", () => {
        cy.visit("/es/projects/100");
        cy.wait("@project100Rewards");

        cy.get("li.flex.flex-col.gap-2.rounded-4xl.border").within(() => {
            cy.get("h3.text-tertiary.text-2xl.font-semibold").should("be.visible");

            cy.get("p.mb-2.text-sm.whitespace-pre-line.text-gray-800").should("be.visible");

            cy.get('button[type="button"]')
                .should("be.visible")
                .and("contain.text", "Dona")
                .and("contain.text", "40€");
        });
    });
});
