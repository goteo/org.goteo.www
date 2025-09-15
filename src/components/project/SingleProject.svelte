<script lang="ts">
    import { onMount } from "svelte";
    import type {
        Project,
        Accounting,
        ApiAccountingBalancePointsGetCollectionData,
        AccountingBalance,
        ProjectSupport,
    } from "../../openapi/client/index";
    import Tags from "../Tags.svelte";
    import { getTerritoryTag } from "../../utils/getTerritoryTag";
    import Countdown from "../Countdown.svelte";
    import LanguagesDropdown from "../LanguagesDropdown.svelte";
    import Sharebutton from "./Sharebutton.svelte";

    import { languagesList } from "../../i18n/locales";
    import Tabs from "./Tabs.svelte";

    import Card from "./Card.svelte";
    import Player from "../Player/Player.svelte";
    import Rewards from "../Rewards.svelte";
    import Banner from "./Banner.svelte";
    import { t } from "../../i18n/store";
    import ArrowRightIcon from "../../svgs/ArrowRightIcon.svelte";
    import RememberIcon from "../../svgs/RememberIcon.svelte";

    export let project: Project;
    export let accounting: Accounting;
    export let accountingBalance: AccountingBalance;
    export let ownerName: string;
    export let balancePoints: ApiAccountingBalancePointsGetCollectionData;
    export let totalSupports: number = 0;

    let poster = { src: project.video?.thumbnail || "", alt: "Miniatura del video" };
    const limit = 3;
    let showFull = false;
    const languages = project?.locales as (keyof typeof languagesList)[];

    const tags = {
        categoryTag: project.category,
        territoryTag: getTerritoryTag(project.territory),
    };

    let paragraphRef: HTMLParagraphElement;
    let showToggle = false;
    const countdownEnd = project.calendar?.optimum ? new Date(project.calendar.optimum) : undefined;

    onMount(() => {
        const twoLinesHeight = parseFloat(getComputedStyle(paragraphRef).lineHeight) * 2;
        if (paragraphRef.scrollHeight > twoLinesHeight + 1) {
            showToggle = true;
        }
    });
</script>

<section class="wrapper">
    <div class="my-10 flex w-full flex-col-reverse gap-5 lg:flex-row lg:justify-between">
        <div class="flex w-full flex-col gap-2.5 lg:w-[70%]">
            <div class="flex flex-col gap-2">
                <h3 class="text-xl font-bold text-[#575757] lg:text-2xl">
                    {$t("project.owner")}
                    <span class="text-tertiary font-bold underline"> {ownerName}</span>
                </h3>
                <h1 class="text-3xl font-bold text-[#575757] lg:text-4xl">
                    {project.title} <span>{ownerName}</span>
                </h1>
            </div>

            <div>
                <p
                    bind:this={paragraphRef}
                    class="text-[#575757] transition-all duration-300 ease-in-out {showFull
                        ? ''
                        : 'line-clamp-2'}"
                >
                    {project.subtitle}
                </p>

                {#if showToggle}
                    <button
                        type="button"
                        class="mt-2 text-sm font-medium text-blue-600 hover:underline"
                        on:click={() => (showFull = !showFull)}
                    >
                        {showFull ? "Ver menos" : "Ver más"}
                    </button>
                {/if}
            </div>
        </div>

        <div class="flex w-full flex-col gap-4 lg:w-[30%] lg:justify-between">
            <div class="flex justify-end">
                <LanguagesDropdown {languages} />
            </div>

            <div class="hidden lg:block">
                <Countdown {countdownEnd} />
            </div>
        </div>
    </div>

    <div class="mb-6 flex h-auto flex-col items-stretch justify-between gap-6 lg:h-132 lg:flex-row">
        <div class="h-64 w-full lg:h-full lg:w-[70%]">
            <Player
                src={project.video?.src || ""}
                title={project.title || ""}
                thumbnails={project.video?.thumbnail || ""}
                {poster}
            />
        </div>
        <div class="flex h-auto w-full flex-col gap-4 lg:h-full lg:w-[30%]">
            <div class="lg:hidden">
                <Countdown {countdownEnd} />
            </div>
            <Card {project} {accountingBalance} {balancePoints} />
        </div>
    </div>

    <div class="mb-12 flex w-full flex-col justify-between gap-4 lg:flex-row">
        <Tags {tags} />
        <div class="flex flex-row justify-between gap-6">
            <Sharebutton {project} />
            <button
                class="text-tertiary flex cursor-pointer flex-row items-center gap-2 p-2 font-bold"
            >
                <RememberIcon /> {$t("project.actions.remember")}</button
            >
        </div>
    </div>
    <div class="flex flex-col gap-8">
        <div class="flex items-center justify-between">
            <h2 class="text-secondary text-2xl font-bold">
                {$t("reward.trending")}
            </h2>
            <button
                class="text-tertiary hidden cursor-pointer items-center gap-4 rounded-3xl bg-[#E6E5F7] px-6 py-4 font-bold transition lg:flex"
            >
                <ArrowRightIcon />{$t("reward.showAll")}
            </button>
        </div>
        <Rewards {project} {limit} />
        <button
            class="text-tertiary flex cursor-pointer items-center gap-4 rounded-3xl bg-[#E6E5F7] px-6 py-4 font-bold transition lg:hidden justify-center"
        >
            <ArrowRightIcon />{$t("reward.showAll")}
        </button>
    </div>
    <Banner {ownerName} />
</section>
<Tabs {project} {accounting} {accountingBalance} />
