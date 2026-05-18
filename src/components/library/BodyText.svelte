<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();
</script>

<div class="mx-auto max-w-4xl px-6 py-12">
    <div
        class="marked-content flex flex-col gap-6"
        style="overflow-wrap: break-word; word-wrap: break-word; word-break: break-word;"
    >
        {@render children()}
    </div>
</div>
