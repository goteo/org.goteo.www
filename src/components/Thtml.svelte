<!--
    @component
    Use this component whenever you need to render a translation with HTML inside of it
-->
<script lang="ts">
    import { t } from "../i18n/store";

    import type { TranslationOptions } from "../i18n/utils";

    let {
        key,
        vars = {},
        options = {},
    }: {
        key: string;
        vars?: Record<string, string | number>;
        options?: TranslationOptions;
    } = $props();

    let markup: string | undefined = $derived($t(key, vars, { allowHTML: true, ...options }));

    // Without the next lines Svelte won't reload the rendered markup on locale changes
    // https://svelte.dev/docs/svelte/runtime-warnings#Client-warnings-hydration_html_changed
    if (typeof window !== "undefined") {
        const initial = markup;
        markup = undefined;

        $effect(() => {
            markup = initial;
        });
    }
</script>

{@html markup}
