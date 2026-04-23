<script lang="ts">
    import { session } from "../auth/store";
    import { locale } from "../i18n/store";
    import Footer from "../layouts/Footer.svelte";
    import Header from "../layouts/Header.svelte";

    import type { Session } from "../auth/types";
    import type { Locale } from "../i18n/locales";
    import type { Snippet } from "svelte";

    interface AppState {
        locale: Locale;
        session?: Session;
        children: Snippet;
        class?: string;
    }

    let {
        locale: localeProp,
        session: sessionProp,
        children,
        class: className,
    }: AppState = $props();

    $effect(() => {
        locale.set(localeProp);
    });

    $effect(() => {
        session.set(sessionProp);
    });
</script>

<Header />
<main class={`flex w-full max-w-screen flex-1 flex-col${className ? ` ${className}` : ""}`}>
    {@render children()}
</main>
<Footer />
