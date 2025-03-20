// @ts-check

import node from "@astrojs/node";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { vite as vidstack } from "vidstack/plugins";

// https://astro.build/config
export default defineConfig({
    integrations: [svelte()],
    output: "server",

    adapter: node({
        mode: "standalone",
    }),

    vite: {
        plugins: [tailwindcss(), vidstack()],
    },

    i18n: {
        locales: ["es", "en"],
        defaultLocale: "es",
        routing: {
            prefixDefaultLocale: false,
            redirectToDefaultLocale: true,
        },
    },
});
