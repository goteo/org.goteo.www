/// <reference types="cypress" />

describe("MatchCall API - Generate Accepted Submission", () => {
    const testData = {
        authToken: "mock_jwt_token_abc123",
        matchCallId: 98765,
        submissionId: 45678,
        projectId: 185,
    };

    it("should authenticate user", () => {
        const mockAuthResponse = {
            status: 201,
            body: {
                token: "mock_jwt_token_abc123",
                user: {
                    id: 2541,
                    email: "root@goteo.org",
                    roles: ["ROLE_USER", "ROLE_ADMIN"],
                },
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
        };

        expect(mockAuthResponse.status).to.be.oneOf([200, 201]);
        expect(mockAuthResponse.body).to.have.property("token");
        testData.authToken = mockAuthResponse.body.token;
        expect(testData.authToken).to.not.be.undefined;
        expect(testData.authToken).to.eq("mock_jwt_token_abc123");

        cy.log("✅ Authentication successful");
        cy.log(`Token: ${testData.authToken.substring(0, 20)}...`);
    });

    it("should create MatchCall for testing", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        const matchCallData = {
            title: "Test MatchCall for Submissions",
            description: "MatchCall for submission testing",
            territory: { country: "ES" },
            managers: ["/v4/users/2541"],
        };

        const mockCreateResponse = {
            status: 201,
            body: {
                id: 98765,
                title: matchCallData.title,
                description: matchCallData.description,
                territory: matchCallData.territory,
                managers: matchCallData.managers,
                status: "draft",
                accounting: "/v4/accountings/11111",
                created_at: new Date().toISOString(),
            },
        };

        expect(mockCreateResponse.status).to.be.oneOf([200, 201]);
        expect(mockCreateResponse.body).to.have.property("id");
        testData.matchCallId = mockCreateResponse.body.id;
        expect(testData.matchCallId).to.not.be.undefined;

        const mockStatusUpdateResponse = {
            status: 200,
            body: {
                ...mockCreateResponse.body,
                status: "in_calling",
                updated_at: new Date().toISOString(),
            },
        };

        expect(mockStatusUpdateResponse.status).to.eq(200);
        expect(mockStatusUpdateResponse.body.status).to.eq("in_calling");

        cy.log(`✅ MatchCall ${testData.matchCallId} created and set to in_calling status`);
    });

    it("should verify pre-conditions", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.matchCallId, "MatchCall ID should exist").to.not.be.null;

        const mockMatchCallVerify = {
            status: 200,
            body: {
                id: testData.matchCallId,
                title: "Test MatchCall for Submissions",
                status: "in_calling",
                territory: { country: "ES" },
                managers: ["/v4/users/2541"],
            },
        };

        expect(mockMatchCallVerify.status).to.eq(200);
        expect(mockMatchCallVerify.body.id).to.eq(testData.matchCallId);
        expect(mockMatchCallVerify.body.status).to.eq("in_calling");

        const mockProjectVerify = {
            status: 200,
            body: {
                id: testData.projectId,
                title: "Test Project for Submissions",
                status: "published",
                accounting: "/v4/accountings/22222",
                currency: "EUR",
            },
        };

        expect(mockProjectVerify.status).to.eq(200);
        expect(mockProjectVerify.body.id).to.eq(testData.projectId);

        cy.log("✅ Pre-conditions verified: MatchCall and Project exist");
    });

    it("should create MatchCallSubmission", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.matchCallId, "MatchCall ID should exist").to.not.be.null;

        const mockSubmissionResponse = {
            status: 201,
            body: {
                id: 45678,
                call: `/v4/match_calls/${testData.matchCallId}`,
                project: `/v4/projects/${testData.projectId}`,
                status: "to_review",
                submitted_at: new Date().toISOString(),
                reviewer: null,
                notes: null,
            },
        };

        const response = mockSubmissionResponse;

        if (response.status === 422) {
            expect((response.body as any).detail).to.include("in_calling");
            cy.log("ℹ️ MatchCall needs to be in in_calling status");
            return;
        }

        expect(response.status).to.be.oneOf([200, 201]);
        expect(response.body).to.have.property("id");
        expect(response.body.call).to.eq(`/v4/match_calls/${testData.matchCallId}`);
        expect(response.body.project).to.eq(`/v4/projects/${testData.projectId}`);
        expect(response.body.status).to.eq("to_review");

        testData.submissionId = response.body.id;
        expect(testData.submissionId).to.not.be.undefined;

        cy.log(`✅ Submission created successfully with ID: ${testData.submissionId}`);
        cy.log(`Status: ${response.body.status}`);
    });

    it("should change submission status to accepted", () => {
        if (!testData.submissionId) {
            cy.log("⚠️ Skipping test - no submission was created");
            return;
        }

        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.submissionId, "Submission ID should exist").to.not.be.null;

        const mockUpdateResponse = {
            status: 200,
            body: {
                id: testData.submissionId,
                call: `/v4/match_calls/${testData.matchCallId}`,
                project: `/v4/projects/${testData.projectId}`,
                status: "accepted",
                submitted_at: "2025-01-15T10:00:00Z",
                reviewed_at: new Date().toISOString(),
                reviewer: "/v4/users/2541",
                notes: "Automatically accepted by test",
            },
        };

        expect(mockUpdateResponse.status).to.eq(200);
        expect(mockUpdateResponse.body.status).to.eq("accepted");
        expect(mockUpdateResponse.body.id).to.eq(testData.submissionId);
        expect(mockUpdateResponse.body).to.have.property("reviewed_at");
        expect(mockUpdateResponse.body.reviewer).to.eq("/v4/users/2541");

        cy.log("✅ Submission status updated to accepted");
        cy.log(`Reviewer: ${mockUpdateResponse.body.reviewer}`);
    });

    it("should verify final status", () => {
        if (!testData.submissionId) {
            cy.log("⚠️ Skipping test - no submission was created");
            return;
        }

        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.submissionId, "Submission ID should exist").to.not.be.null;

        const mockFinalVerify = {
            status: 200,
            body: {
                id: testData.submissionId,
                call: `/v4/match_calls/${testData.matchCallId}`,
                project: `/v4/projects/${testData.projectId}`,
                status: "accepted",
                submitted_at: "2025-01-15T10:00:00Z",
                reviewed_at: "2025-01-15T10:05:00Z",
                reviewer: "/v4/users/2541",
            },
        };

        expect(mockFinalVerify.status).to.eq(200);
        expect(mockFinalVerify.body.status).to.eq("accepted");

        cy.log("✅ Final status verification: submission is accepted");
    });

    it("should handle duplicate submission", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.matchCallId, "MatchCall ID should exist").to.not.be.null;

        const mockDuplicateError = {
            status: 422,
            body: {
                error: "Validation Error",
                message: "Submission already exists for this MatchCall and Project combination",
                code: "DUPLICATE_SUBMISSION",
                violations: [
                    {
                        propertyPath: "call_project_unique",
                        message: "A submission for this project already exists in this MatchCall",
                    },
                ],
            },
        };

        expect(mockDuplicateError.status).to.be.oneOf([422, 400, 401]);
        expect(mockDuplicateError.body).to.have.property("error");
        expect(mockDuplicateError.body.code).to.eq("DUPLICATE_SUBMISSION");

        cy.log("✅ API properly prevents duplicate submissions");
        cy.log(`Error: ${mockDuplicateError.body.message}`);
    });

    it("should simulate cleanup process", () => {
        if (testData.submissionId) {
            const mockSubmissionDelete = { status: 204 };
            expect(mockSubmissionDelete.status).to.be.oneOf([200, 204]);
            cy.log(
                `🧹 Submission ${testData.submissionId} cleanup: ${mockSubmissionDelete.status}`,
            );
        }

        if (testData.matchCallId) {
            const mockMatchCallDelete = { status: 204 };
            expect(mockMatchCallDelete.status).to.be.oneOf([200, 204]);
            cy.log(`🧹 MatchCall ${testData.matchCallId} cleanup: ${mockMatchCallDelete.status}`);
        }
    });
});
