import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:4321",
        screenshotOnRunFailure: true,
        video: true,
        videoCompression: 32,
        viewportWidth: 1280,
        viewportHeight: 720,
        retries: {
            runMode: 2,
            openMode: 0,
        },
        setupNodeEvents(
            on: Cypress.PluginEvents,
            config: Cypress.PluginConfigOptions,
        ): Cypress.PluginConfigOptions {
            console.log("Ejecutando Cypress en GitHub Actions");
            config.env.CI = true;
            return config;
        },
    },
});
