<script lang="ts">
    export let label: string;
</script>

<media-menu-button
    class="parent left-0 z-10 flex w-full cursor-pointer select-none items-center justify-start rounded-sm bg-black/60 p-2.5 outline-none ring-inset ring-media-focus aria-disabled:hidden aria-hidden:hidden data-[open]:sticky data-[open]:-top-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-[3px]"
>
    <media-icon
        class="-ml-0.5 mr-1.5 hidden h-[18px] w-[18px] parent-data-[open]:block"
        type="chevron-left"
    />
    <div class="contents parent-data-[open]:hidden">
        <slot name="icon" />
    </div>
    <span class="ml-1.5 parent-data-[open]:ml-0">{label}</span>
    <span class="ml-auto text-sm text-white/50" data-part="hint"></span>
    <media-icon
        class="ml-0.5 h-[18px] w-[18px] text-sm text-white/50 parent-data-[open]:hidden"
        type="chevron-right"
    />
</media-menu-button>
