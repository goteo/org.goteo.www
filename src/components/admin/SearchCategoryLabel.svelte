<!--
    @component
    Category label used in the admin search panel to group results by type
    (Projects, Tipjars, Users).
-->
<script lang="ts">
    import type { Snippet } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        children: Snippet;
        class?: ClassNameValue;
    }

    let { children, class: classes = "" }: Props = $props();
</script>

<p class={twMerge("text-sm font-bold text-gray-700 uppercase", classes)}>
    {@render children()}
</p>
