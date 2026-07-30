<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import { get } from "svelte/store";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import Footer from "./Footer.svelte";
    import Header from "./Header.svelte";
    import HeaderSubmenu from "./HeaderSubmenu.svelte";
    import { session } from "../auth/store";
    import { locale } from "../i18n/store";
    import { initCacheInterceptor } from "../openapi/cacheInterceptor";
    import { client } from "../openapi/client/client.gen";

    import type { Session } from "../auth/types";
    import type { Locale } from "../i18n/locales";

    interface AppState {
        locale: Locale;
        session?: Session;
        children?: Snippet;
        class?: ClassNameValue;
    }

    let { locale: localeProp, session: sessionProp, children, class: classes }: AppState = $props();

    /**
     * Loads the session from the API instead of receiving it as a prop.
     *
     * Props of a hydrated island are serialized into the HTML document, so passing the
     * session down that way would write the access and refresh tokens into every page.
     * Pages that can be cached must not carry them, and fetch them from here instead.
     */
    async function loadSession() {
        try {
            const response = await fetch("/api/session");

            if (!response.ok) return;

            const data = (await response.json()) as Session | null;

            session.set(data ? { ...data, expires_at: new Date(data.expires_at) } : undefined);
        } catch (e) {
            console.error("Session fetch failed:", e);
        }
    }

    onMount(() => {
        client.interceptors.request.use(async (request) => {
            try {
                const currentSession = get(session);
                if (currentSession?.token?.asHttpHeaders) {
                    const headers = currentSession.token.asHttpHeaders as Record<string, string>;
                    for (const [key, value] of Object.entries(headers)) {
                        if (value && !request.headers.has(key)) {
                            request.headers.set(key, String(value));
                        }
                    }
                }
            } catch (e) {
                console.error("Auth interceptor failed:", e);
            }
            return request;
        });

        initCacheInterceptor();

        if (sessionProp) {
            session.set(sessionProp);
            return;
        }

        loadSession();
    });

    $effect(() => {
        locale.set(localeProp);
    });
</script>

<Header>
    <HeaderSubmenu />
</Header>
<main
    class={twMerge(
        "mt-(--sticky-top) flex w-full max-w-screen flex-1 flex-col lg:max-h-none",
        classes,
    )}
>
    {@render children?.()}
</main>
<Footer />
