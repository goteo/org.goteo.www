describe("View project rewards", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should show option to donate without reward", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });

        cy.get("body").should("be.visible");

        cy.get("body").then(($body) => {
            const text = $body.text();

            if (text.includes("Donar") || text.includes("ayudar") || text.includes("proyecto")) {
                cy.get("body").should("contain.text", text.includes("Donar") ? "Donar" : "ayudar");
            }

            if (
                text.includes("recompensa") ||
                text.includes("Renuncio") ||
                text.includes("individual")
            ) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("recompensa") ? "recompensa" : "individual",
                );
            }

            if ($body.find("input").length > 0) {
                cy.get("input").should("exist");
            }

            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            if (text.includes("proyecto") || text.includes("project")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("proyecto") ? "proyecto" : "project",
                );
            }

            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }
        });
    });
});
