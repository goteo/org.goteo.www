<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    interface Props {
        type: "own" | "foreign";
        name: string;
        message: string;
        date: string;
        photo?: string;
        class?: ClassNameValue;
    }

    let { type, name, message, date, photo, class: classes }: Props = $props();

    let isOwn = $derived(type === "own");
</script>

<div class={twMerge("flex w-full items-start gap-3", classes)}>
    <!-- Logo -->
    <div class="size-16 shrink-0 overflow-hidden rounded-lg">
        {#if photo}
            <img src={photo} alt={name} class="h-full w-full object-cover" />
        {:else if isOwn}
            <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect width="64" height="64" rx="8" fill="var(--color-primary)" />
                <path
                    d="M32.3156 14.5034C32.4028 14.4851 32.4119 14.5444 32.418 14.6067C33.8836 19.1802 36.0055 22.1742 38.761 25.2792C41.3975 28.2497 44.4463 31.0628 44.6956 36.2596C44.8912 40.3436 43.108 43.6454 41.2172 45.7C39.1074 47.9939 35.682 49.5727 32.111 49.4974C28.4401 49.4191 25.4353 47.7956 23.3118 45.3929C21.1967 43.0001 19.7432 39.9711 20.038 35.8484C20.4707 29.7889 25.0101 26.8298 27.9164 23.0217C29.8057 20.5438 31.1243 17.9808 32.3156 14.5034ZM24.7441 37.0813C24.7805 39.8472 26.2719 42.3723 28.3256 43.6492C31.2228 45.4499 35.253 44.9885 37.6364 42.6216C38.8944 41.3735 39.7485 39.6314 39.9895 37.0813C36.8081 37.0813 36.0821 37.0341 32.3854 37.0341C32.3854 34.5022 32.4187 31.8123 32.4187 29.2819C27.9983 29.2705 24.6903 32.925 24.7441 37.0813Z"
                    fill="var(--color-black)"
                />
            </svg>
        {:else}
            <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect width="64" height="64" rx="8" fill="var(--color-grey)" />
                <path
                    d="M32.3156 14.5034C32.4028 14.4851 32.4119 14.5444 32.418 14.6067C33.8836 19.1802 36.0055 22.1742 38.761 25.2792C41.3975 28.2497 44.4463 31.0628 44.6956 36.2596C44.8912 40.3436 43.108 43.6454 41.2172 45.7C39.1074 47.9939 35.682 49.5727 32.111 49.4974C28.4401 49.4191 25.4353 47.7956 23.3118 45.3929C21.1967 43.0001 19.7432 39.9711 20.038 35.8484C20.4707 29.7889 25.0101 26.8298 27.9164 23.0217C29.8057 20.5438 31.1243 17.9808 32.3156 14.5034ZM24.7441 37.0813C24.7805 39.8472 26.2719 42.3723 28.3256 43.6492C31.2228 45.4499 35.253 44.9885 37.6364 42.6216C38.8944 41.3735 39.7485 39.6314 39.9895 37.0813C36.8081 37.0813 36.0821 37.0341 32.3854 37.0341C32.3854 34.5022 32.4187 31.8123 32.4187 29.2819C27.9983 29.2705 24.6903 32.925 24.7441 37.0813Z"
                    fill="var(--color-black)"
                />
            </svg>
        {/if}
    </div>

    <!-- Mensaje -->
    <div
        class={twMerge(
            "flex min-h-16 flex-1 flex-col items-end justify-end",
            isOwn
                ? "bg-primary border-primary text-secondary rounded-tl-2xl rounded-tr-2xl rounded-br-none rounded-bl-2xl border px-4 pt-4 pb-2"
                : "border-secondary text-content rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-none border bg-white px-4 py-2",
        )}
    >
        {#if !isOwn}
            <span class="text-secondary self-stretch text-sm font-semibold">{name}</span>
        {/if}
        <p class="self-stretch text-sm leading-relaxed">{message}</p>
        <span class={twMerge("text-xs", isOwn ? "text-secondary" : "text-content")}>
            {date}
        </span>
    </div>
</div>
