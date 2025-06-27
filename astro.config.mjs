import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { vite as vidstack } from "vidstack/plugins";

// https://astro.build/config
export default defineConfig({
    integrations: [svelte()],
    output: "server",

    adapter: cloudflare({
        imageService: "passthrough",
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
