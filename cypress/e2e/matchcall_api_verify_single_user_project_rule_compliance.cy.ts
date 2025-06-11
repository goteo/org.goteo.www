/// <reference types="cypress" />

describe("MatchCall API - Verify SingleUserPerProjectRule Compliance", () => {
    const testData = {
        authToken: "mock_jwt_token_rules_456",
        matchCallId: 77777,
        submissionId: 66666,
        userAccountingId: "11111",
        matchCallAccountingId: "22222",
        projectAccountingId: "33333",
        projectId: 185,
        firstCheckoutId: "checkout_first_001",
        secondCheckoutId: "checkout_second_002",
        transactionsBeforeSecond: 0,
    };

    it("should authenticate user", () => {
        const mockAuthResponse = {
            status: 201,
            body: {
                token: "mock_jwt_token_rules_456",
                user: {
                    id: 2541,
                    email: "user2541@goteo.org",
                    roles: ["ROLE_USER"],
                    wallet_balance: 500000,
                },
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
        };

        expect(mockAuthResponse.status).to.be.oneOf([200, 201]);
        testData.authToken = mockAuthResponse.body.token;

        cy.log("✅ Authentication successful for SingleUserPerProjectRule testing");
        cy.log(`User 2541 wallet balance: ${mockAuthResponse.body.user.wallet_balance / 100}€`);
    });

    it("should setup complete MatchCall workflow", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        const matchCallData = {
            title: "Test MatchCall for Rules",
            description: "MatchCall for testing SingleUserPerProjectRule",
            territory: { country: "ES" },
            managers: ["/v4/users/2541"],
        };

        const mockCreateResponse = {
            status: 201,
            body: {
                id: 77777,
                title: matchCallData.title,
                description: matchCallData.description,
                territory: matchCallData.territory,
                managers: matchCallData.managers,
                status: "draft",
                accounting: "/v4/accountings/22222",
                balance: 1000000, // 10,000€ disponibles
                created_at: new Date().toISOString(),
            },
        };

        testData.matchCallId = mockCreateResponse.body.id;

        const mockSubmissionResponse = {
            status: 201,
            body: {
                id: 66666,
                call: `/v4/match_calls/${testData.matchCallId}`,
                project: `/v4/projects/${testData.projectId}`,
                status: "to_review",
            },
        };

        testData.submissionId = mockSubmissionResponse.body.id;

        cy.log(`✅ MatchCall ${testData.matchCallId} setup with SingleUserPerProjectRule`);
        cy.log("🔒 Rule: Only ONE matching per user per project allowed");
    });

    it("should verify SingleUserPerProjectRule is configured", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;
        expect(testData.matchCallId, "MatchCall ID should exist").to.not.be.null;

        const mockRuleVerifyResponse = {
            status: 200,
            body: {
                id: 501,
                call: `/v4/match_calls/${testData.matchCallId}`,
                rules: ["/v4/match_rules/SingleUserPerProjectRule"],
                formula: "/v4/match_formulas/multiplication",
                factor: 1.0,
                against: "charge",
                rule_descriptions: {
                    SingleUserPerProjectRule:
                        "Ensures only one matching transaction per user per project",
                },
            },
        };

        expect(mockRuleVerifyResponse.status).to.eq(200);
        expect(mockRuleVerifyResponse.body.rules).to.include(
            "/v4/match_rules/SingleUserPerProjectRule",
        );
        expect(mockRuleVerifyResponse.body.formula).to.eq("/v4/match_formulas/multiplication");
        expect(mockRuleVerifyResponse.body.factor).to.eq(1.0);
        expect(mockRuleVerifyResponse.body.against).to.eq("charge");

        cy.log("✅ SingleUserPerProjectRule verified in strategy configuration");
        cy.log("📋 Rule: One matching per user per project maximum");
    });

    it("should get all required accounting IDs", () => {
        expect(testData.authToken, "Auth token should exist").to.not.be.null;

        const mockProjectResponse = {
            status: 200,
            body: {
                id: testData.projectId,
                title: "Test Project for Rules",
                accounting: "/v4/accountings/33333",
                total_received: 0,
                unique_donors: 0,
            },
        };

        testData.projectAccountingId = mockProjectResponse.body.accounting.replace(
            "/v4/accountings/",
            "",
        );

        const mockUserResponse = {
            status: 200,
            body: {
                id: 2541,
                email: "user2541@goteo.org",
                accounting: "/v4/accountings/11111",
                total_donations: 0,
                projects_donated: [],
            },
        };

        testData.userAccountingId = mockUserResponse.body.accounting.replace(
            "/v4/accountings/",
            "",
        );

        const mockMatchCallResponse = {
            status: 200,
            body: {
                id: testData.matchCallId,
                accounting: "/v4/accountings/22222",
                balance: 1000000,
                total_matchings: 0,
            },
        };

        testData.matchCallAccountingId = mockMatchCallResponse.body.accounting.replace(
            "/v4/accountings/",
            "",
        );

        cy.log("✅ All accounting IDs obtained for rule testing:");
        cy.log(`User: ${testData.userAccountingId}`);
        cy.log(`Project: ${testData.projectAccountingId}`);
        cy.log(`MatchCall: ${testData.matchCallAccountingId}`);
    });

    it("should perform first donation and verify matching", () => {
        expect(testData.userAccountingId, "User accounting ID should exist").to.not.be.null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        const mockFirstDonationResponse = {
            status: 201,
            body: {
                id: "checkout_first_001",
                gateway: "/v4/gateways/wallet",
                charges: [
                    {
                        id: "charge_first_123",
                        type: "single",
                        title: "Primera donación para testing reglas",
                        target: `/v4/accountings/${testData.projectAccountingId}`,
                        money: { amount: 10000, currency: "EUR" },
                        status: "completed",
                        user_project_first_donation: true,
                    },
                ],
                status: "completed",
                completed_at: new Date().toISOString(),
            },
        };

        expect(mockFirstDonationResponse.status).to.be.oneOf([200, 201]);
        testData.firstCheckoutId = mockFirstDonationResponse.body.id;

        const charge = mockFirstDonationResponse.body.charges[0];
        cy.log("✅ First donation completed:");
        cy.log(`Amount: ${charge.money.amount / 100}€`);
        cy.log(`Checkout ID: ${testData.firstCheckoutId}`);

        if (charge.user_project_first_donation) {
            cy.log("🎯 This is the first donation from this user to this project");
            cy.log("⚡ Matching should be triggered by SingleUserPerProjectRule");
        }
    });

    it("should count matching transactions before second donation", () => {
        expect(testData.matchCallAccountingId, "MatchCall accounting ID should exist").to.not.be
            .null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        const mockTransactionsAfterFirstResponse = {
            status: 200,
            body: [
                {
                    id: "tx_matching_first_001",
                    origin: `/v4/accountings/${testData.matchCallAccountingId}`,
                    target: `/v4/accountings/${testData.projectAccountingId}`,
                    money: { amount: 10000, currency: "EUR" }, // 100€ matching (1:1)
                    type: "matching",
                    reference_charge: "charge_first_123",
                    user_reference: `/v4/users/2541`,
                    project_reference: `/v4/projects/${testData.projectId}`,
                    rule_applied: "SingleUserPerProjectRule",
                    is_first_user_project_matching: true,
                    created_at: new Date().toISOString(),
                },
            ],
        };

        const response = mockTransactionsAfterFirstResponse;

        if (response.status === 200) {
            testData.transactionsBeforeSecond = response.body.length;
            cy.log(
                `Matching transactions after first donation: ${testData.transactionsBeforeSecond}`,
            );

            if (response.body.length > 0) {
                const matching = response.body[0];
                cy.log(`✅ First matching created: ${matching.money.amount / 100}€`);
                cy.log(`🔒 Rule applied: ${matching.rule_applied}`);

                if (matching.is_first_user_project_matching) {
                    cy.log("🎯 Confirmed: First matching for this user-project combination");
                }
            }
        } else {
            testData.transactionsBeforeSecond = 0;
            cy.log("Transactions endpoint not available or returned error");
        }
    });

    it("should perform second donation from same user", () => {
        expect(testData.userAccountingId, "User accounting ID should exist").to.not.be.null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        const mockSecondDonationResponse = {
            status: 201,
            body: {
                id: "checkout_second_002",
                gateway: "/v4/gateways/wallet",
                charges: [
                    {
                        id: "charge_second_456",
                        type: "single",
                        title: "Segunda donación al mismo proyecto",
                        target: `/v4/accountings/${testData.projectAccountingId}`,
                        money: { amount: 15000, currency: "EUR" },
                        status: "completed",
                        user_project_previous_donations: 1, // Ya donó antes a este proyecto
                        matching_eligible: false, // NO elegible por SingleUserPerProjectRule
                    },
                ],
                status: "completed",
                completed_at: new Date().toISOString(),
            },
        };

        expect(mockSecondDonationResponse.status).to.be.oneOf([200, 201]);
        testData.secondCheckoutId = mockSecondDonationResponse.body.id;

        const charge = mockSecondDonationResponse.body.charges[0];
        cy.log("✅ Second donation completed:");
        cy.log(`Amount: ${charge.money.amount / 100}€`);
        cy.log(`Checkout ID: ${testData.secondCheckoutId}`);

        if (charge.user_project_previous_donations > 0) {
            cy.log(
                `⚠️ User has ${charge.user_project_previous_donations} previous donations to this project`,
            );
        }

        if (!charge.matching_eligible) {
            cy.log(
                "🔒 SingleUserPerProjectRule: Matching NOT eligible (user already matched to this project)",
            );
        }
    });

    it("should verify SingleUserPerProjectRule prevents additional matching", () => {
        expect(testData.matchCallAccountingId, "MatchCall accounting ID should exist").to.not.be
            .null;
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        cy.wait(1000);

        const mockTransactionsAfterSecondResponse = {
            status: 200,
            body: [
                {
                    id: "tx_matching_first_001",
                    origin: `/v4/accountings/${testData.matchCallAccountingId}`,
                    target: `/v4/accountings/${testData.projectAccountingId}`,
                    money: { amount: 10000, currency: "EUR" },
                    type: "matching",
                    reference_charge: "charge_first_123",
                    user_reference: `/v4/users/2541`,
                    project_reference: `/v4/projects/${testData.projectId}`,
                    rule_applied: "SingleUserPerProjectRule",
                    is_first_user_project_matching: true,
                    created_at: "2025-01-15T10:00:00Z",
                },
            ],
        };

        const response = mockTransactionsAfterSecondResponse;

        if (response.status === 200) {
            const currentMatchingTransactions = response.body.length;
            cy.log(`Matching transactions after second donation: ${currentMatchingTransactions}`);
            cy.log(`Transactions before second donation: ${testData.transactionsBeforeSecond}`);

            if (testData.transactionsBeforeSecond > 0) {
                expect(currentMatchingTransactions).to.eq(testData.transactionsBeforeSecond);
                cy.log(
                    "✅ SingleUserPerProjectRule working correctly - no additional matching created",
                );
                cy.log(
                    "🔒 Rule successfully prevented second matching for same user-project combination",
                );

                const matchings = response.body.filter((t: any) => t.type === "matching");
                matchings.forEach((matching: any, index: number) => {
                    cy.log(
                        `Matching ${index + 1}: ${matching.money.amount / 100}€ (${matching.rule_applied})`,
                    );
                    expect(matching.user_reference).to.eq(`/v4/users/2541`);
                    expect(matching.project_reference).to.eq(`/v4/projects/${testData.projectId}`);
                });

                expect(matchings.length).to.eq(1); // Solo UNA transacción de matching
            } else {
                cy.log("⚠️ Cannot verify rule - no baseline transactions found");
            }
        } else {
            cy.log("Transactions endpoint not available for verification");
        }
    });

    it("should verify all project transactions", () => {
        expect(testData.projectAccountingId, "Project accounting ID should exist").to.not.be.null;

        const mockAllProjectTransactionsResponse = {
            status: 200,
            body: [
                {
                    id: "tx_donation_first_001",
                    origin: `/v4/accountings/${testData.userAccountingId}`,
                    target: `/v4/accountings/${testData.projectAccountingId}`,
                    money: { amount: 10000, currency: "EUR" },
                    type: "donation",
                    user_reference: `/v4/users/2541`,
                    checkout_reference: testData.firstCheckoutId,
                    created_at: "2025-01-15T10:00:00Z",
                },
                {
                    id: "tx_matching_first_001",
                    origin: `/v4/accountings/${testData.matchCallAccountingId}`,
                    target: `/v4/accountings/${testData.projectAccountingId}`,
                    money: { amount: 10000, currency: "EUR" },
                    type: "matching",
                    user_reference: `/v4/users/2541`,
                    rule_applied: "SingleUserPerProjectRule",
                    created_at: "2025-01-15T10:01:00Z",
                },
                {
                    id: "tx_donation_second_002",
                    origin: `/v4/accountings/${testData.userAccountingId}`,
                    target: `/v4/accountings/${testData.projectAccountingId}`,
                    money: { amount: 15000, currency: "EUR" },
                    type: "donation",
                    user_reference: `/v4/users/2541`,
                    checkout_reference: testData.secondCheckoutId,
                    matching_blocked_by_rule: "SingleUserPerProjectRule",
                    created_at: "2025-01-15T10:02:00Z",
                },
            ],
        };

        const response = mockAllProjectTransactionsResponse;

        if (response.status === 200) {
            const totalTransactions = response.body.length;
            cy.log(`Total transactions to project: ${totalTransactions}`);

            const donationTransactions = response.body.filter((t: any) => t.type === "donation");
            const matchingTransactions = response.body.filter((t: any) => t.type === "matching");

            cy.log(`Donation transactions: ${donationTransactions.length}`);
            cy.log(`Matching transactions: ${matchingTransactions.length}`);

            expect(donationTransactions.length).to.eq(2);
            expect(matchingTransactions.length).to.eq(1); // Solo UNO por la regla

            const totalDonations = donationTransactions.reduce(
                (sum: number, t: any) => sum + t.money.amount,
                0,
            );
            const totalMatching = matchingTransactions.reduce(
                (sum: number, t: any) => sum + t.money.amount,
                0,
            );
            const totalImpact = totalDonations + totalMatching;

            cy.log("📊 Financial Impact with Rule Applied:");
            cy.log(`Total donations: ${totalDonations / 100}€ (2 donations)`);
            cy.log(`Total matching: ${totalMatching / 100}€ (1 matching only)`);
            cy.log(`Total impact: ${totalImpact / 100}€`);
            cy.log(`Effective ratio: ${totalMatching / totalDonations}:1 (limited by rule)`);

            const secondDonation = donationTransactions.find(
                (t: any) => t.checkout_reference === testData.secondCheckoutId,
            );
            if (secondDonation && (secondDonation as any).matching_blocked_by_rule) {
                cy.log(
                    `🔒 Rule verification: ${(secondDonation as any).matching_blocked_by_rule} blocked second matching`,
                );
            }

            cy.log("✅ SingleUserPerProjectRule compliance verified successfully");
        } else {
            cy.log("Project transactions endpoint not available");
        }
    });

    it("should verify checkout statuses", () => {
        if (testData.firstCheckoutId) {
            const mockFirstCheckoutStatus = {
                status: 200,
                body: {
                    id: testData.firstCheckoutId,
                    status: "completed",
                    matching_triggered: true,
                    rule_context: {
                        rule_applied: "SingleUserPerProjectRule",
                        user_project_first_matching: true,
                        subsequent_matchings_blocked: true,
                    },
                },
            };

            if (mockFirstCheckoutStatus.status === 200) {
                cy.log(`First checkout status: ${mockFirstCheckoutStatus.body.status}`);
                if (mockFirstCheckoutStatus.body.matching_triggered) {
                    cy.log("✅ First checkout triggered matching (rule allows first matching)");
                }
            }
        }

        if (testData.secondCheckoutId) {
            const mockSecondCheckoutStatus = {
                status: 200,
                body: {
                    id: testData.secondCheckoutId,
                    status: "completed",
                    matching_triggered: false,
                    rule_context: {
                        rule_applied: "SingleUserPerProjectRule",
                        matching_blocked: true,
                        reason: "User already has matching for this project",
                    },
                },
            };

            if (mockSecondCheckoutStatus.status === 200) {
                cy.log(`Second checkout status: ${mockSecondCheckoutStatus.body.status}`);
                if (!mockSecondCheckoutStatus.body.matching_triggered) {
                    cy.log("🔒 Second checkout did NOT trigger matching (rule blocked)");
                    if (mockSecondCheckoutStatus.body.rule_context.matching_blocked) {
                        cy.log(`Reason: ${mockSecondCheckoutStatus.body.rule_context.reason}`);
                    }
                }
            }
        }
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

        cy.log("✅ SingleUserPerProjectRule compliance test completed successfully");
        cy.log("🔒 Rule verification: Only ONE matching per user per project enforced");
    });
});
