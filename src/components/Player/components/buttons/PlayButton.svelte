<script lang="ts">
    import type { TooltipPlacement } from "vidstack";
    import Tooltip from "../Tooltip.svelte";

    export let tooltipPlacement: TooltipPlacement;
</script>

<Tooltip placement={tooltipPlacement}>
    <media-play-button
        class="media-button group ring-media-focus relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4"
        slot="trigger"
    >
        <media-icon
            class="play-icon hidden h-8 w-8 group-[data-ended=true]:block group-[data-paused=false]:block"
            type="play"
        ></media-icon>
        <media-icon
            class="pause-icon hidden h-8 w-8 group-[data-ended=true]:block group-[data-paused=true]:block"
            type="pause"
        ></media-icon>
    </media-play-button>

    <svelte:fragment slot="content">
        <span class="play-tooltip-text hidden group-[data-paused=true]:block">Play</span>
        <span class="pause-tooltip-text hidden group-[data-paused=false]:block">Pause</span>
    </svelte:fragment>
</Tooltip>
