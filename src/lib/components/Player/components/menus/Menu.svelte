<script lang="ts">
    import type { MenuPlacement, TooltipPlacement } from "vidstack";

    import Tooltip from "../Tooltip.svelte";

    export let placement: MenuPlacement;
    export let tooltipPlacement: TooltipPlacement;
</script>

<media-menu>
    <!-- Menu Button -->
    <Tooltip placement={tooltipPlacement}>
        <media-menu-button
            class="group relative mr-0.5 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset ring-media-focus hover:bg-white/20 aria-hidden:hidden data-[focus]:ring-4"
            slot="trigger"
        >
            <slot name="button" />
        </media-menu-button>

        <slot name="tooltip-content" slot="content" />
    </Tooltip>
    <!-- Menu Items -->
    <media-menu-items
        class="flex h-[var(--menu-height)] max-h-[400px] min-w-[260px] flex-col overflow-y-auto overscroll-y-contain rounded-md border border-white/10 bg-black/95 p-2.5 font-sans text-[15px] font-medium outline-none backdrop-blur-sm transition-[height] duration-300 will-change-[height] animate-out fade-out slide-out-to-bottom-2 data-[resizing]:overflow-hidden data-[open]:animate-in data-[open]:fade-in data-[open]:slide-in-from-bottom-4"
        {placement}
    >
        <slot name="content" />
    </media-menu-items>
</media-menu>
