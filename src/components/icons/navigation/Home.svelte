<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "24", height = "24" }: Props = $props();
</script>

<svg
    {width}
    {height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge("text-secondary", classes)}
>
    <foreignObject x="-4" y="-4" width="32" height="32"
        ><div
            xmlns="http://www.w3.org/1999/xhtml"
            style="backdrop-filter:blur(2px);clip-path:url(#bgblur_1_501_2117_clip_path);height:100%;width:100%"
        ></div></foreignObject
    ><g data-figma-bg-blur-radius="4">
        <g clip-path="url(#clip0_501_2117)">
            <rect width="24" height="24" rx="12" fill="var(--color-white)" fill-opacity="0.01" />
            <circle
                opacity="0.08"
                cx="12"
                cy="12"
                r="11.75"
                fill="var(--color-secondary)"
                stroke="var(--color-variant1)"
                stroke-width="0.5"
            />
            <circle opacity="0.8" cx="12" cy="12" r="10" fill="var(--color-secondary)" />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 6L18 13H17.5C16.9477 13 16.5 13.4477 16.5 14V17C16.5 17.5523 16.0523 18 15.5 18H13V14H11V18H8.5C7.94772 18 7.5 17.5523 7.5 17V14C7.5 13.4477 7.05228 13 6.5 13H6L12 6Z"
                fill="currentColor"
            />
        </g>
    </g>
    <defs>
        <clipPath id="bgblur_1_501_2117_clip_path" transform="translate(4 4)"
            ><rect width="24" height="24" rx="12" />
        </clipPath><clipPath id="clip0_501_2117">
            <rect width="24" height="24" rx="12" fill="white" />
        </clipPath>
    </defs>
</svg>
