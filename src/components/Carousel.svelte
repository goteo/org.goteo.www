<script lang="ts">
    import ArrowSliderIcon from "../svgs/ArrowSliderIcon.svelte";
    import { onMount } from "svelte";

    let {
        itemsPerGroup = 1,
        gap = 16,
        showDots = true,
        children = null,
    }: {
        itemsPerGroup: number;
        gap: number;
        showDots: boolean;
        children?: any;
    } = $props();

    let container: HTMLDivElement;

    let totalGroups = $state(0);
    let activeGroup = $state(0);
    let isAtStart = $state(true);
    let isAtEnd = $state(false);
    let isScrollable = $state(false);

    let isDragging = $state(false);
    let startX = $state(0);
    let scrollLeft = $state(0);

    const observerMap = new Map<number, HTMLElement>();

    function updateItemWidths() {
        const styles = getComputedStyle(container);
        const paddingLeft = parseFloat(styles.paddingLeft);
        const paddingRight = parseFloat(styles.paddingRight);
        const available = container.clientWidth - paddingLeft - paddingRight;
        const childWidth = (available - gap * (itemsPerGroup - 1)) / itemsPerGroup;

        for (const el of Array.from(container.children) as HTMLElement[]) {
            el.style.minWidth = `${childWidth}px`;
            el.style.maxWidth = `${childWidth}px`;
            el.style.flex = "0 0 auto";
        }
        updateNavForShort();
    }

    function observeVisibility() {
        const children = Array.from(container.children) as HTMLElement[];
        intersectionObs.disconnect();
        observerMap.clear();
        children.forEach((el, idx) => {
            observerMap.set(idx, el);
            intersectionObs.observe(el);
        });

        totalGroups = Math.ceil(children.length / itemsPerGroup);
        updateNavForShort();
    }

    function updateNavState(group: number) {
        activeGroup = group;
        isAtStart = group === 0;
        isAtEnd = group === totalGroups - 1;
    }

    function updateNavForShort() {
        isScrollable = container.scrollWidth > container.clientWidth;
        isAtStart = true;
        isAtEnd = !isScrollable;
    }

    function scrollToGroup(i: number) {
        const kids = Array.from(container.children) as HTMLElement[];
        const target = kids[i * itemsPerGroup];
        target?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }

    function scroll(dir: "left" | "right") {
        const next =
            dir === "right"
                ? Math.min(activeGroup + 1, totalGroups - 1)
                : Math.max(activeGroup - 1, 0);
        scrollToGroup(next);
    }

    function handleStart(x: number) {
        isDragging = true;
        startX = x - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    }

    function handleMove(x: number, ev: Event) {
        if (!isDragging) return;
        ev.preventDefault();
        const walk = (x - container.offsetLeft - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
    }

    function endDrag() {
        isDragging = false;
    }

    const intersectionObs = new IntersectionObserver(
        (entries) => {
            for (const e of entries) {
                if (e.isIntersecting) {
                    const idx = Array.from(container.children).indexOf(e.target as HTMLElement);
                    if (idx !== -1) {
                        const group = Math.floor(idx / itemsPerGroup);
                        if (group !== activeGroup) updateNavState(group);
                    }
                }
            }
        },
        { threshold: 0.6 },
    );

    onMount(() => {
        updateItemWidths();
        observeVisibility();

        const resizeObs = new ResizeObserver(() => updateItemWidths());
        resizeObs.observe(container);

        const mutationObs = new MutationObserver(() => {
            updateItemWidths();
            observeVisibility();
        });
        mutationObs.observe(container, { childList: true });

        return () => {
            intersectionObs.disconnect();
            resizeObs.disconnect();
            mutationObs.disconnect();
        };
    });
</script>

<div class="relative w-full">
    <button
        onclick={() => scroll("left")}
        class="absolute top-1/2 -left-4 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-[#e6e5f7] p-2 shadow-md disabled:opacity-50"
        disabled={isAtStart}
        aria-label="Scroll left"
    >
        <ArrowSliderIcon direction="left" />
    </button>

    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        bind:this={container}
        role="region"
        aria-label="Carousel"
        class="hide-scrollbar flex gap-[16px] overflow-x-auto scroll-smooth select-none"
        class:cursor-grab={isScrollable && !isDragging}
        class:cursor-default={!isScrollable}
        class:cursor-grabbing={isDragging && isScrollable}
        onmousedown={(e) => handleStart(e.pageX)}
        onmousemove={(e) => handleMove(e.pageX, e)}
        onmouseup={endDrag}
        onmouseleave={endDrag}
        ontouchstart={(e) => handleStart(e.touches[0].pageX)}
        ontouchmove={(e) => handleMove(e.touches[0].pageX, e)}
        ontouchend={endDrag}
    >
        {#if children}
            {@render children()}
        {/if}
    </div>

    <button
        onclick={() => scroll("right")}
        class="absolute top-1/2 -right-4 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-[#e6e5f7] p-2 shadow-md disabled:opacity-50"
        disabled={isAtEnd}
        aria-label="Scroll right"
    >
        <ArrowSliderIcon />
    </button>

    {#if showDots && totalGroups > 1}
        <div class="mt-4 flex justify-center gap-2">
            {#each Array(totalGroups) as _, i}
                <button
                    onclick={() => scrollToGroup(i)}
                    class="h-2 w-2 rounded-full transition-all"
                    class:bg-indigo-500={i === activeGroup}
                    class:bg-gray-300={i !== activeGroup}
                    aria-label={`Go to group ${i + 1}`}
                ></button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .hide-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
</style>
