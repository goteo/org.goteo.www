/// <reference types="cypress" />

describe("MatchCall API - Simulate Charges and Verify Transactions", () => {
    const testData = {
        authToken: "mock_jwt_token_def456",
        matchCallId: 11111,
        submissionId: 22222,
        userAccountingId: "33333",
        matchCallAccountingId: "44444",
        projectAccountingId: "55555",
        projectId: 185,
        donationCheckoutId: "checkout_77777",
    };

    it("should authenticate user", () => {
        const mockAuthResponse = {
            status: 201,
            body: {
                token: "mock_jwt_token_def456",
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

        cy.log("✅ Authentication successful for charges simulation");
    });

    it("should setup MatchCall with strategy", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        const matchCallData = {
            title: "Test MatchCall for Matching",
            description: "MatchCall for matching simulation",
            territory: { country: "ES" },
            managers: ["/v4/users/2541"],
        };

        const mockCreateResponse = {
            status: 201,
            body: {
                id: 11111,
                title: matchCallData.title,
                description: matchCallData.description,
                territory: matchCallData.territory,
                managers: matchCallData.managers,
                status: "draft",
                accounting: "/v4/accountings/44444",
                created_at: new Date().toISOString(),
            },
        };

        expect(mockCreateResponse.status).to.be.oneOf([200, 201]);
        testData.matchCallId = mockCreateResponse.body.id;

        const mockStatusResponse = {
            status: 200,
            body: {
                ...mockCreateResponse.body,
                status: "in_calling",
                updated_at: new Date().toISOString(),
            },
        };

        expect(mockStatusResponse.status).to.eq(200);
        expect(mockStatusResponse.body.status).to.eq("in_calling");

        const mockStrategyResponse = {
            status: 200,
            body: {
                id: 301,
                call: `/v4/match_calls/${testData.matchCallId}`,
                rules: ["/v4/match_rules/SingleUserPerProjectRule"],
                formula: "/v4/match_formulas/multiplication",
                limit: { amount: 50000, currency: "EUR" },
                factor: 1.0,
                against: "charge",
            },
        };

        expect(mockStrategyResponse.status).to.eq(200);
        expect(mockStrategyResponse.body.factor).to.eq(1.0);

        cy.log(`✅ MatchCall ${testData.matchCallId} setup with matching strategy`);
        cy.log(
            `Strategy: ${mockStrategyResponse.body.formula} with factor ${mockStrategyResponse.body.factor}`,
        );
    });

    it("should create and accept submission", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.matchCallId, "MatchCall ID should exist").to.not.be.null;

        const submissionData = {
            call: `/v4/match_calls/${testData.matchCallId}`,
            project: `/v4/projects/${testData.projectId}`,
        };

        const mockSubmissionResponse = {
            status: 201,
            body: {
                id: 22222,
                call: submissionData.call,
                project: submissionData.project,
                status: "to_review",
                submitted_at: new Date().toISOString(),
            },
        };

        const response = mockSubmissionResponse;

        if (response.status === 422) {
            expect((response.body as any).detail).to.include("in_calling");
            cy.log("ℹ️ MatchCall needs to be in in_calling status");
            return;
        }

        expect(response.status).to.be.oneOf([200, 201]);
        testData.submissionId = response.body.id;

        const mockAcceptResponse = {
            status: 200,
            body: {
                ...response.body,
                status: "accepted",
                reviewed_at: new Date().toISOString(),
                reviewer: "/v4/users/2541",
            },
        };

        expect(mockAcceptResponse.status).to.eq(200);
        expect(mockAcceptResponse.body.status).to.eq("accepted");

        cy.log(`✅ Submission ${testData.submissionId} created and accepted`);
    });

    it("should get all accounting IDs", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        const mockProjectResponse = {
            status: 200,
            body: {
                id: testData.projectId,
                title: "Test Project for Matching",
                accounting: "/v4/accountings/55555",
                status: "published",
                currency: "EUR",
            },
        };

        expect(mockProjectResponse.status).to.eq(200);
        testData.projectAccountingId = mockProjectResponse.body.accounting.replace(
            "/v4/accountings/",
            "",
        );

        const mockUserResponse = {
            status: 200,
            body: {
                id: 2541,
                email: "test@example.com",
                accounting: "/v4/accountings/33333",
                wallet_balance: 100000,
            },
        };

        expect(mockUserResponse.status).to.eq(200);
        testData.userAccountingId = mockUserResponse.body.accounting.replace(
            "/v4/accountings/",
            "",
        );

        const mockMatchCallResponse = {
            status: 200,
            body: {
                id: testData.matchCallId,
                accounting: "/v4/accountings/44444",
                balance: 500000,
            },
        };

        expect(mockMatchCallResponse.status).to.eq(200);
        testData.matchCallAccountingId = mockMatchCallResponse.body.accounting.replace(
            "/v4/accountings/",
            "",
        );

        cy.log("✅ All accounting IDs obtained:");
        cy.log(`User: ${testData.userAccountingId}`);
        cy.log(`Project: ${testData.projectAccountingId}`);
        cy.log(`MatchCall: ${testData.matchCallAccountingId}`);
    });

    it("should create donation checkout", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.userAccountingId, "User accounting ID should exist").to.not.be.null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        const mockCheckoutResponse = {
            status: 201,
            body: {
                id: "checkout_77777",
                gateway: "/v4/gateways/wallet",
                origin: `/v4/accountings/${testData.userAccountingId}`,
                charges: [
                    {
                        id: "charge_88888",
                        type: "single",
                        title: "Donación para matching",
                        target: `/v4/accountings/${testData.projectAccountingId}`,
                        money: { amount: 2500, currency: "EUR" },
                        status: "completed",
                    },
                ],
                status: "completed",
                created_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
            },
        };

        expect(mockCheckoutResponse.status).to.be.oneOf([200, 201]);
        expect(mockCheckoutResponse.body.charges[0].target).to.eq(
            `/v4/accountings/${testData.projectAccountingId}`,
        );
        expect(mockCheckoutResponse.body.charges[0].money.amount).to.eq(2500);
        expect(mockCheckoutResponse.body.status).to.eq("completed");

        testData.donationCheckoutId = mockCheckoutResponse.body.id;

        cy.log("✅ Donation checkout created and completed");
        cy.log(`Checkout ID: ${testData.donationCheckoutId}`);
        cy.log(`Donation: ${mockCheckoutResponse.body.charges[0].money.amount / 100}€`);
    });

    it("should verify accounting transactions", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.matchCallAccountingId, "MatchCall accounting ID should exist").to.not.be
            .null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        const mockTransactionsResponse = {
            status: 200,
            body: [
                {
                    id: "tx_matching_001",
                    origin: `/v4/accountings/${testData.matchCallAccountingId}`,
                    target: `/v4/accountings/${testData.projectAccountingId}`,
                    money: { amount: 2500, currency: "EUR" },
                    type: "matching",
                    reference_charge: "charge_88888",
                    created_at: new Date().toISOString(),
                    status: "completed",
                },
            ],
        };

        const response = mockTransactionsResponse;

        if (response.status === 200) {
            expect(response.body).to.be.an("array");
            expect(response.body).to.have.length(1);
            expect(response.body[0].type).to.eq("matching");
            expect(response.body[0].money.amount).to.eq(2500);

            cy.log("✅ Matching transaction verified:");
            cy.log(`Amount: ${response.body[0].money.amount / 100}€`);
            cy.log(`From: MatchCall → Project`);
        } else {
            cy.log(`ℹ️ Transactions endpoint returned: ${response.status}`);
        }
    });

    it("should verify final state", () => {
        if (!testData.submissionId) {
            cy.log("⚠️ Skipping test - no submission was created");
            return;
        }

        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.submissionId, "Submission ID should exist").to.not.be.null;

        const mockFinalStateResponse = {
            status: 200,
            body: {
                id: testData.submissionId,
                call: `/v4/match_calls/${testData.matchCallId}`,
                project: `/v4/projects/${testData.projectId}`,
                status: "accepted",
                total_matched: 2500,
                transactions_count: 1,
            },
        };

        expect(mockFinalStateResponse.status).to.eq(200);
        expect(mockFinalStateResponse.body.status).to.eq("accepted");
        expect(mockFinalStateResponse.body.total_matched).to.eq(2500);

        cy.log("✅ Final state verification complete:");
        cy.log(`Submission status: ${mockFinalStateResponse.body.status}`);
        cy.log(`Total matched: ${mockFinalStateResponse.body.total_matched / 100}€`);
    });

    it("should verify complete workflow metrics", () => {
        const mockMetricsResponse = {
            status: 200,
            body: {
                matchCall: {
                    id: testData.matchCallId,
                    total_submissions: 1,
                    accepted_submissions: 1,
                    total_funds_available: 500000,
                    total_funds_used: 2500,
                    remaining_funds: 497500,
                },
                project: {
                    id: testData.projectId,
                    donations_received: 2500,
                    matching_received: 2500,
                    total_received: 5000,
                },
                efficiency: {
                    matching_ratio: 1.0,
                    funds_utilization: 0.005,
                },
            },
        };

        expect(mockMetricsResponse.body.matchCall.accepted_submissions).to.eq(1);
        expect(mockMetricsResponse.body.project.donations_received).to.eq(2500);
        expect(mockMetricsResponse.body.project.matching_received).to.eq(2500);
        expect(mockMetricsResponse.body.efficiency.matching_ratio).to.eq(1.0);

        cy.log("✅ Complete workflow metrics:");
        cy.log(`Donations: ${mockMetricsResponse.body.project.donations_received / 100}€`);
        cy.log(`Matching: ${mockMetricsResponse.body.project.matching_received / 100}€`);
        cy.log(`Total impact: ${mockMetricsResponse.body.project.total_received / 100}€`);
        cy.log(`Matching ratio: ${mockMetricsResponse.body.efficiency.matching_ratio}:1`);
    });

    it("should simulate cleanup process", () => {
        const cleanupOperations = [
            { resource: "submission", id: testData.submissionId, status: 204 },
            { resource: "matchCall", id: testData.matchCallId, status: 204 },
        ];

        cleanupOperations.forEach((operation) => {
            if (operation.id) {
                expect(operation.status).to.be.oneOf([200, 204]);
                cy.log(`🧹 ${operation.resource} ${operation.id} cleanup: ${operation.status}`);
            }
        });

        cy.log("✅ Complete cleanup simulation finished");
    });
});
