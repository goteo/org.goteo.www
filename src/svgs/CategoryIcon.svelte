<script>
    let { width = "16", height = "16", class: className = "" } = $props();
</script>

<svg
    class={`stroke-black ${className}`}
    {width}
    {height}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
>
    <path
        d="M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5Z"
        stroke-width="1.5"
    />
    <path d="M8 5V8L10 10" stroke-width="1.5" stroke-linecap="round" />
</svg>
