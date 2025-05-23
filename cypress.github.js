/**
 * Configuración específica para GitHub Actions
 * Esta configuración se fusiona con cypress.config.js cuando se ejecuta en entorno CI
 *
 * Para usar: CYPRESS_CONFIG_FILE=cypress.github.js pnpm cypress run
 */

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
            runMode: 2, // Reintentar los tests fallidos 2 veces en modo headless
            openMode: 0, // No reintentar en modo interactivo
        },
        setupNodeEvents(on, config) {
            console.log("Ejecutando Cypress en GitHub Actions");
            config.env.CI = true;
            return config;
        },
    },
});
