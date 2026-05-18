<script lang="ts">
    import XIcon from "../../../svgs/XIcon.svelte";

    interface Props {
        text?: string;
        url?: string;
    }

    let { text = "", url = "" }: Props = $props();

    const encodedUrl = $derived(encodeURIComponent(url));
</script>

<a
    href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`}
    target="_blank"
    rel="noopener noreferrer"
    class="flex h-23 w-23 items-center justify-center rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
>
    <XIcon />
</a>
