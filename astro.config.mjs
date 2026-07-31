import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

const locales = ["es", "en", "ca"];

/**
 * Pages that render the very same HTML for every visitor and are therefore safe to
 * store at the edge.
 *
 * A cached response is replayed to everyone who asks for that URL, so a page only
 * belongs here while it stays free of per-visitor content. The session no longer
 * reaches these pages — `App.svelte` loads it from `/api/session` after hydration —
 * which is what makes them cacheable at all.
 *
 * Paths are listed per locale on purpose. A `[locale]` placeholder would also match
 * single-segment routes like `/me`, and on an unprefixed URL the language is
 * negotiated from a cookie and `Accept-Language` (`src/middleware/utils.ts`), so the
 * same path can produce different pages and cannot be keyed by URL alone.
 */
const cacheableRoutes = {
    "": { maxAge: 60, swr: 300 },
    "/about": { maxAge: 3600, swr: 86400 },
    "/project/[idOrSlug]": { maxAge: 60, swr: 300, tags: ["projects"] },
    "/static/[fileName]": { maxAge: 3600, swr: 86400 },
    "/user/[idOrHandle]": { maxAge: 300, swr: 600, tags: ["users"] },
};

const routeRules = Object.fromEntries(
    locales.flatMap((locale) =>
        Object.entries(cacheableRoutes).map(([path, rule]) => [`/${locale}${path}`, rule]),
    ),
);

// https://astro.build/config
export default defineConfig({
    integrations: [svelte()],
    output: "server",

    adapter: cloudflare({
        imageService: "passthrough",
    }),

    cache: {
        provider: cacheCloudflare(),
    },

    routeRules,

    /**
     * Karla is downloaded from Google at build time and served from our own origin, so no
     * request reaches a third party while a visitor reads a page.
     *
     * Karla is a variable font: the whole `200 800` range travels in a single file, which is
     * why asking for every weight the interface uses costs no extra request. The previous
     * `@fontsource/karla` import only shipped weight 400, so the ~360 `font-bold`,
     * `font-medium` and `font-semibold` usages were being faked by the browser.
     *
     * `latin-ext` is not optional here: Catalan needs U+0140 (`ŀ`) for the geminate `l·l`.
     */
    fonts: [
        {
            provider: fontProviders.google(),
            name: "Karla",
            cssVariable: "--font-karla",
            weights: ["200 800"],
            styles: ["normal", "italic"],
            subsets: ["latin", "latin-ext"],
        },
    ],

    vite: {
        plugins: [tailwindcss()],

        /**
         * These are only ever reached through Astro's virtual modules, so Vite does not see
         * them while scanning and discovers them mid-session instead. Each discovery
         * re-optimizes and reloads the dev server, and reloading it a second time while
         * workerd already holds a module graph kills the runtime with
         * `Cannot read properties of null (reading 'function')`.
         *
         * Naming them up front gets them into the first optimize pass, so no reload happens.
         */
        optimizeDeps: {
            include: [
                "@astrojs/cloudflare/cache/provider",
                "@astrojs/svelte/server.js",
                "astro/actions/runtime/entrypoints/route.js",
                "astro/assets/services/noop",
            ],
        },
    },

    i18n: {
        locales: ["es", "en"],
        defaultLocale: "es",
        routing: "manual",
    },
});
