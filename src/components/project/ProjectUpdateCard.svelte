<script lang="ts">
    import ActiveFilterIcon from "../../svgs/ActiveFilterIcon.svelte";
    import Button from "../library/Button.svelte";
    import { t } from "../../i18n/store";
    import {apiUsersIdGet, type ProjectUpdate } from "../../openapi/client/index";
    import { twMerge } from "tailwind-merge";
    import type { MouseEventHandler } from "svelte/elements";
    import { renderMarkdown } from "../../utils/renderMarkdown";
    import { onMount } from "svelte";
    import type { User } from "../../openapi/client/types.gen.ts";
    import { extractId } from "../../utils/extractId.ts";

    interface Props {
        update: ProjectUpdate;
        type?: "small" | "large";
        onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
        isActive?: boolean;
    }

    let { update, type, onClick, isActive }: Props = $props();

    let cardClasses = $state("");
    let author: User | undefined = $state(undefined);

    function formatDate(date: string, locale?: string): string {
        const options: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "short",
            year: "numeric",
        };

        return new Date(date).toLocaleDateString(locale, options);
    }

    async function getAuthorName(update: ProjectUpdate): Promise<string | undefined> {
        const authorId: string | null = extractId(update.author);
        if (!authorId) return undefined;

        await apiUsersIdGet({
            path: { id: authorId },
        }).then((data) => {
            author = data.data!;
        });

        return author?.displayName;
    }

    onMount(async () => {
        type = author ? "large" : "small";
    });

    $effect(() => {
        isActive;
        cardClasses = isActive ? "opacity-100" : "";
    });
</script>

{#if type === "small"}
    <div
        class={twMerge(
            "flex w-[34.625rem] flex-col gap-6 rounded-4xl bg-white p-6 opacity-48",
            cardClasses,
        )}
    >
        <div class="flex flex-col gap-4">
            <div class="text-secondary flex flex-row gap-0.5 text-2xl font-bold">
                {formatDate(update.date ?? "")}
                <div class="pt-1">
                    <ActiveFilterIcon />
                </div>
            </div>
        </div>
        <div
            class="bg-light-pink relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl bg-cover p-5"
        >
            <h2 class="font-body text-[2.5rem] leading-12 font-bold text-ellipsis text-white">
                {update.title}
            </h2>
            <svg
                class="absolute -top-[19.25rem] left-[6.1875rem]"
                width="681"
                height="964.575"
                viewBox="0 0 407 533"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    opacity="0.08"
                    d="M339.41 -307.908C341.812 -308.41 342.063 -306.776 342.23 -305.059C382.622 -179.016 441.101 -96.5034 517.041 -10.932C589.701 70.9316 673.723 148.459 680.594 291.679C685.983 404.231 636.839 495.227 584.73 551.849C526.585 615.069 432.183 658.578 333.771 656.504C232.603 654.346 149.792 609.602 91.271 543.386C32.9799 477.443 -7.07829 393.966 1.04613 280.346C12.9717 113.351 138.075 31.8013 218.171 -73.1467C270.238 -141.436 306.579 -212.072 339.41 -307.908ZM130.744 314.323C131.747 390.552 172.849 460.14 229.449 495.332C309.294 544.957 420.362 532.242 486.047 467.011C520.717 432.615 544.254 384.603 550.896 314.323C463.219 314.323 443.211 313.024 341.332 313.024C341.332 243.247 342.251 169.114 342.251 99.3786C220.426 99.0644 129.262 199.781 130.744 314.323Z"
                    fill="#3D3D3D"
                />
            </svg>
        </div>
    </div>
{:else if type === "large"}
    <div
        class={twMerge(
            "bg-soft-purple border-variant1 flex w-[49.063rem] flex-col gap-6 rounded-4xl border p-6 shadow-sm",
            cardClasses,
        )}
    >
        <div class="flex flex-col gap-4">
            <div class="text-secondary flex flex-row gap-0.5 text-2xl font-bold">
                {formatDate(update.date ?? "")}
                <div class="pt-1">
                    <ActiveFilterIcon />
                </div>
            </div>
            {#if update.cover}
                <img
                    src={update.cover}
                    alt={update.title}
                    class="no-select h-[16.8rem] shrink-0 self-stretch rounded-3xl"
                    draggable="false"
                />
            {/if}
        </div>
        <div class="flex h-full flex-col justify-between">
            <div class="flex flex-col gap-4">
                <h2 class="text-secondary text-[2rem] leading-10 font-bold">{update.title}</h2>
                {#if update.subtitle || update.body}
                    <div class="flex flex-col gap-2 leading-6">
                        <p class="text-base font-bold text-black">{update.subtitle}</p>
                        <p
                            class="text-content line-clamp-2 text-base font-normal text-ellipsis ordinal"
                        >
                            {#await renderMarkdown(update.body) then content}
                                {@html content}
                            {/await}
                        </p>
                    </div>
                {/if}
            </div>
            <div class="flex w-full items-end justify-between">
                <span class="text-content flex text-sm font-medium">
                    {$t("project.tabs.updates.by")}
                    <strong class="font-bold text-black"> {getAuthorName(update)}</strong>
                </span>
                <Button kind="ghost" onclick={onClick}>
                    {$t("project.tabs.updates.content.btn.read-more")}
                </Button>
            </div>
        </div>
    </div>
{/if}
