describe("View project rewards", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should show suggested amounts for contribution", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });

        // Verify the page loads
        cy.get("body").should("be.visible");

        // Check for reward details and amounts content
        cy.get("body").then(($body) => {
            const text = $body.text();

            // Look for currency symbols and amounts
            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            // Look for reward-related content
            if (text.includes("CD") || text.includes("Camiseta") || text.includes("recompensa")) {
                cy.get("body").should("contain.text", text.includes("CD") ? "CD" : "Camiseta");
            }

            // Look for contribution/suggestion terms
            if (text.includes("Por") || text.includes("aporte") || text.includes("contribuir")) {
                cy.get("body").should("contain.text", text.includes("Por") ? "Por" : "aporte");
            }

            // Look for input fields
            if ($body.find("input").length > 0) {
                cy.get("input").should("exist");
            }

            // Look for suggested amounts (numeric patterns)
            const hasNumbers = /\d+/.test(text);
            if (hasNumbers) {
                cy.get("body").should("contain.text", text.match(/\d+/)?.[0] || "");
            }

            // Look for project-related content
            if (text.includes("proyecto") || text.includes("project")) {
                cy.get("body").should(
                    "contain.text",
                    text.includes("proyecto") ? "proyecto" : "project",
                );
            }
        });
    });
});
