<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        class?: ClassNameValue;
        width?: string | number;
        height?: string | number;
    }

    let { class: classes = "", width = "32", height = "32" }: Props = $props();
</script>

<svg
    {width}
    {height}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={twMerge("text-secondary", classes)}
>
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M16.4138 5.28653C16.1509 5.16702 15.8491 5.16702 15.5862 5.28653L7.41661 8.99998L16 12.9015L24.5834 8.99998L16.4138 5.28653ZM26 10.553L17 14.6439V26.447L25.4138 22.6225C25.7708 22.4603 26 22.1043 26 21.7122V10.553ZM15 26.447V14.6439L6 10.553V21.7122C6 22.1043 6.2292 22.4603 6.5862 22.6225L15 26.447ZM14.7586 3.4658C15.5474 3.10727 16.4526 3.10727 17.2414 3.4658L26.2414 7.55671C27.3124 8.04352 28 9.11138 28 10.2878V21.7122C28 22.8886 27.3124 23.9564 26.2414 24.4433L17.2414 28.5342C16.4526 28.8927 15.5474 28.8927 14.7586 28.5342L5.75859 24.4433C4.68761 23.9564 4 22.8886 4 21.7122V10.2878C4 9.11138 4.68761 8.04352 5.75859 7.55671L14.7586 3.4658Z"
        fill="currentColor"
    />
</svg>
