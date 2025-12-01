<script lang="ts">
    import ArrowSliderIcon from "../svgs/ArrowSliderIcon.svelte";
    import { onMount, tick } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    // Browser check for SSR compatibility
    const browser = typeof window !== "undefined";

    let {
        itemsPerGroup = 1,
        gap = 24,
        showDots = true,
        class: className = "",
        mobileItemsToShow = 1,
        desktopItemsToShow = 3,
        children = null,
    }: {
        itemsPerGroup: number;
        gap: number;
        showDots: boolean;
        class?: ClassNameValue;
        mobileItemsToShow?: number;
        desktopItemsToShow?: number;
        children?: any;
    } = $props();

    const wrapperClasses = twMerge("relative w-full", className);

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

    function getCurrentItemsToShow(): number {
        if (!browser) return desktopItemsToShow;
        return window.innerWidth >= 1024 ? desktopItemsToShow : mobileItemsToShow;
    }

    function updateItemWidths() {
        if (!browser || !container || !mounted) return;

        try {
            const containerWidth = container.offsetWidth;

            if (containerWidth === 0) {
                setTimeout(updateItemWidths, 50);
                return;
            }

            const styles = getComputedStyle(container);
            const paddingLeft = parseFloat(styles.paddingLeft);
            const paddingRight = parseFloat(styles.paddingRight);
            const available = containerWidth - paddingLeft - paddingRight;

            const visibleItems = getCurrentItemsToShow();
            const childWidth = (available - gap * (visibleItems - 1)) / visibleItems;

            const directChildren = Array.from(container.children) as HTMLElement[];

            for (const el of directChildren) {
                if (el.tagName.toLowerCase() === "astro-slot") {
                    const slotChildren = Array.from(el.children) as HTMLElement[];
                    slotChildren.forEach((child) => {
                        child.style.minWidth = `${childWidth}px`;
                        child.style.maxWidth = `${childWidth}px`;
                        child.style.width = `${childWidth}px`;
                        child.style.flex = "0 0 auto";
                        child.style.overflow = "hidden";
                    });
                    el.style.minWidth = "";
                    el.style.maxWidth = "";
                    el.style.width = "";
                    el.style.flex = "";
                    el.style.display = "contents";
                } else {
                    el.style.minWidth = `${childWidth}px`;
                    el.style.maxWidth = `${childWidth}px`;
                    el.style.width = `${childWidth}px`;
                    el.style.flex = "0 0 auto";
                    el.style.overflow = "hidden";
                }
            }
            updateNavForShort();
        } catch (error) {
            console.warn("Carousel: Error updating item widths:", error);
        }
    }

    function observeVisibility() {
        if (!browser || !container || !intersectionObs || !mounted) return;

        try {
            let actualChildren: HTMLElement[] = [];
            const directChildren = Array.from(container.children) as HTMLElement[];

            for (const child of directChildren) {
                if (child.tagName.toLowerCase() === "astro-slot") {
                    actualChildren.push(...(Array.from(child.children) as HTMLElement[]));
                } else {
                    actualChildren.push(child);
                }
            }

            intersectionObs.disconnect();
            observerMap.clear();

            actualChildren.forEach((el, idx) => {
                observerMap.set(idx, el);
                intersectionObs?.observe(el);
            });

            totalGroups = Math.ceil(actualChildren.length / itemsPerGroup);
            updateNavForShort();
        } catch (error) {
            console.warn("Carousel: Error observing visibility:", error);
        }
    }

    function updateNavState(group: number) {
        activeGroup = group;
        isAtStart = group === 0;
        isAtEnd = group === totalGroups - 1;
    }

    function updateNavForShort() {
        if (!browser || !container || !mounted) return;

        try {
            isScrollable = container.scrollWidth > container.clientWidth;
            isAtStart = true;
            isAtEnd = !isScrollable;
        } catch (error) {
            console.warn("Carousel: Error updating navigation state:", error);
        }
    }

    function scrollToGroup(i: number) {
        if (!browser || !container || !mounted) return;

        try {
            let actualChildren: HTMLElement[] = [];
            const directChildren = Array.from(container.children) as HTMLElement[];

            for (const child of directChildren) {
                if (child.tagName.toLowerCase() === "astro-slot") {
                    actualChildren.push(...(Array.from(child.children) as HTMLElement[]));
                } else {
                    actualChildren.push(child);
                }
            }

            const target = actualChildren[i * itemsPerGroup];
            target?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
        } catch (error) {
            console.warn("Carousel: Error scrolling to group:", error);
        }
    }

    function scroll(dir: "left" | "right") {
        const next =
            dir === "right"
                ? Math.min(activeGroup + 1, totalGroups - 1)
                : Math.max(activeGroup - 1, 0);
        scrollToGroup(next);
    }

    function handleStart(x: number) {
        if (!browser || !container || !mounted) return;

        isDragging = true;
        startX = x - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    }

    function handleMove(x: number, ev: Event) {
        if (!browser || !container || !mounted || !isDragging) return;

        ev.preventDefault();
        const walk = (x - container.offsetLeft - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
    }

    function endDrag() {
        isDragging = false;
    }

    let intersectionObs: IntersectionObserver | undefined;
    let resizeObs: ResizeObserver | undefined;
    let mutationObs: MutationObserver | undefined;
    let mounted = false;

    onMount(() => {
        // Ensure we're in the browser and DOM is ready
        if (!browser || !container) return;

        const init = async () => {
            // Wait for next tick to ensure DOM is fully rendered
            await tick();

            mounted = true;

            try {
                // Create IntersectionObserver only in the browser
                intersectionObs = new IntersectionObserver(
                    (entries) => {
                        if (!mounted) return;
                        for (const e of entries) {
                            if (e.isIntersecting && container) {
                                let idx = -1;
                                for (const [index, element] of observerMap.entries()) {
                                    if (element === e.target) {
                                        idx = index;
                                        break;
                                    }
                                }

                                if (idx !== -1) {
                                    const group = Math.floor(idx / itemsPerGroup);
                                    if (group !== activeGroup) updateNavState(group);
                                }
                            }
                        }
                    },
                    { threshold: 0.6 },
                );

                // Initialize component after observers are created
                updateItemWidths();
                observeVisibility();

                resizeObs = new ResizeObserver(() => {
                    if (mounted && container) updateItemWidths();
                });
                resizeObs.observe(container);

                mutationObs = new MutationObserver(() => {
                    if (mounted && container) {
                        updateItemWidths();
                        observeVisibility();
                    }
                });
                mutationObs.observe(container, { childList: true });

                window.addEventListener("resize", updateItemWidths);
            } catch (error) {
                console.warn("Carousel: Error initializing observers:", error);
            }
        };

        init();

        return () => {
            mounted = false;
            if (intersectionObs) intersectionObs.disconnect();
            if (resizeObs) resizeObs.disconnect();
            if (mutationObs) mutationObs.disconnect();
            if (browser) {
                window.removeEventListener("resize", updateItemWidths);
            }
        };
    });
</script>

<div class={wrapperClasses}>
    <button
        onclick={() => scroll("left")}
        class="bg-variant1 absolute top-1/2 -left-4 z-10 hidden h-10 w-10 -translate-y-1/2 rounded-full p-2 shadow-md disabled:opacity-50 lg:block"
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
        class="hide-scrollbar flex w-full overflow-x-auto scroll-smooth select-none"
        class:cursor-grab={isScrollable && !isDragging}
        class:cursor-default={!isScrollable}
        class:cursor-grabbing={isDragging && isScrollable}
        style="gap: {gap}px"
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
        class="bg-variant1 absolute top-1/2 -right-4 z-10 hidden h-10 w-10 -translate-y-1/2 rounded-full p-2 shadow-md disabled:opacity-50 lg:block"
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
