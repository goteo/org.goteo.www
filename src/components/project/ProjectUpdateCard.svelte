<script lang="ts">
    import { onMount } from "svelte";
    import { twMerge } from "tailwind-merge";

    import Bullet from "../../components/icons/Bullet.svelte";
    import { t } from "../../i18n/store";
    import { locale } from "../../i18n/store";
    import { apiUsersIdOrHandleGet, type ProjectUpdate } from "../../openapi/client/index";
    import { formatDate } from "../../utils/dates.ts";
    import { extractId } from "../../utils/extractId.ts";
    import { renderMarkdown } from "../../utils/renderMarkdown";
    import Button from "../library/Button.svelte";

    import type { User } from "../../openapi/client/types.gen.ts";
    import type { MouseEventHandler } from "svelte/elements";

    export type ProjectUpdateCardType = "contracted" | "expanded" | "mobile";

    interface Props {
        update: ProjectUpdate;
        type?: ProjectUpdateCardType;
        onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
        isActive?: boolean;
    }

    let { update, type, onClick, isActive }: Props = $props();

    let cardClasses = $state("");
    let author: User | undefined = $state(undefined);

    async function getAuthor(update: ProjectUpdate): Promise<User | undefined> {
        const authorId: string | null = extractId(update.author!);
        if (!authorId) return undefined;

        const { data: user, error: err } = await apiUsersIdOrHandleGet({
            path: { idOrHandle: authorId },
        });

        if (err) {
            throw new Error(err.description!);
        }

        return user;
    }

    onMount(async () => {
        author = await getAuthor(update);
    });

    $effect(() => {
        isActive;
        cardClasses = isActive ? "opacity-100" : "";
    });

    function getCardClasses(): string {
        const baseClasses =
            "flex shrink-0 flex-col overflow-hidden rounded-[1.25rem] border border-[#E7E1F1] bg-[#FCFAFF] p-4 shadow-sm transition-[width,opacity,box-shadow] duration-300 ease-out";

        if (type === "expanded") {
            return twMerge(baseClasses, "h-[24.5rem] w-[30.75rem] gap-6", cardClasses);
        }

        if (type === "mobile") {
            return twMerge(baseClasses, "h-[25.625rem] w-[13.5rem] gap-3", cardClasses);
        }

        return twMerge(baseClasses, "h-[24.5rem] w-[21.75rem] gap-6", cardClasses);
    }
</script>

<div class={getCardClasses()}>
    {#if type === "contracted"}
        <div class="flex flex-col gap-4">
            <div class="text-secondary flex shrink-0 flex-row gap-0.5 text-2xl leading-6 font-bold">
                {#if update.date}
                    {formatDate(new Date(update.date), $locale)}
                {/if}
                <div class="pt-0.5">
                    <Bullet />
                </div>
            </div>
            {#if update.cover}
                <img
                    src={update.cover}
                    alt={update.title}
                    class="no-select h-[268.6px] w-full shrink-0 self-stretch rounded-3xl object-cover"
                    draggable="false"
                />
            {/if}
        </div>
        <div class="flex min-h-0 flex-1 flex-col justify-between gap-6">
            <div class="flex flex-col gap-4">
                <h2 class="text-secondary line-clamp-1 text-double leading-7 font-bold">
                    {update.title}
                </h2>
                {#if update.subtitle || update.body}
                    <div class="flex flex-col gap-2 leading-5">
                        <p class="line-clamp-2 text-base font-bold text-black">{update.subtitle}</p>
                        <p class="text-content line-clamp-2 text-base font-normal text-ellipsis">
                            {#await renderMarkdown(update.body) then content}
                                {@html content}
                            {/await}
                        </p>
                    </div>
                {/if}
            </div>
            <div class="flex w-full items-end justify-between gap-3">
                <span class="text-content line-clamp-1 text-xs font-medium">
                    {$t("pages.project.view.tabs.updates.by")}
                    <strong class="font-bold text-black"> {author?.displayName}</strong>
                </span>
                <Button kind="ghost" onclick={onClick}>
                    {$t("pages.project.view.tabs.updates.content.btn.readMore")}
                </Button>
            </div>
        </div>
    {:else if type === "expanded"}
        <div class="flex shrink-0 flex-col gap-4">
            <div class="text-secondary flex flex-row gap-0.5 text-2xl leading-6 font-bold">
                {#if update.date}
                    {formatDate(new Date(update.date), $locale)}
                {/if}
                <div class="pt-0.5">
                    <Bullet />
                </div>
            </div>
            {#if update.cover}
                <img
                    src={update.cover}
                    alt={update.title}
                    class="no-select h-[268.6px] w-full shrink-0 self-stretch rounded-3xl object-cover"
                    draggable="false"
                />
            {/if}
        </div>
        <div class="flex min-h-0 flex-1 flex-col justify-between gap-6">
            <div class="flex flex-col gap-4">
                <h2 class="text-secondary line-clamp-1 text-xl leading-7 font-bold">
                    {update.title}
                </h2>
                {#if update.subtitle || update.body}
                    <div class="flex flex-col gap-2 leading-5">
                        <p class="line-clamp-2 text-base font-bold text-black">{update.subtitle}</p>
                        <p class="text-content line-clamp-2 text-base font-normal text-ellipsis">
                            {#await renderMarkdown(update.body) then content}
                                {@html content}
                            {/await}
                        </p>
                    </div>
                {/if}
            </div>
            <div class="flex w-full items-end justify-between gap-3">
                <span class="text-content text-xs font-medium">
                    {$t("pages.project.view.tabs.updates.by")}
                    <strong class="font-bold text-black"> {author?.displayName}</strong>
                </span>
                <Button kind="ghost" onclick={onClick}>
                    {$t("pages.project.view.tabs.updates.content.btn.readMore")}
                </Button>
            </div>
        </div>
    {:else if type === "mobile"}
        <div class="flex shrink-0 flex-col gap-3">
            <div class="text-secondary flex flex-row gap-0.5 text-2xl leading-6 font-bold">
                {#if update.date}
                    {formatDate(new Date(update.date), $locale)}
                {/if}
                <div class="pt-0.5">
                    <Bullet />
                </div>
            </div>
            {#if update.cover}
                <img
                    src={update.cover}
                    alt={update.title}
                    class="no-select h-[268.6px] w-full shrink-0 self-stretch rounded-2xl object-cover"
                    draggable="false"
                />
            {/if}
        </div>
        <div class="flex min-h-0 flex-1 flex-col justify-between gap-6">
            <div class="flex flex-col gap-2">
                <h2 class="text-secondary line-clamp-2 text-lg leading-5 font-bold">
                    {update.title}
                </h2>
                {#if update.subtitle || update.body}
                    <div class="flex flex-col gap-2 leading-5">
                        <p class="line-clamp-2 text-base font-bold text-black">
                            {update.subtitle}
                        </p>
                        <p class="text-content line-clamp-2 text-[0.6875rem] font-normal">
                            {#await renderMarkdown(update.body) then content}
                                {@html content}
                            {/await}
                        </p>
                    </div>
                {/if}
            </div>
            <div class="flex w-full flex-col gap-3">
                <span class="text-content line-clamp-1 text-center text-[0.6875rem] font-medium">
                    {$t("pages.project.view.tabs.updates.by")}
                    <strong class="font-bold text-black"> {author?.displayName}</strong>
                </span>
                <Button kind="ghost" onclick={onClick}>
                    {$t("pages.project.view.tabs.updates.content.btn.readMore")}
                </Button>
            </div>
        </div>
    {/if}
</div>
