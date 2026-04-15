<script lang="ts">
    /**
     * @component
     * Dynamic Toggle component.
     * @props
     * - `onChange`: callback function that receives the new state of the toggle (true for on, false for off).
     * - `colorsOn`: object with `bg` and `circle` properties for the "on" state colors (supports Tailwind classes or CSS color values).
     * - `colorsOff`: object with `bg` and `circle` properties for the "off" state colors (supports Tailwind classes or CSS color values).
     * - `padding`: internal spacing in pixels between the circle and the toggle container.
     * - `width`: width of the toggle in pixels (default: 64). Must be double the height for proper functionality.
     * - `height`: height of the toggle in pixels (default: 32). Must be half the width for proper functionality.
     */
    import { twMerge } from "tailwind-merge";

    let {
        onChange,
        colorsOn = { bg: "#9fc", circle: "#59E9D3" },
        colorsOff = { bg: "#e6e5f7", circle: "#462949" },
        padding = 4,
        width = 64,
        height = 32,
    }: {
        onChange: (newState: boolean) => void;
        colorsOn?: { bg: string; circle: string };
        colorsOff?: { bg: string; circle: string };
        padding?: number;
        width?: number;
        height?: number;
    } = $props();

    // true = on ---- false = off
    let toggle = $state(false);

    const currentBgColor = $derived(toggle ? `bg-[${colorsOn.bg}]` : `bg-[${colorsOff.bg}]`);
    const currentCircleColor = $derived(
        toggle ? `bg-[${colorsOn.circle}]` : `bg-[${colorsOff.circle}]`,
    );
    const circleSize = $derived(height - padding * 2);
    const translateX = $derived((toggle ? width - circleSize - padding * 2 : 0) - 1);

    const bgClasses = $derived(
        `bg-${currentBgColor} w-[${width}px] h-[${height}px] p-[${padding}px]`,
    );
    const circleClasses = $derived(
        `size-[${circleSize}px] ${currentCircleColor} translate-x-[${translateX}px]`,
    );

    function handleToggle() {
        toggle = !toggle;
        if (onChange) onChange(toggle);
    }
</script>

<button
    onclick={() => handleToggle()}
    type="button"
    aria-label="toggle"
    aria-checked={toggle}
    role="switch"
    class={twMerge(
        `border-soft-purple flex h-8 w-16 items-center overflow-hidden rounded-3xl border p-1 transition-all duration-500 ease-in-out`,
        bgClasses,
    )}
>
    <!-- Filter Drop shadow CSS attribute from Figma (better with inline style due to the large amount of drop shadows) -->
    <div
        class={twMerge(
            "shrink-0 rounded-full transition-all duration-500 ease-in-out",
            circleClasses,
        )}
        style="filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.10)) drop-shadow(0 6px 6px rgba(0, 0, 0, 0.09)) drop-shadow(0 13px 8px rgba(0, 0, 0, 0.05)) drop-shadow(0 22px 9px rgba(0, 0, 0, 0.01)) drop-shadow(0 35px 10px rgba(0, 0, 0, 0.00));"
    ></div>
</button>
