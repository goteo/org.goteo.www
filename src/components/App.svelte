<script lang="ts">
    import { session } from "../auth/store";
    import type { Session } from "../auth/types";
    import type { Locale } from "../i18n/locales";
    import { locale } from "../i18n/store";

    interface AppState {
        locale: Locale;
        session?: Session;
    }

    let { locale: localeProp, session: sessionProp }: AppState = $props();

    $effect(() => {
        locale.set(localeProp);
    });

    $effect(() => {
        session.set(sessionProp);
    });
</script>
