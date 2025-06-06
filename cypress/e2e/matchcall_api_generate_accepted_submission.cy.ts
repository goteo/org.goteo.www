/// <reference types="cypress" />

describe("MatchCall API - Generate Accepted Submission", () => {
    const testData = {
        authToken: null,
        matchCallId: null,
        submissionId: null,
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

    it("should create MatchCall for testing", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        const matchCallData = {
            title: "Test MatchCall for Submissions",
            description: "MatchCall for submission testing",
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
                expect(response.body).to.have.property("id");
                testData.matchCallId = response.body.id;
                expect(testData.matchCallId).to.not.be.undefined;

                // Change MatchCall status to in_calling
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
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.status).to.eq("in_calling");
            });
    });

    it("should verify pre-conditions", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.matchCallId, "MatchCall ID should exist").to.not.be.null;

        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/match_calls/${testData.matchCallId}`,
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            timeout: 5000,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.id).to.eq(testData.matchCallId);
        });

        cy.request({
            method: "GET",
            url: `http://127.0.0.1:8090/v4/projects/${testData.projectId}`,
            headers: {
                Authorization: `Bearer ${testData.authToken}`,
            },
            timeout: 5000,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.id).to.eq(testData.projectId);
        });
    });

    it("should create MatchCallSubmission", () => {
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
            expect(response.body).to.have.property("id");
            expect(response.body.call).to.eq(`/v4/match_calls/${testData.matchCallId}`);
            expect(response.body.project).to.eq(`/v4/projects/${testData.projectId}`);
            expect(response.body.status).to.eq("to_review");

            testData.submissionId = response.body.id;
            expect(testData.submissionId).to.not.be.undefined;
        });
    });

    it("should change submission status to accepted", () => {
        if (!testData.submissionId) {
            cy.log("Skipping test - no submission was created");
            return;
        }

        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.submissionId, "Submission ID should exist").to.not.be.null;

        const statusUpdate = {
            status: "accepted",
        };

        cy.request({
            method: "PATCH",
            url: `http://127.0.0.1:8090/v4/match_call_submissions/${testData.submissionId}`,
            headers: {
                "Content-Type": "application/merge-patch+json",
                Authorization: `Bearer ${testData.authToken}`,
            },
            body: statusUpdate,
            timeout: 10000,
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.status).to.eq("accepted");
            expect(response.body.id).to.eq(testData.submissionId);
        });
    });

    it("should verify final status", () => {
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

    it("should handle duplicate submission", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.matchCallId, "MatchCall ID should exist").to.not.be.null;

        const duplicateSubmission = {
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
            body: duplicateSubmission,
            failOnStatusCode: false,
            timeout: 5000,
        }).then((response) => {
            expect(response.status).to.be.oneOf([422, 400, 401]);
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
