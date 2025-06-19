<script>
    import Carousel from "./Carousel.svelte";
</script>

<Carousel gap={16} showDots={true}>
    {#each Array(20) as _, i}
        <div class="flex h-[140px] items-center justify-center rounded bg-indigo-100 font-bold">
            Slide {i + 1}
        </div>
    {/each}
</Carousel>
