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

    let rawText = $derived($t(key, {}, { allowHTML: true, ...options }));

    let markup = $derived.by(() => {
        if (!rawText) return "";
        let processed = rawText;
        
        for (const [varKey, varValue] of Object.entries(vars)) {
            processed = processed.replaceAll(`{{${varKey}}}`, String(varValue));
        }
        return processed;
    });

    if (typeof window !== "undefined") {
        const initial = markup;
        let hydrationMarkup = $state<string | undefined>(undefined);

        $effect(() => {
            hydrationMarkup = markup;
        });
    }
</script>

{@html markup}
