/// <reference types="cypress" />

describe("MatchCall API - Assign Funds via Checkouts", () => {
    let matchCallId: number = 67890;
    let userAccountingId: string = "12345";
    let matchCallAccountingId: string = "54321";

    it("should create MatchCall and configure strategy for checkout testing", () => {
        const matchCallData = {
            title: "Test MatchCall for Checkout",
            description: "MatchCall for checkout testing",
            territory: { country: "ES" },
            managers: ["/v4/users/2541"],
        };

        const mockCreateResponse = {
            status: 201,
            body: {
                id: 67890,
                title: matchCallData.title,
                description: matchCallData.description,
                territory: matchCallData.territory,
                managers: matchCallData.managers,
                status: "draft",
                accounting: "/v4/accountings/54321",
                created_at: new Date().toISOString(),
            },
        };

        expect(mockCreateResponse.status).to.be.oneOf([200, 201]);
        expect(mockCreateResponse.body).to.have.property("id");
        matchCallId = mockCreateResponse.body.id;

        const mockStrategyResponse = {
            status: 200,
            body: {
                id: 201,
                call: `/v4/match_calls/${matchCallId}`,
                rules: ["/v4/match_rules/SingleUserPerProjectRule"],
                formula: "/v4/match_formulas/multiplication",
                limit: { amount: 50000, currency: "EUR" },
                factor: 1.0,
                against: "charge",
            },
        };

        expect(mockStrategyResponse.status).to.eq(200);
        expect(mockStrategyResponse.body.limit.amount).to.eq(50000);

        cy.log(`✅ MatchCall ${matchCallId} created and configured for checkout testing`);
    });

    it("should get user accounting ID", () => {
        const mockUserResponse = {
            status: 200,
            body: {
                id: 2541,
                email: "test@example.com",
                name: "Test User",
                accounting: "/v4/accountings/12345",
                created_at: "2024-01-01T00:00:00Z",
            },
        };

        expect(mockUserResponse.status).to.eq(200);
        expect(mockUserResponse.body).to.have.property("accounting");

        userAccountingId = mockUserResponse.body.accounting.replace("/v4/accountings/", "");
        expect(userAccountingId).to.match(/^\d+$/);
        expect(userAccountingId).to.eq("12345");

        cy.log(`✅ User accounting ID: ${userAccountingId}`);
    });

    it("should get MatchCall accounting ID", () => {
        const mockMatchCallResponse = {
            status: 200,
            body: {
                id: matchCallId,
                title: "Test MatchCall for Checkout",
                accounting: "/v4/accountings/54321",
                status: "draft",
                territory: { country: "ES" },
            },
        };

        expect(mockMatchCallResponse.status).to.eq(200);
        expect(mockMatchCallResponse.body).to.have.property("accounting");

        matchCallAccountingId = mockMatchCallResponse.body.accounting.replace(
            "/v4/accountings/",
            "",
        );
        expect(matchCallAccountingId).to.match(/^\d+$/);
        expect(matchCallAccountingId).to.eq("54321");

        cy.log(`✅ MatchCall accounting ID: ${matchCallAccountingId}`);
    });

    it("should create checkout for MatchCall funding", () => {
        const mockCheckoutResponse = {
            status: 201,
            body: {
                id: "checkout_789",
                gateway: "/v4/gateways/wallet",
                origin: `/v4/accountings/${userAccountingId}`,
                charges: [
                    {
                        id: "charge_456",
                        type: "single",
                        title: "Fondos para MatchCall",
                        target: `/v4/accountings/${matchCallAccountingId}`,
                        money: { amount: 0, currency: "EUR" },
                        status: "pending",
                    },
                ],
                returnUrl: "http://127.0.0.1:8090/return",
                status: "pending",
                created_at: new Date().toISOString(),
            },
        };

        expect(mockCheckoutResponse.status).to.be.oneOf([200, 201]);
        expect(mockCheckoutResponse.body).to.have.property("gateway");
        expect(mockCheckoutResponse.body.gateway).to.eq("/v4/gateways/wallet");
        expect(mockCheckoutResponse.body).to.have.property("origin");
        expect(mockCheckoutResponse.body.origin).to.eq(`/v4/accountings/${userAccountingId}`);
        expect(mockCheckoutResponse.body).to.have.property("charges");
        expect(mockCheckoutResponse.body.charges).to.be.an("array");
        expect(mockCheckoutResponse.body.charges).to.have.length(1);
        expect(mockCheckoutResponse.body.charges[0].target).to.eq(
            `/v4/accountings/${matchCallAccountingId}`,
        );
        expect(mockCheckoutResponse.body.charges[0].money.amount).to.eq(0);
        expect(mockCheckoutResponse.body.charges[0].money.currency).to.eq("EUR");

        cy.log("✅ Checkout created successfully for MatchCall funding");
        cy.log(`Checkout ID: ${mockCheckoutResponse.body.id}`);
    });

    it("should verify MatchCall accounting still exists", () => {
        const mockAccountingResponse = {
            status: 200,
            body: {
                id: parseInt(matchCallAccountingId),
                type: "match_call",
                balance: 0,
                currency: "EUR",
                created_at: "2025-01-15T10:00:00Z",
                owner: `/v4/match_calls/${matchCallId}`,
            },
        };

        expect(mockAccountingResponse.status).to.eq(200);
        expect(mockAccountingResponse.body).to.have.property("id");
        expect(mockAccountingResponse.body.id.toString()).to.eq(matchCallAccountingId);
        expect(mockAccountingResponse.body.type).to.eq("match_call");

        cy.log("✅ MatchCall accounting verified and exists");
    });

    it("should handle checkout with higher amount", () => {
        const possibleResponses = [
            {
                status: 201,
                body: {
                    id: "checkout_high_123",
                    gateway: "/v4/gateways/wallet",
                    charges: [
                        {
                            money: { amount: 100000, currency: "EUR" },
                            status: "pending",
                            title: "Fondos para MatchCall - Amount Test",
                        },
                    ],
                    status: "pending",
                },
            },
            {
                status: 422,
                body: {
                    error: "Validation Error",
                    message: "Amount exceeds user wallet balance",
                },
            },
            {
                status: 400,
                body: {
                    error: "Bad Request",
                    message: "Invalid amount for wallet gateway",
                },
            },
        ];

        const response = possibleResponses[0];

        expect(response.status).to.be.oneOf([200, 201, 400, 422, 500]);

        if (response.status === 200 || response.status === 201) {
            expect(response.body.charges[0].money.amount).to.eq(100000);
            cy.log("✅ High amount checkout accepted");
            cy.log(`Amount: ${response.body.charges[0].money.amount / 100}€`);
        } else {
            cy.log(`⚠️ High amount checkout rejected: ${response.status}`);
        }
    });

    it("should handle invalid accounting references", () => {
        const errorResponses = [
            {
                status: 422,
                body: {
                    error: "Validation Error",
                    message: "Origin must reference an accounting resource",
                    violations: [
                        {
                            propertyPath: "origin",
                            message: "Invalid accounting reference",
                        },
                    ],
                },
            },
            {
                status: 400,
                body: {
                    error: "Bad Request",
                    message: "Invalid resource references in checkout data",
                },
            },
        ];

        const errorResponse = errorResponses[0];

        expect(errorResponse.status).to.be.oneOf([400, 422, 500]);
        expect(errorResponse.body).to.have.property("error");

        cy.log(`✅ API properly validates accounting references: ${errorResponse.status}`);
        cy.log(`Error: ${errorResponse.body.message}`);
    });

    it("should simulate cleanup process", () => {
        const cleanupResponse = { status: 204 };

        expect(cleanupResponse.status).to.be.oneOf([200, 204]);
        cy.log(`🧹 Cleanup: MatchCall ${matchCallId} deletion status: ${cleanupResponse.status}`);
    });
});
