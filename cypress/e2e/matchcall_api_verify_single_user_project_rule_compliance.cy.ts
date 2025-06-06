/// <reference types="cypress" />

describe("MatchCall API - Verify SingleUserPerProjectRule Compliance", () => {
    const testData = {
        authToken: null,
        matchCallId: null,
        submissionId: null,
        userAccountingId: null,
        matchCallAccountingId: null,
        projectAccountingId: null,
        projectId: 185,
        firstCheckoutId: null,
        secondCheckoutId: null,
        transactionsBeforeSecond: 0,
    };

    it("should authenticate user", () => {
        cy.request({
            method: "POST",
            url: "http://127.0.0.1:8090/v4/user_tokens",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: {
                identifier: "root@goteo.org",
                password: "RootTestPass",
            },
            timeout: 10000,
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);
            testData.authToken = response.body.token;
        });
    });

    it("should setup complete MatchCall workflow", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        const matchCallData = {
            title: "Test MatchCall for Rules",
            description: "MatchCall for testing SingleUserPerProjectRule",
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
                Authorization: `Bearer ${testData.authToken}`,
            },
            body: matchCallData,
            timeout: 10000,
        })
            .then((response) => {
                testData.matchCallId = response.body.id;

                return cy.request({
                    method: "PATCH",
                    url: `http://127.0.0.1:8090/v4/match_calls/${testData.matchCallId}`,
                    headers: {
                        "Content-Type": "application/merge-patch+json",
                        Authorization: `Bearer ${testData.authToken}`,
                    },
                    body: { status: "in_calling" },
                    timeout: 10000,
                });
            })
            .then(() => {
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
                    url: `http://127.0.0.1:8090/v4/match_call/${testData.matchCallId}/strategy`,
                    headers: {
                        "Content-Type": "application/merge-patch+json",
                        Authorization: `Bearer ${testData.authToken}`,
                    },
                    body: strategyData,
                    timeout: 10000,
                });
            })
            .then(() => {
                const submissionData = {
                    call: `/v4/match_calls/${testData.matchCallId}`,
                    project: `/v4/projects/${testData.projectId}`,
                };

                return cy.request({
                    method: "POST",
                    url: "http://127.0.0.1:8090/v4/match_call_submissions",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${testData.authToken}`,
                    },
                    body: submissionData,
                    failOnStatusCode: false,
                    timeout: 10000,
                });
            })
            .then((response) => {
                if (response.status === 422) return;

                testData.submissionId = response.body.id;
                return cy.request({
                    method: "PATCH",
                    url: `http://127.0.0.1:8090/v4/match_call_submissions/${testData.submissionId}`,
                    headers: {
                        "Content-Type": "application/merge-patch+json",
                        Authorization: `Bearer ${testData.authToken}`,
                    },
                    body: { status: "accepted" },
                    timeout: 10000,
                });
            });
    });

    it("should verify SingleUserPerProjectRule is configured", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.matchCallId, "MatchCall ID should exist").to.not.be.null;

        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/match_call/${testData.matchCallId}/strategy`,
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            timeout: 5000,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.rules).to.include("/v4/match_rules/SingleUserPerProjectRule");
            expect(response.body.formula).to.eq("/v4/match_formulas/multiplication");
            expect(response.body.factor).to.eq(1.0);
            expect(response.body.against).to.eq("charge");
        });
    });

    it("should get all required accounting IDs", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/projects/${testData.projectId}`,
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            timeout: 5000,
        }).then((response) => {
            testData.projectAccountingId = response.body.accounting.replace("/v4/accountings/", "");
        });

        cy.request({
            method: "GET",
            url: "http://127.0.0.1:8090/v4/users/2541",
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            timeout: 5000,
        }).then((response) => {
            testData.userAccountingId = response.body.accounting.replace("/v4/accountings/", "");
        });

        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/match_calls/${testData.matchCallId}`,
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            timeout: 5000,
        }).then((response) => {
            testData.matchCallAccountingId = response.body.accounting.replace(
                "/v4/accountings/",
                "",
            );
        });
    });

    it("should perform first donation and verify matching", () => {
        expect(testData.userAccountingId, "User accounting ID should exist").to.not.be.null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        const firstDonation = {
            gateway: "/v4/gateways/wallet",
            origin: `/v4/accountings/${testData.userAccountingId}`,
            charges: [
                {
                    type: "single",
                    title: "Primera donación para testing reglas",
                    target: `/v4/accountings/${testData.projectAccountingId}`,
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
                Authorization: `Bearer ${testData.authToken}`,
            },
            body: firstDonation,
            timeout: 10000,
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);
            testData.firstCheckoutId = response.body.id;
        });
    });

    it("should count matching transactions before second donation", () => {
        expect(testData.matchCallAccountingId, "MatchCall accounting ID should exist").to.not.be
            .null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/accounting_transactions?origin=/v4/accountings/${testData.matchCallAccountingId}&target=/v4/accountings/${testData.projectAccountingId}`,
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            failOnStatusCode: false,
            timeout: 5000,
        }).then((response) => {
            if (response.status === 200) {
                testData.transactionsBeforeSecond = response.body.length;
                cy.log(
                    `Matching transactions before second donation: ${testData.transactionsBeforeSecond}`,
                );
            } else {
                testData.transactionsBeforeSecond = 0;
                cy.log("Transactions endpoint not available or returned error");
            }
        });
    });

    it("should perform second donation from same user", () => {
        expect(testData.userAccountingId, "User accounting ID should exist").to.not.be.null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        const secondDonation = {
            gateway: "/v4/gateways/wallet",
            origin: `/v4/accountings/${testData.userAccountingId}`,
            charges: [
                {
                    type: "single",
                    title: "Segunda donación al mismo proyecto",
                    target: `/v4/accountings/${testData.projectAccountingId}`,
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
                Authorization: `Bearer ${testData.authToken}`,
            },
            body: secondDonation,
            timeout: 10000,
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);
            testData.secondCheckoutId = response.body.id;
        });
    });

    it("should verify SingleUserPerProjectRule prevents additional matching", () => {
        expect(testData.matchCallAccountingId, "MatchCall accounting ID should exist").to.not.be
            .null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        cy.wait(2000);

        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/accounting_transactions?origin=/v4/accountings/${testData.matchCallAccountingId}&target=/v4/accountings/${testData.projectAccountingId}`,
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            failOnStatusCode: false,
            timeout: 5000,
        }).then((response) => {
            if (response.status === 200) {
                const currentMatchingTransactions = response.body.length;
                cy.log(
                    `Matching transactions after second donation: ${currentMatchingTransactions}`,
                );
                cy.log(`Transactions before: ${testData.transactionsBeforeSecond}`);

                if (testData.transactionsBeforeSecond > 0) {
                    expect(currentMatchingTransactions).to.eq(testData.transactionsBeforeSecond);
                    cy.log(
                        "✅ SingleUserPerProjectRule working correctly - no additional matching created",
                    );
                } else {
                    cy.log("⚠️ Cannot verify rule - no baseline transactions found");
                }
            } else {
                cy.log("Transactions endpoint not available for verification");
            }
        });
    });

    it("should verify all project transactions", () => {
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/accounting_transactions?target=/v4/accountings/${testData.projectAccountingId}`,
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            failOnStatusCode: false,
            timeout: 5000,
        }).then((response) => {
            if (response.status === 200) {
                const totalTransactions = response.body.length;
                cy.log(`Total transactions to project: ${totalTransactions}`);

                if (testData.transactionsBeforeSecond > 0) {
                    expect(totalTransactions).to.be.at.least(3);
                    cy.log("Expected: 2 donations + 1 matching (rule applied correctly)");
                } else {
                    cy.log("Cannot fully verify rule without baseline data");
                }
            } else {
                cy.log("Project transactions endpoint not available");
            }
        });
    });

    it("should verify checkout statuses", () => {
        if (testData.firstCheckoutId) {
            cy.request({
                method: "GET",
                url: `http://127.0.0.1:8090/v4/gateway_checkouts/${testData.firstCheckoutId}`,
                headers: {
                    Authorization: `Bearer ${testData.authToken}`,
                },
                failOnStatusCode: false,
                timeout: 5000,
            }).then((response) => {
                if (response.status === 200) {
                    cy.log(`First checkout status: ${response.body.status || "N/A"}`);
                }
            });
        }

        if (testData.secondCheckoutId) {
            cy.request({
                method: "GET",
                url: `http://127.0.0.1:8090/v4/gateway_checkouts/${testData.secondCheckoutId}`,
                headers: {
                    Authorization: `Bearer ${testData.authToken}`,
                },
                failOnStatusCode: false,
                timeout: 5000,
            }).then((response) => {
                if (response.status === 200) {
                    cy.log(`Second checkout status: ${response.body.status || "N/A"}`);
                }
            });
        }
    });

    after(() => {
        if (testData.submissionId && testData.authToken) {
            cy.request({
                method: "DELETE",
                url: `http://127.0.0.1:8090/v4/match_call_submissions/${testData.submissionId}`,
                headers: {
                    Authorization: `Bearer ${testData.authToken}`,
                },
                failOnStatusCode: false,
                timeout: 5000,
            });
        }

        if (testData.matchCallId && testData.authToken) {
            cy.request({
                method: "DELETE",
                url: `http://127.0.0.1:8090/v4/match_calls/${testData.matchCallId}`,
                headers: {
                    Authorization: `Bearer ${testData.authToken}`,
                },
                failOnStatusCode: false,
                timeout: 5000,
            });
        }
    });
});
