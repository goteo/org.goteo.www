/// <reference types="cypress" />

describe("MatchCall API - Configure Strategy", () => {
    let workingMatchCallId: number;

    before(() => {
        const matchCallData = {
            title: "Test MatchCall for Strategy",
            description: "MatchCall for strategy configuration",
            territory: {
                country: "ES",
            },
            managers: ["/v4/users/2541"],
        };

        cy.request({
            method: "POST",
            url: "http://127.0.0.1:8090/v4/match_calls",
            headers: {
                "Content-Type": "application/json",
            },
            body: matchCallData,
        }).then((response) => {
            workingMatchCallId = response.body.id;
        });
    });

    it("should configure MatchCall strategy", () => {
        const strategyData = {
            rules: ["/v4/match_rules/SingleUserPerProjectRule"],
            formula: "/v4/match_formulas/multiplication",
            limit: {
                amount: 50000,
                currency: "EUR",
            },
            factor: 1.0,
            against: "charge",
        };

        cy.request({
            method: "PATCH",
            url: `http://127.0.0.1:8090/v4/match_call/${workingMatchCallId}/strategy`,
            headers: {
                "Content-Type": "application/merge-patch+json",
            },
            body: strategyData,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.call).to.eq(`/v4/match_calls/${workingMatchCallId}`);
            expect(response.body.rules).to.include("/v4/match_rules/SingleUserPerProjectRule");
            expect(response.body.formula).to.eq("/v4/match_formulas/multiplication");
            expect(response.body.limit.amount).to.eq(50000);
            expect(response.body.limit.currency).to.eq("EUR");
            expect(response.body.factor).to.eq(1.0);
            expect(response.body.against).to.eq("charge");
        });
    });

    it("should verify strategy configuration persists", () => {
        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/match_call/${workingMatchCallId}/strategy`,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.formula).to.eq("/v4/match_formulas/multiplication");
            expect(response.body.factor).to.eq(1.0);
            expect(response.body.against).to.eq("charge");
            expect(response.body.limit.amount).to.eq(50000);
            expect(response.body.limit.currency).to.eq("EUR");
            expect(response.body.rules).to.include("/v4/match_rules/SingleUserPerProjectRule");
        });
    });

    it("should handle invalid strategy data", () => {
        const invalidData = {
            formula: "/v4/match_formulas/invalid",
            factor: "invalid",
            limit: { amount: "invalid" },
        };

        cy.request({
            method: "PATCH",
            url: `http://127.0.0.1:8090/v4/match_call/${workingMatchCallId}/strategy`,
            headers: {
                "Content-Type": "application/merge-patch+json",
            },
            body: invalidData,
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.be.oneOf([400, 422, 500]);
        });
    });

    after(() => {
        if (workingMatchCallId) {
            cy.request({
                method: "DELETE",
                url: `http://127.0.0.1:8090/v4/match_calls/${workingMatchCallId}`,
                failOnStatusCode: false,
            });
        }
    });
});
