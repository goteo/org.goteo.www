<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "56", height = "56" }: Props = $props();
</script>

<svg
    {width}
    {height}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge("text-secondary", classes)}
>
    <rect width="56" height="56" rx="11.2" fill="var(--color-variant1)" />
    <g clip-path="url(#clip0_1099_11560)">
        <path
            d="M11.8785 42H17.8179V27.5758L9.33301 21.2122V39.4546C9.33301 40.8631 10.4742 42 11.8785 42Z"
            fill="currentColor"
        />
        <path
            d="M38.1816 42H44.121C45.5295 42 46.6665 40.8588 46.6665 39.4546V21.2122L38.1816 27.5758"
            fill="currentColor"
        />
        <path
            d="M38.1816 16.5454V27.5757L46.6665 21.212V17.8181C46.6665 14.6702 43.0732 12.8757 40.5574 14.7635"
            fill="currentColor"
        />
        <path
            d="M17.8184 27.5757V16.5454L28.0002 24.1818L38.182 16.5454V27.5757L28.0002 35.2121"
            fill="currentColor"
        />
        <path
            d="M9.33301 17.8181V21.212L17.8179 27.5757V16.5454L15.4421 14.7635C12.9221 12.8757 9.33301 14.6702 9.33301 17.8181Z"
            fill="currentColor"
        />
    </g>
    <defs>
        <clipPath id="clip0_1099_11560">
            <rect width="37.3333" height="28" fill="white" transform="translate(9.33301 14)" />
        </clipPath>
    </defs>
</svg>
