<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    let {
        onChange,
        // on/off colors objects for background and circle icon
        colorsOn,
        colorsOff,
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

    const bgColor: ClassNameValue = $derived(
        toggle ? (colorsOn?.bg ?? "bg-variant2") : (colorsOff?.bg ?? "bg-variant1"),
    );
    const circleColor: ClassNameValue = $derived(
        toggle ? (colorsOn?.circle ?? "bg-primary") : (colorsOff?.circle ?? "bg-secondary"),
    );
    const sizeClasses: ClassNameValue = $derived(`w-[${width}px] h-[${height}px]`);
    const translateClass: ClassNameValue = $derived(
        toggle
            ? padding !== 4 || width !== 64
                ? `translate-x-[${height - 1}px]`
                : "translate-x-[31px]"
            : "translate-x-[-1px]",
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
        `border-soft-purple flex items-center overflow-hidden rounded-3xl border p-1 transition-all duration-500 ease-in-out`,
        bgColor,
        sizeClasses
    )}
>
    <!-- Filter Drop shadow CSS attribute from Figma (better with inline style due to the large amount of drop shadows) -->
    <div
        class={twMerge(
            "size-6 shrink-0 rounded-full transition-all duration-500 ease-in-out",
            translateClass,
            circleColor,
        )}
        style="filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.10)) drop-shadow(0 6px 6px rgba(0, 0, 0, 0.09)) drop-shadow(0 13px 8px rgba(0, 0, 0, 0.05)) drop-shadow(0 22px 9px rgba(0, 0, 0, 0.01)) drop-shadow(0 35px 10px rgba(0, 0, 0, 0.00));"
    ></div>
</button>
