<!-- Filter Icon matching Figma design exactly -->
<script>
    let { width = "16", height = "16", class: className = "" } = $props();
</script>

<svg {width} {height} viewBox="0 0 16 16" fill="none" class={className}>
    <!-- Top line with slider -->
    <line
        x1="2"
        y1="4"
        x2="6"
        y2="4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
    />
    <circle cx="8" cy="4" r="1.5" stroke="currentColor" stroke-width="1.5" fill="none" />
    <line
        x1="10"
        y1="4"
        x2="14"
        y2="4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
    />

    <!-- Middle line with slider -->
    <line
        x1="2"
        y1="8"
        x2="4"
        y2="8"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
    />
    <circle cx="6" cy="8" r="1.5" stroke="currentColor" stroke-width="1.5" fill="none" />
    <line
        x1="8"
        y1="8"
        x2="14"
        y2="8"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
    />

    <!-- Bottom line with slider -->
    <line
        x1="2"
        y1="12"
        x2="8"
        y2="12"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
    />
    <circle cx="10" cy="12" r="1.5" stroke="currentColor" stroke-width="1.5" fill="none" />
    <line
        x1="12"
        y1="12"
        x2="14"
        y2="12"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
    />
</svg>
