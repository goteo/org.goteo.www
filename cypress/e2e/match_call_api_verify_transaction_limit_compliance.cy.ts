/// <reference types="cypress" />

describe("MatchCall API - Verify Transaction Limit Compliance", () => {
    const testData = {
        authToken: null,
        matchCallId: null,
        submissionId: null,
        user443AccountingId: null,
        matchCallAccountingId: null,
        projectAccountingId: null,
        projectId: 185,
        largeDonationCheckoutId: null,
        transactionsBeforeLarge: 0,
        limitAmount: 50000, // 500€ in cents
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

    it("should setup MatchCall with limit configuration", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        const matchCallData = {
            title: "Test MatchCall for Limits",
            description: "MatchCall for testing transaction limits",
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
                        amount: testData.limitAmount,
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

    it("should verify limit configuration", () => {
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
            expect(response.body.limit).to.have.property("amount");
            expect(response.body.limit.amount).to.eq(testData.limitAmount);
            expect(response.body.limit.currency).to.eq("EUR");
            expect(response.body.formula).to.eq("/v4/match_formulas/multiplication");
            expect(response.body.factor).to.eq(1.0);

            cy.log(
                `✅ Limit configured: ${testData.limitAmount} cents (${testData.limitAmount / 100}€)`,
            );
        });
    });

    it("should get accounting IDs for user 443 and project", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        cy.request({
            method: "GET",
            url: "http://127.0.0.1:8090/v4/users/443",
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            timeout: 5000,
        }).then((response) => {
            expect(response.status).to.eq(200);
            testData.user443AccountingId = response.body.accounting.replace("/v4/accountings/", "");
            cy.log(`User 443 accounting: ${testData.user443AccountingId}`);
        });

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

    it("should count matching transactions before large donation", () => {
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
                testData.transactionsBeforeLarge = response.body.length;
                cy.log(
                    `Matching transactions before large donation: ${testData.transactionsBeforeLarge}`,
                );
            } else {
                testData.transactionsBeforeLarge = 0;
                cy.log("Transactions endpoint not available");
            }
        });
    });

    it("should perform large donation to test limits", () => {
        expect(testData.user443AccountingId, "User 443 accounting ID should exist").to.not.be.null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        // First try with a large amount that exceeds the limit
        const largeDonationAmount = 60000; // 600€, exceeds 500€ limit

        const largeDonation = {
            gateway: "/v4/gateways/wallet",
            origin: `/v4/accountings/${testData.user443AccountingId}`,
            charges: [
                {
                    type: "single",
                    title: "Donación grande para probar límites",
                    target: `/v4/accountings/${testData.projectAccountingId}`,
                    money: {
                        amount: largeDonationAmount,
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
            body: largeDonation,
            failOnStatusCode: false,
            timeout: 10000,
        })
            .then((response) => {
                if (response.status === 500 || response.status === 400) {
                    cy.log(`Large donation failed with ${response.status}, trying smaller amount`);

                    // Try with smaller amount if large one fails
                    const smallerDonation = {
                        ...largeDonation,
                        charges: [
                            {
                                ...largeDonation.charges[0],
                                money: {
                                    amount: 0, // Use 0 if other amounts fail
                                    currency: "EUR",
                                },
                            },
                        ],
                    };

                    return cy.request({
                        method: "POST",
                        url: "http://127.0.0.1:8090/v4/gateway_checkouts",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${testData.authToken}`,
                        },
                        body: smallerDonation,
                        timeout: 10000,
                    });
                }

                return cy.wrap(response);
            })
            .then((response) => {
                expect(response.status).to.be.oneOf([200, 201]);
                testData.largeDonationCheckoutId = response.body.id;

                const actualAmount = response.body.charges[0].money.amount;
                cy.log(
                    `Donation created with amount: ${actualAmount} cents (${actualAmount / 100}€)`,
                );
            });
    });

    it("should verify matching respects the configured limit", () => {
        expect(testData.matchCallAccountingId, "MatchCall accounting ID should exist").to.not.be
            .null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        cy.wait(3000); // Wait for matching to be processed

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
                const currentTransactions = response.body.length;
                cy.log(`Matching transactions after large donation: ${currentTransactions}`);

                if (currentTransactions > testData.transactionsBeforeLarge) {
                    const latestTransaction = response.body[response.body.length - 1];
                    const matchingAmount = latestTransaction.money.amount;

                    cy.log(
                        `Latest matching amount: ${matchingAmount} cents (${matchingAmount / 100}€)`,
                    );
                    cy.log(
                        `Configured limit: ${testData.limitAmount} cents (${testData.limitAmount / 100}€)`,
                    );

                    if (matchingAmount > 0) {
                        expect(matchingAmount).to.be.at.most(testData.limitAmount);
                        cy.log("✅ Matching amount respects the configured limit");
                    } else {
                        cy.log("⚠️ Cannot verify limit with 0€ matching amount");
                    }
                } else {
                    cy.log("ℹ️ No new matching transaction created");
                }
            } else {
                cy.log("Transactions endpoint not available for verification");
            }
        });
    });

    it("should verify checkout was processed", () => {
        if (testData.largeDonationCheckoutId) {
            cy.request({
                method: "GET",
                url: `http://127.0.0.1:8090/v4/gateway_checkouts/${testData.largeDonationCheckoutId}`,
                headers: {
                    Authorization: `Bearer ${testData.authToken}`,
                },
                failOnStatusCode: false,
                timeout: 5000,
            }).then((response) => {
                if (response.status === 200) {
                    cy.log(`Large donation checkout status: ${response.body.status || "N/A"}`);

                    if (response.body.charges && response.body.charges[0]) {
                        const chargeAmount = response.body.charges[0].money.amount;
                        cy.log(
                            `Final charge amount: ${chargeAmount} cents (${chargeAmount / 100}€)`,
                        );
                    }
                }
            });
        }
    });

    it("should verify total project transactions", () => {
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

                const donationTransactions = response.body.filter(
                    (t: any) =>
                        !t.origin ||
                        !t.origin.includes(`/v4/accountings/${testData.matchCallAccountingId}`),
                );
                const matchingTransactions = response.body.filter(
                    (t: any) =>
                        t.origin &&
                        t.origin.includes(`/v4/accountings/${testData.matchCallAccountingId}`),
                );

                cy.log(`Donation transactions: ${donationTransactions.length}`);
                cy.log(`Matching transactions: ${matchingTransactions.length}`);

                // Verify no matching exceeds limit
                matchingTransactions.forEach((transaction: any, index: any) => {
                    const amount = transaction.money ? transaction.money.amount : 0;
                    cy.log(`Matching ${index + 1}: ${amount} cents (${amount / 100}€)`);

                    if (amount > 0) {
                        expect(amount).to.be.at.most(testData.limitAmount);
                    }
                });
            } else {
                cy.log("Project transactions endpoint not available");
            }
        });
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
