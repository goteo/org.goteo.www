<script lang="ts">
    import type { TooltipPlacement } from "vidstack";

    export let placement: TooltipPlacement;
</script>

<media-tooltip>
    <media-tooltip-trigger>
        <slot name="trigger" />
    </media-tooltip-trigger>
    <media-tooltip-content
        class="tooltip pointer-events-none absolute z-10 inline-block scale-80 rounded-sm bg-black px-2 py-1 text-[13px] font-medium whitespace-nowrap text-gray-400 opacity-0 transition-transform duration-200 ease-in-out group-data-[visible]:scale-100 group-data-[visible]:opacity-100"
        {placement}
    >
        <slot name="content" />
    </media-tooltip-content>
</media-tooltip>

<style>
    @keyframes tooltip-enter {
        from {
            opacity: 0;
            transform: translateY(12px) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translateY(0px) scale(1);
        }
    }

    @keyframes tooltip-exit {
        from {
            opacity: 1;
            transform: translateY(0px) scale(1);
        }
        to {
            opacity: 0;
            transform: translateY(12px) scale(0.8);
        }
    }
</style>
