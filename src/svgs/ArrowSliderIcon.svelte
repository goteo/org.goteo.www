<script lang="ts">
    export let direction: "left" | "right" = "right";

    const transformValue = direction === "right" ? "translate(100, 100) rotate(180)" : "";
</script>

<svg class="flickity-button-icon" viewBox="0 0 100 100" fill="#462949">
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
