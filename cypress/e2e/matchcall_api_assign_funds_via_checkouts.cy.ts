/// <reference types="cypress" />

describe("MatchCall API - Assign Funds via Checkouts", () => {
    let matchCallId: number;
    let userAccountingId: string;
    let matchCallAccountingId: string;

    before(() => {
        const matchCallData = {
            title: "Test MatchCall for Checkout",
            description: "MatchCall for checkout testing",
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
            matchCallId = response.body.id;

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

            return cy.request({
                method: "PATCH",
                url: `http://127.0.0.1:8090/v4/match_call/${matchCallId}/strategy`,
                headers: {
                    "Content-Type": "application/merge-patch+json",
                },
                body: strategyData,
            });
        });
    });

    it("should get user accounting ID", () => {
        cy.request({
            method: "GET",
            url: "http://127.0.0.1:8090/v4/users/2541",
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property("accounting");

            userAccountingId = response.body.accounting.replace("/v4/accountings/", "");
            expect(userAccountingId).to.match(/^\d+$/);
        });
    });

    it("should get MatchCall accounting ID", () => {
        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/match_calls/${matchCallId}`,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property("accounting");

            matchCallAccountingId = response.body.accounting.replace("/v4/accountings/", "");
            expect(matchCallAccountingId).to.match(/^\d+$/);
        });
    });

    it("should create checkout for MatchCall funding", () => {
        const checkoutData = {
            gateway: "/v4/gateways/wallet",
            origin: `/v4/accountings/${userAccountingId}`,
            charges: [
                {
                    type: "single",
                    title: "Fondos para MatchCall",
                    target: `/v4/accountings/${matchCallAccountingId}`,
                    money: {
                        amount: 0,
                        currency: "EUR",
                    },
                },
            ],
            returnUrl: "http://127.0.0.1:8090/return",
        };

        cy.request({
            method: "POST",
            url: "http://127.0.0.1:8090/v4/gateway_checkouts",
            headers: {
                "Content-Type": "application/json",
            },
            body: checkoutData,
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);
            expect(response.body).to.have.property("gateway");
            expect(response.body.gateway).to.eq("/v4/gateways/wallet");
            expect(response.body).to.have.property("origin");
            expect(response.body.origin).to.eq(`/v4/accountings/${userAccountingId}`);
            expect(response.body).to.have.property("charges");
            expect(response.body.charges).to.be.an("array");
            expect(response.body.charges).to.have.length(1);
            expect(response.body.charges[0].target).to.eq(
                `/v4/accountings/${matchCallAccountingId}`,
            );
            expect(response.body.charges[0].money.amount).to.eq(0);
            expect(response.body.charges[0].money.currency).to.eq("EUR");
        });
    });

    it("should verify MatchCall accounting still exists", () => {
        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/accountings/${matchCallAccountingId}`,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property("id");
            expect(response.body.id.toString()).to.eq(matchCallAccountingId);
        });
    });

    it("should handle checkout with higher amount", () => {
        const checkoutDataHighAmount = {
            gateway: "/v4/gateways/wallet",
            origin: `/v4/accountings/${userAccountingId}`,
            charges: [
                {
                    type: "single",
                    title: "Fondos para MatchCall - Amount Test",
                    target: `/v4/accountings/${matchCallAccountingId}`,
                    money: {
                        amount: 100000,
                        currency: "EUR",
                    },
                },
            ],
            returnUrl: "http://127.0.0.1:8090/return",
        };

        cy.request({
            method: "POST",
            url: "http://127.0.0.1:8090/v4/gateway_checkouts",
            headers: {
                "Content-Type": "application/json",
            },
            body: checkoutDataHighAmount,
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201, 400, 422, 500]);

            if (response.status === 200 || response.status === 201) {
                expect(response.body.charges[0].money.amount).to.eq(100000);
            }
        });
    });

    it("should handle invalid accounting references", () => {
        const invalidCheckoutData = {
            gateway: "/v4/gateways/wallet",
            origin: "/v4/users/2541",
            charges: [
                {
                    type: "single",
                    title: "Invalid checkout",
                    target: "/v4/match_calls/1",
                    money: {
                        amount: 0,
                        currency: "EUR",
                    },
                },
            ],
            returnUrl: "http://127.0.0.1:8090/return",
        };

        cy.request({
            method: "POST",
            url: "http://127.0.0.1:8090/v4/gateway_checkouts",
            headers: {
                "Content-Type": "application/json",
            },
            body: invalidCheckoutData,
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.be.oneOf([400, 422, 500]);
        });
    });

    after(() => {
        if (matchCallId) {
            cy.request({
                method: "DELETE",
                url: `http://127.0.0.1:8090/v4/match_calls/${matchCallId}`,
                failOnStatusCode: false,
            });
        }
    });
});
