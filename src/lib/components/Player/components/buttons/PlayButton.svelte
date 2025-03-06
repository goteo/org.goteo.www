<script lang="ts">
    import type { TooltipPlacement } from "vidstack";

    import Tooltip from "../Tooltip.svelte";

    export let tooltipPlacement: TooltipPlacement;
</script>

<Tooltip placement={tooltipPlacement}>
    <media-play-button
        class="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset ring-media-focus hover:bg-white/20 data-[focus]:ring-4"
        slot="trigger"
    >
        <media-icon class="hidden h-8 w-8 media-paused:block" type="play" />
        <media-icon class="h-8 w-8 media-paused:hidden" type="pause" />
    </media-play-button>

    <svelte:fragment slot="content">
        <span class="hidden media-paused:block">Play</span>
        <span class="media-paused:hidden">Pause</span>
    </svelte:fragment>
</Tooltip>
