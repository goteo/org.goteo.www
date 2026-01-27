import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:4321",
        pageLoadTimeout: 180000,
        defaultCommandTimeout: 180000,
        requestTimeout: 180000,
        responseTimeout: 180000,
        setupNodeEvents(/* on, config */) {
            // implement node event listeners here
        },
        retries: {
            runMode: 1,
        },
    },
});
