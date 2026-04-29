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
    <path
        d="M35.6743 30.0175L36.8312 23.7176H30.0973V21.4895C30.0973 18.1603 31.4034 16.8799 34.7838 16.8799C35.8338 16.8799 36.6789 16.9054 37.1655 16.9566V11.2458C36.2436 10.9896 33.9899 10.7335 32.6839 10.7335C25.7949 10.7335 22.6193 13.986 22.6193 21.003V23.7176H18.3682V30.0175H22.6193V43.7264C24.2144 44.1221 25.8823 44.3335 27.5996 44.3335C28.4452 44.3335 29.2784 44.2814 30.0973 44.1825V30.0175H35.6743Z"
        fill="currentColor"
    />
</svg>
