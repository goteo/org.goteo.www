<script>
    let { width = "20", height = "20" } = $props();
</script>

<svg {width} {height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        ry="2"
        stroke="#462949"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    <circle
        cx="8.5"
        cy="8.5"
        r="1.5"
        stroke="#462949"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
    <polyline
        points="21 15 16 10 5 21"
        stroke="#462949"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
