<script lang="ts">
    import ArrowSliderIcon from "../svgs/ArrowSliderIcon.svelte";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";

    export let itemsPerGroup: number = 1;
    export let gap: number = 16;
    export let showDots: boolean = true;

    let container: HTMLDivElement;
    let totalItems = 0;
    const activeGroup = writable(0);

    let totalGroups = 0;
    let isAtStart = true;
    let isAtEnd = false;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    function handleStart(x: number) {
        isDragging = true;
        container.classList.add("dragging");
        startX = x - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    }

    function handleMove(x: number, event: Event) {
        if (!isDragging) return;
        event.preventDefault();
        const currentX = x - container.offsetLeft;
        const walk = (currentX - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
    }

    function endDrag() {
        isDragging = false;
        container.classList.remove("dragging");
    }

    function handleMouseDown(e: MouseEvent) {
        handleStart(e.pageX);
    }
    function handleMouseMove(e: MouseEvent) {
        handleMove(e.pageX, e);
    }

    function handleTouchStart(e: TouchEvent) {
        handleStart(e.touches[0].pageX);
    }
    function handleTouchMove(e: TouchEvent) {
        handleMove(e.touches[0].pageX, e);
    }

    function scrollToGroup(groupIndex: number) {
        const children = Array.from(container.children) as HTMLElement[];
        const firstItemIndex = groupIndex * itemsPerGroup;
        const firstItem = children[firstItemIndex];

        if (!firstItem) return;

        container.scrollTo({
            left: firstItem.offsetLeft - container.offsetLeft,
            behavior: "smooth",
        });

        activeGroup.set(groupIndex);
    }

    function scroll(direction: "left" | "right") {
        activeGroup.update((current) => {
            const next =
                direction === "right"
                    ? Math.min(current + 1, totalGroups - 1)
                    : Math.max(current - 1, 0);
            scrollToGroup(next);
            return next;
        });
    }

    function handleScroll() {
        const children = Array.from(container.children) as HTMLElement[];
        const containerLeft = container.getBoundingClientRect().left;

        for (let i = 0; i < totalGroups; i++) {
            const firstIndex = i * itemsPerGroup;
            const firstItem = children[firstIndex];

            if (!firstItem) continue;

            const itemLeft = firstItem.getBoundingClientRect().left;

            if (itemLeft >= containerLeft - 1) {
                activeGroup.set(i);
                break;
            }
        }
    }

    function updateChildrenWidth() {
        const styles = getComputedStyle(container);
        const paddingLeft = parseFloat(styles.paddingLeft);
        const paddingRight = parseFloat(styles.paddingRight);
        const availableWidth = container.clientWidth - paddingLeft - paddingRight;

        const childWidth = (availableWidth - gap * (itemsPerGroup - 1)) / itemsPerGroup;

        for (const child of Array.from(container.children) as HTMLElement[]) {
            child.style.minWidth = `${childWidth}px`;
            child.style.maxWidth = `${childWidth}px`;
            child.style.flex = "0 0 auto";
        }
    }

    onMount(() => {
        totalItems = container.children.length;
        totalGroups = Math.ceil(totalItems / itemsPerGroup);

        updateChildrenWidth();

        const resizeObserver = new ResizeObserver(() => {
            updateChildrenWidth();
        });

        resizeObserver.observe(container);

        const unsubscribe = activeGroup.subscribe((index) => {
            isAtStart = index === 0;
            isAtEnd = index === totalGroups - 1;
        });

        return () => {
            resizeObserver.disconnect();
            unsubscribe();
        };
    });
</script>

<div class="relative w-full overflow-hidden">
    <button
        on:click={() => scroll("left")}
        class="absolute top-1/2 left-2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-[#e6e5f7] p-2 shadow disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Scroll left"
        disabled={isAtStart}
    >
        <ArrowSliderIcon direction={"left"} />
    </button>

    <div
        bind:this={container}
        class="no-select hide-scrollbar flex cursor-grab touch-none snap-x snap-mandatory gap-[16px] overflow-x-auto px-8 py-8"
        on:mousedown={handleMouseDown}
        on:mousemove={handleMouseMove}
        on:mouseup={endDrag}
        on:mouseleave={endDrag}
        on:touchstart={handleTouchStart}
        on:touchmove={handleTouchMove}
        on:touchend={endDrag}
        on:scroll={handleScroll}
    >
        <slot />
    </div>

    <button
        on:click={() => scroll("right")}
        class="absolute top-1/2 right-2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-[#e6e5f7] p-2 shadow disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Scroll right"
        disabled={isAtEnd}
    >
        <ArrowSliderIcon />
    </button>

    {#if showDots}
        <div class="mt-4 flex justify-center gap-2">
            {#each Array(totalGroups) as _, i}
                <button
                    on:click={() => scrollToGroup(i)}
                    class="h-2 w-2 rounded-full transition-all"
                    class:bg-indigo-500={i === $activeGroup}
                    class:bg-gray-300={i !== $activeGroup}
                />
            {/each}
        </div>
    {/if}
</div>

<style>
    .no-select {
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
    }
    .dragging {
        cursor: grabbing;
    }

    .hide-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
</style>
