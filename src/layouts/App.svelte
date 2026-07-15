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
    });

    $effect(() => {
        locale.set(localeProp);
    });

    $effect(() => {
        session.set(sessionProp);
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
