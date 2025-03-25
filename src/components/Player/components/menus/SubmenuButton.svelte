<script lang="ts">
    export let label: string;
</script>

<media-menu-button
    class="parent ring-media-focus left-0 z-10 flex w-full cursor-pointer items-center justify-start rounded-sm bg-black/60 p-2.5 outline-none select-none ring-inset aria-disabled:hidden aria-hidden:hidden data-[focus]:ring-[3px] data-[hocus]:bg-white/10 data-[open]:sticky data-[open]:-top-2.5"
>
    <media-icon
        class="parent-data-[open]:block mr-1.5 -ml-0.5 hidden h-[18px] w-[18px]"
        type="chevron-left"
    ></media-icon>
    <div class="parent-data-[open]:hidden contents">
        <slot name="icon" />
    </div>
    <span class="parent-data-[open]:ml-0 ml-1.5">{label}</span>
    <span class="ml-auto text-sm text-white/50" data-part="hint"></span>
    <media-icon
        class="parent-data-[open]:hidden ml-0.5 h-[18px] w-[18px] text-sm text-white/50"
        type="chevron-right"
    ></media-icon>
</media-menu-button>
