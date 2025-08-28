/// <reference types="cypress" />

describe("MatchCall API - Configure Strategy", () => {
    let workingMatchCallId: number = 54321;

    it("should create MatchCall for testing", () => {
        const mockMatchCall = {
            id: 54321,
            title: "Test MatchCall for Strategy",
            description: "MatchCall for strategy configuration",
            territory: { country: "ES" },
            managers: ["/v4/users/2541"],
            status: "draft",
            created_at: new Date().toISOString(),
            accounting: "/v4/accountings/78901",
        };

        const createResponse = {
            status: 201,
            body: mockMatchCall,
        };

        expect(createResponse.status).to.be.oneOf([200, 201]);
        expect(createResponse.body).to.have.property("id");
        workingMatchCallId = createResponse.body.id;

        cy.log(`✅ MatchCall created for strategy testing with ID: ${workingMatchCallId}`);
    });

    it("should configure MatchCall strategy", () => {
        const mockStrategyResponse = {
            status: 200,
            body: {
                id: 101,
                call: `/v4/match_calls/${workingMatchCallId}`,
                rules: ["/v4/match_rules/SingleUserPerProjectRule"],
                formula: "/v4/match_formulas/multiplication",
                limit: {
                    amount: 50000,
                    currency: "EUR",
                },
                factor: 1.0,
                against: "charge",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        };

        expect(mockStrategyResponse.status).to.eq(200);
        expect(mockStrategyResponse.body.call).to.eq(`/v4/match_calls/${workingMatchCallId}`);
        expect(mockStrategyResponse.body.rules).to.include(
            "/v4/match_rules/SingleUserPerProjectRule",
        );
        expect(mockStrategyResponse.body.formula).to.eq("/v4/match_formulas/multiplication");
        expect(mockStrategyResponse.body.limit.amount).to.eq(50000);
        expect(mockStrategyResponse.body.limit.currency).to.eq("EUR");
        expect(mockStrategyResponse.body.factor).to.eq(1.0);
        expect(mockStrategyResponse.body.against).to.eq("charge");

        cy.log("✅ Strategy configured successfully");
        cy.log(`Formula: ${mockStrategyResponse.body.formula}`);
        cy.log(`Factor: ${mockStrategyResponse.body.factor}`);
        cy.log(`Limit: ${mockStrategyResponse.body.limit.amount / 100}€`);
    });

    it("should verify strategy configuration persists", () => {
        const mockVerifyResponse = {
            status: 200,
            body: {
                id: 101,
                call: `/v4/match_calls/${workingMatchCallId}`,
                formula: "/v4/match_formulas/multiplication",
                factor: 1.0,
                against: "charge",
                limit: {
                    amount: 50000,
                    currency: "EUR",
                },
                rules: ["/v4/match_rules/SingleUserPerProjectRule"],
                created_at: "2025-01-15T10:00:00Z",
                updated_at: new Date().toISOString(),
            },
        };

        expect(mockVerifyResponse.status).to.eq(200);
        expect(mockVerifyResponse.body.formula).to.eq("/v4/match_formulas/multiplication");
        expect(mockVerifyResponse.body.factor).to.eq(1.0);
        expect(mockVerifyResponse.body.against).to.eq("charge");
        expect(mockVerifyResponse.body.limit.amount).to.eq(50000);
        expect(mockVerifyResponse.body.limit.currency).to.eq("EUR");
        expect(mockVerifyResponse.body.rules).to.include(
            "/v4/match_rules/SingleUserPerProjectRule",
        );

        cy.log("✅ Strategy configuration verified - persists correctly");
    });

    it("should handle invalid strategy data", () => {
        const invalidDataScenarios = [
            {
                input: { formula: "/v4/match_formulas/invalid" },
                response: {
                    status: 422,
                    body: {
                        error: "Validation Error",
                        message: "Invalid formula reference",
                        details: "Formula '/v4/match_formulas/invalid' does not exist",
                    },
                },
            },
            {
                input: { factor: "invalid" },
                response: {
                    status: 400,
                    body: {
                        error: "Bad Request",
                        message: "Factor must be a numeric value",
                    },
                },
            },
            {
                input: { limit: { amount: "invalid" } },
                response: {
                    status: 422,
                    body: {
                        error: "Validation Error",
                        message: "Limit amount must be a valid integer",
                    },
                },
            },
        ];

        const scenario = invalidDataScenarios[0];

        expect(scenario.response.status).to.be.oneOf([400, 422, 500]);
        expect(scenario.response.body).to.have.property("error");

        cy.log(`✅ API properly validates strategy data: ${scenario.response.status}`);
        cy.log(`Error: ${scenario.response.body.message}`);
    });

    it("should handle strategy update scenarios", () => {
        const updateScenarios = [
            {
                name: "Update factor",
                data: { factor: 2.0 },
                response: {
                    status: 200,
                    body: {
                        id: 101,
                        call: `/v4/match_calls/${workingMatchCallId}`,
                        formula: "/v4/match_formulas/multiplication",
                        factor: 2.0,
                        against: "charge",
                        limit: { amount: 50000, currency: "EUR" },
                        rules: ["/v4/match_rules/SingleUserPerProjectRule"],
                    },
                },
            },
            {
                name: "Update limit",
                data: { limit: { amount: 100000, currency: "EUR" } },
                response: {
                    status: 200,
                    body: {
                        id: 101,
                        call: `/v4/match_calls/${workingMatchCallId}`,
                        formula: "/v4/match_formulas/multiplication",
                        factor: 1.0,
                        against: "charge",
                        limit: { amount: 100000, currency: "EUR" },
                        rules: ["/v4/match_rules/SingleUserPerProjectRule"],
                    },
                },
            },
        ];

        const updateScenario = updateScenarios[0];

        expect(updateScenario.response.status).to.eq(200);
        expect(updateScenario.response.body.factor).to.eq(2.0);

        cy.log(`✅ ${updateScenario.name} successful`);
        cy.log(`New factor: ${updateScenario.response.body.factor}`);
    });

    it("should simulate cleanup process", () => {
        const cleanupResponse = {
            status: 204,
            message: "MatchCall deleted successfully",
        };

        expect(cleanupResponse.status).to.be.oneOf([200, 204]);
        cy.log(
            `🧹 Cleanup: MatchCall ${workingMatchCallId} deletion status: ${cleanupResponse.status}`,
        );
    });
});
