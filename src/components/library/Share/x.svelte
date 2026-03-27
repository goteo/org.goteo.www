<script lang="ts">
    import { onMount } from "svelte";

    import XIcon from "../../../svgs/XIcon.svelte";

    interface Props {
        text?: string;
    }

    let { text = "" }: Props = $props();

    let currentUrl = $state("");

    onMount(() => {
        currentUrl = encodeURIComponent(window.location.href);
    });
</script>

<a
    href={`https://twitter.com/intent/tweet?url=${currentUrl}&text=${text}`}
    target="_blank"
    rel="noopener noreferrer"
    class="flex h-23 w-23 items-center justify-center rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
>
    <XIcon />
</a>
