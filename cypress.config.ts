import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:4321",
        pageLoadTimeout: 120000,
        defaultCommandTimeout: 65000,
        requestTimeout: 65000,
        responseTimeout: 65000,
        setupNodeEvents(/* on, config */) {
            // implement node event listeners here
        },
        retries: {
            runMode: 1
        }
    },
});
