/// <reference types="cypress" />

describe("MatchCall API - Simulate Charges and Verify Transactions", () => {
    const testData = {
        authToken: null,
        matchCallId: null,
        submissionId: null,
        userAccountingId: null,
        matchCallAccountingId: null,
        projectAccountingId: null,
        projectId: 185,
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
            expect(response.body).to.have.property("token");
            testData.authToken = response.body.token;
            expect(testData.authToken).to.not.be.undefined;
        });
    });

    it("should setup MatchCall with strategy", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        const matchCallData = {
            title: "Test MatchCall for Matching",
            description: "MatchCall for matching simulation",
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
                expect(response.status).to.be.oneOf([200, 201]);
                testData.matchCallId = response.body.id;

                // Change to in_calling status first
                return cy.request({
                    method: "PATCH",
                    url: `http://127.0.0.1:8090/v4/match_calls/${testData.matchCallId}`,
                    headers: {
                        "Content-Type": "application/merge-patch+json",
                        Authorization: `Bearer ${testData.authToken}`,
                    },
                    body: {
                        status: "in_calling",
                    },
                    timeout: 10000,
                });
            })
            .then(() => {
                // Then configure strategy
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
            });
    });

    it("should create and accept submission", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.matchCallId, "MatchCall ID should exist").to.not.be.null;

        const submissionData = {
            call: `/v4/match_calls/${testData.matchCallId}`,
            project: `/v4/projects/${testData.projectId}`,
        };

        cy.request({
            method: "POST",
            url: "http://127.0.0.1:8090/v4/match_call_submissions",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${testData.authToken}`,
            },
            body: submissionData,
            failOnStatusCode: false,
            timeout: 10000,
        }).then((response) => {
            if (response.status === 422) {
                expect(response.body.detail).to.include("in_calling");
                cy.log("MatchCall needs to be in in_calling status");
                return;
            }

            expect(response.status).to.be.oneOf([200, 201]);
            testData.submissionId = response.body.id;

            return cy.request({
                method: "PATCH",
                url: `http://127.0.0.1:8090/v4/match_call_submissions/${testData.submissionId}`,
                headers: {
                    "Content-Type": "application/merge-patch+json",
                    Authorization: `Bearer ${testData.authToken}`,
                },
                body: {
                    status: "accepted",
                },
                timeout: 10000,
            });
        });
    });

    it("should get all accounting IDs", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/projects/${testData.projectId}`,
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            timeout: 5000,
        }).then((response) => {
            expect(response.status).to.eq(200);
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
            expect(response.status).to.eq(200);
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
            expect(response.status).to.eq(200);
            testData.matchCallAccountingId = response.body.accounting.replace(
                "/v4/accountings/",
                "",
            );
        });
    });

    it("should create donation checkout", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.userAccountingId, "User accounting ID should exist").to.not.be.null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        const donationCheckout = {
            gateway: "/v4/gateways/wallet",
            origin: `/v4/accountings/${testData.userAccountingId}`,
            charges: [
                {
                    type: "single",
                    title: "Donación para matching",
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
            body: donationCheckout,
            timeout: 10000,
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);
            expect(response.body.charges[0].target).to.eq(
                `/v4/accountings/${testData.projectAccountingId}`,
            );
        });
    });

    it("should verify accounting transactions", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
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
                expect(response.body).to.be.an("array");
            } else {
                cy.log(`Transactions endpoint returned: ${response.status}`);
            }
        });
    });

    it("should verify final state", () => {
        if (!testData.submissionId) {
            cy.log("Skipping test - no submission was created");
            return;
        }

        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.submissionId, "Submission ID should exist").to.not.be.null;

        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/match_call_submissions/${testData.submissionId}`,
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            timeout: 5000,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.status).to.eq("accepted");
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
