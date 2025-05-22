<script lang="ts">
    const {
        text = "¡Tooltip!",
        duration = 1000,
        tooltipClass,
        className = "",
    } = $props<{
        text?: string;
        duration?: number;
        tooltipClass?: string;
        className?: string;
    }>();
    const baseClasses = "text-white text-sm px-2 rounded z-[9999] backdrop-blur-sm";

    const tooltipClasses = `${baseClasses} ${tooltipClass ?? "bg-gray-800/90"}`.trim();

    function showTooltip(event: MouseEvent) {
        const wrapper = event.currentTarget as HTMLElement;
        const tooltip = document.createElement("span");
        tooltip.textContent = text;

        tooltip.className = `
      absolute left-1/2 -translate-x-[90%] bottom-full mb-0.5
      opacity-0 transition-all duration-200 transform pointer-events-none
      ${tooltipClasses}
    `.trim();

        wrapper.style.position = "relative";
        wrapper.appendChild(tooltip);

        requestAnimationFrame(() => {
            tooltip.classList.remove("opacity-0");
            tooltip.classList.add("opacity-100", "-translate-y-1");
        });

        setTimeout(() => {
            tooltip.classList.remove("opacity-100", "-translate-y-1");
            tooltip.classList.add("opacity-0", "-translate-y-2");
            setTimeout(() => tooltip.remove(), 200);
        }, duration);
    }
</script>

<span class={className} on:click={showTooltip}>
    <slot />
</span>
