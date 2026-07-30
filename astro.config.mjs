import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

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

    vite: {
        plugins: [tailwindcss()],
    },

    i18n: {
        locales: ["es", "en"],
        defaultLocale: "es",
        routing: "manual",
    },
});
