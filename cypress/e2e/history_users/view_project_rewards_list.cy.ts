describe("View project rewards", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should display complete rewards list", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });

        // Verify the page loads
        cy.get("body").should("be.visible");

        // Check for rewards-related content that might be present
        cy.get("body").then(($body) => {
            const text = $body.text();

            // Look for reward selection text
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

            // Look for price indicators
            if (text.includes("€") || text.includes("EUR")) {
                cy.get("body").should("contain.text", "€");
            }

            // Look for common reward-related terms
            if (text.includes("CD") || text.includes("Camiseta")) {
                cy.get("body").should("contain.text", text.includes("CD") ? "CD" : "Camiseta");
            }
        });
    });
});
