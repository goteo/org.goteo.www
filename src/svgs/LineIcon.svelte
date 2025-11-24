<script lang="ts">
    export let rotate = false;
</script>

<svg
    width="6"
    height="12"
    viewBox="0 0 6 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={`transition-transform ${rotate ? "rotate-90" : ""}`}
>
    <path
        d="M0.5 11L5.5 6L0.500001 1"
        stroke="#462949"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
