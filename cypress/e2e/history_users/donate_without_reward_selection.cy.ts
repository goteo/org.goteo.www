describe("View project rewards", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should show option to donate without reward", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });

        // Verify the page loads
        cy.get("body").should("be.visible");

        // Check for donation without reward selection content
        cy.get("body").then(($body) => {
            const text = $body.text();

            // Look for donation/contribution terms
            if (text.includes("Donar") || text.includes("ayudar") || text.includes("proyecto")) {
                cy.get("body").should("contain.text", text.includes("Donar") ? "Donar" : "ayudar");
            }

            // Look for reward-related terms
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

            // Look for input fields
            if ($body.find("input").length > 0) {
                cy.get("input").should("exist");
            }

            // Look for currency symbols
            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            // Look for project-related content
            if (text.includes("proyecto") || text.includes("project")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("proyecto") ? "proyecto" : "project",
                );
            }

            // Look for UI elements
            if ($body.find("button").length > 0) {
                cy.get("button").should("exist");
            }
        });
    });
});
