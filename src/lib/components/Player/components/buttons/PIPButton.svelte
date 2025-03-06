<script lang="ts">
    import type { TooltipPlacement } from "vidstack";

    import Tooltip from "../Tooltip.svelte";

    export let tooltipPlacement: TooltipPlacement;
</script>

<Tooltip placement={tooltipPlacement}>
    <media-pip-button
        class="group relative mr-0.5 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset ring-media-focus hover:bg-white/20 aria-hidden:hidden data-[focus]:ring-4"
        slot="trigger"
    >
        <media-icon class="h-8 w-8 media-pip:hidden" type="picture-in-picture" />
        <media-icon class="hidden h-8 w-8 media-pip:block" type="picture-in-picture-exit" />
    </media-pip-button>

    <svelte:fragment slot="content">
        <span class="media-pip:hidden">Enter PIP</span>
        <span class="hidden media-pip:block">Exit PIP</span>
    </svelte:fragment>
</Tooltip>
