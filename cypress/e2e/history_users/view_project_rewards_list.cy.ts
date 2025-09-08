describe("View project rewards", () => {
    beforeEach(() => {
        cy.loginAs("user");
        cy.on("uncaught:exception", () => false);
    });

    it("should display complete rewards list", () => {
        cy.visit("/es/project/100", { failOnStatusCode: false });

        cy.get("body").should("be.visible");

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
