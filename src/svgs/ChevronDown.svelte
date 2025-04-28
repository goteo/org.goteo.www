<script lang="ts">
    export let rotate = false;
</script>

<svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={`transition-transform ${rotate ? "rotate-180" : ""}`}
>
    <path d="M3 6L8 11L13 6" stroke="#462949" stroke-linecap="round" stroke-linejoin="round" />
</svg>
