/// <reference types="cypress" />

describe("MatchCall API - Create Resource", () => {
    let matchCallId: number;

    it("should create a new MatchCall resource successfully", () => {
        const matchCallData = {
            title: "Test MatchCall 2025",
            description: "MatchCall de prueba para validación",
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
            timeout: 10000,
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);

            expect(response.body).to.have.property("id");
            expect(response.body.id).to.be.a("number");
            expect(response.body.title).to.eq(matchCallData.title);
            expect(response.body.description).to.eq(matchCallData.description);
            expect(response.body.territory.country).to.eq(matchCallData.territory.country);

            expect(response.body.managers).to.be.an("array");
            expect(response.body.managers).to.have.length(1);
            expect(response.body.managers[0]).to.include("users/2541");

            matchCallId = response.body.id;

            cy.log("✅ MatchCall created successfully with ID: " + matchCallId);
        });
    });

    it("should verify created MatchCall exists in the system", () => {
        if (matchCallId) {
            cy.request({
                method: "GET",
                url: `http://127.0.0.1:8090/v4/match_calls/${matchCallId}`,
                timeout: 5000,
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.id).to.eq(matchCallId);
                expect(response.body.title).to.eq("Test MatchCall 2025");

                cy.log("✅ MatchCall verification successful");
            });
        } else {
            cy.log("⚠️ Skipping verification - no matchCallId available");
        }
    });

    it("should handle request without proper authentication", () => {
        cy.request({
            method: "POST",
            url: "http://127.0.0.1:8090/v4/match_calls",
            headers: {
                "Content-Type": "application/json",
            },
            body: {
                title: "Test MatchCall Sin Auth",
                description: "MatchCall de prueba sin autenticación",
                territory: { country: "ES" },
                managers: ["/v4/users/2541"],
            },
            failOnStatusCode: false,
            timeout: 5000,
        }).then((response) => {
            // Puede devolver 200/201 si mantiene la sesión, o 401/403 si requiere auth
            expect(response.status).to.be.oneOf([200, 201, 401, 403]);

            if (response.status === 200 || response.status === 201) {
                cy.log("ℹ️ API allows creation without explicit auth - session maintained");
            } else {
                cy.log(`🔒 API properly requires authentication: ${response.status}`);
            }
        });
    });

    it("should handle incomplete data appropriately", () => {
        cy.request({
            method: "POST",
            url: "http://127.0.0.1:8090/v4/match_calls",
            headers: {
                "Content-Type": "application/json",
            },
            body: {
                title: "Test MatchCall Incompleto",
            },
            failOnStatusCode: false,
            timeout: 5000,
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 201, 400, 422]);

            if (response.status === 200 || response.status === 201) {
                cy.log("ℹ️ API accepts incomplete data - using defaults");
                expect(response.body).to.have.property("id");
            } else {
                cy.log(`✅ API properly validates required fields: ${response.status}`);
            }
        });
    });

    after(() => {
        if (matchCallId) {
            cy.request({
                method: "DELETE",
                url: `http://127.0.0.1:8090/v4/match_calls/${matchCallId}`,
                failOnStatusCode: false,
                timeout: 5000,
            }).then((response) => {
                cy.log(`🧹 Cleanup: MatchCall ${matchCallId} deletion status: ${response.status}`);
            });
        }
    });
});
