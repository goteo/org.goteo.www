<script lang="ts">
    /**
     * @component
     * Dynamic Toggle component with support for Tailwind, Hex colors, RGB, RGBA and HSL.
     * **Props:**
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
        // on/off colors objects for background and circle icon
        colorsOn = { bg: "variant2", circle: "primary" },
        colorsOff = { bg: "variant1", circle: "secondary" },
        // padding, width and height props ---- value has to be in px & width double of the height
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

    // true = on ----- false = off
    let toggle = $state(false);

    const getStyleOrClass = (value: string) => {
        const isTailwind =
            !value.startsWith("#") && !value.startsWith("rgb") && !value.startsWith("hsl");
        return {
            class: isTailwind ? value : "",
            style: isTailwind ? "" : value,
        };
    };

    const currentBgColor = $derived(getStyleOrClass(toggle ? colorsOn.bg : colorsOff.bg));
    const currentCircleColor = $derived(
        getStyleOrClass(toggle ? colorsOn.circle : colorsOff.circle),
    );
    const circleSize = $derived(height - padding * 2);
    const translateX = $derived((toggle ? width - circleSize - padding * 2 : 0) - 1);

    function handleToggle() {
        toggle = !toggle;
        if (onChange) onChange(toggle);
    }

    $effect(() => {
        // Ensure width is double the height for proper toggle functionality
        if (width !== 2 * height) {
            console.warn(
                `Width should be double the height for proper toggle functionality. Current width: ${width}px, height: ${height}px. Please adjust accordingly.`,
            );
        }
    });
</script>

<button
    onclick={() => handleToggle()}
    type="button"
    aria-label="toggle"
    aria-checked={toggle}
    role="switch"
    class={twMerge(
        `border-soft-purple flex items-center overflow-hidden rounded-3xl border transition-all duration-500 ease-in-out`,
        currentBgColor.class,
    )}
    style="width: {width}px; height: {height}px; padding: {padding}px; background-color: {currentBgColor.style};"
>
    <!-- Filter Drop shadow CSS attribute from Figma (better with inline style due to the large amount of drop shadows) -->
    <div
        class={twMerge(
            "size-6 shrink-0 rounded-full transition-all duration-500 ease-in-out",
            currentCircleColor.class,
        )}
        style="filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.10)) drop-shadow(0 6px 6px rgba(0, 0, 0, 0.09)) drop-shadow(0 13px 8px rgba(0, 0, 0, 0.05)) drop-shadow(0 22px 9px rgba(0, 0, 0, 0.01)) drop-shadow(0 35px 10px rgba(0, 0, 0, 0.00)); 
        transform: translateX({translateX}px); 
        width: {circleSize}px; 
        height: {circleSize}px;
        background-color: {currentCircleColor.style};"
    ></div>
</button>
