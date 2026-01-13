import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:4321",
        pageLoadTimeout: 120000,
        defaultCommandTimeout: 60000,
        requestTimeout: 60000,
        responseTimeout: 60000,
        setupNodeEvents(/* on, config */) {
            // implement node event listeners here
        },
        retries: {
            runMode: 1
        }
    },
});
