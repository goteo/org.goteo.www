<script lang="ts">
    let { direction = "right" }: { direction: "left" | "right" } = $props();

    const transformValue = $derived(direction === "right" ? "translate(100, 100) rotate(180)" : "");
</script>

<svg class="flickity-button-icon" viewBox="0 0 100 100" fill="currentColor">
    <path
        d="M 10, 50
       L 60, 85
       L 60, 50
       L 60, 50
       L 60, 50
       L 60, 15
       Z"
        class="arrow"
        transform={transformValue}
    />
</svg>
