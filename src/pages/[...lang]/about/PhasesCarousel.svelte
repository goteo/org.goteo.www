<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import Carousel from "../../../components/Carousel.svelte";

    let {
        phases,
        class: className = "",
    }: {
        phases: { title: string; description: string }[];
        class?: string;
    } = $props();
</script>

<Carousel showDots={true} itemsPerGroup={1} desktopItemsToShow={3} mobileItemsToShow={1} gap={24} class={twMerge(className)}>
    {#each phases as phase, i}
        <div
            class="border-grey relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-white p-6 shadow-sm"
        >
            <span
                class="text-grey pointer-events-none absolute bottom-16 left-4 text-[175px] font-bold select-none"
                >{i + 1}</span
            >
            <h3 class="text-secondary relative z-10 text-base font-bold lg:text-lg">
                {phase.title}
            </h3>
            <p class="text-content relative z-10 text-sm leading-relaxed">{phase.description}</p>
        </div>
    {/each}
</Carousel>
