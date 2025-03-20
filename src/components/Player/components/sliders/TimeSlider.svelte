<script lang="ts">
    import SliderChapters from "./SliderChapters.svelte";
    import SliderPreview from "./SliderPreview.svelte";
    import SliderThumb from "./SliderThumb.svelte";

    export let thumbnails: string | undefined = undefined;
</script>

<media-time-slider
    class="group relative mx-[7.5px] inline-flex h-10 w-full cursor-pointer touch-none items-center outline-none select-none"
>
    <SliderChapters />
    <SliderThumb />
    <SliderPreview {thumbnails}>
        <div class="mt-2 text-sm" data-part="chapter-title"></div>
        <media-slider-value class="text-[13px]"></media-slider-value>
    </SliderPreview>
</media-time-slider>
