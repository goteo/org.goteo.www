<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { session } from "../auth/store";
    import { locale } from "../i18n/store";
    import Footer from "../layouts/Footer.svelte";
    import Header from "../layouts/Header.svelte";
    import { createBrowserCacheInterceptor } from "../openapi/cacheFetch";
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
        client.interceptors.request.use(createBrowserCacheInterceptor());
    });

    $effect(() => {
        locale.set(localeProp);
    });

    $effect(() => {
        session.set(sessionProp);
    });
</script>

<Header />
<main
    class={twMerge(
        " mt-(--sticky-top) flex w-full max-w-screen flex-1 flex-col lg:max-h-none",
        classes,
    )}
>
    {@render children?.()}
</main>
<Footer />
