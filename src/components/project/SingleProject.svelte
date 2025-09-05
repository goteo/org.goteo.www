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
    export let supports: ProjectSupport[];

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
    <div class="my-10 flex w-full flex-row justify-between gap-5">
        <div class="flex w-[70%] flex-col gap-2.5">
            <div class="flex flex-col gap-2">
                <h3 class="text-2xl/[32px] font-bold text-[#575757]">
                    {$t("project.owner")}
                    <span class="text-tertiary text-2xl font-bold underline"> {ownerName}</span>
                </h3>
                <h1 class="text-[40px]/[48px] font-bold text-[#575757]">
                    {project.title}
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

        <div class="flex w-[30%] flex-col justify-between">
            <div class="flex justify-end">
                <LanguagesDropdown {languages} />
            </div>

            <Countdown {countdownEnd} />
        </div>
    </div>

    <div class="mb-6 flex h-132 items-stretch justify-between gap-6">
        <div class="h-full w-[70%]">
            <Player
                src={project.video?.src || ""}
                title={project.title || ""}
                thumbnails={project.video?.thumbnail || ""}
                {poster}
            />
        </div>
        <div class="h-full w-[30%]">
            <Card {project} {supports} {accountingBalance} {balancePoints} />
        </div>
    </div>

    <div class="mb-12 flex w-full flex-row justify-between">
        <Tags {tags} />
        <div class="flex flex-row items-center gap-6">
            <Sharebutton {project} />
            <button
                class="text-tertiary flex cursor-pointer flex-row items-center gap-2 p-2 font-bold"
            >
                <RememberIcon /> {$t("project.actions.remember")}</button
            >
        </div>
    </div>
    <div>
        <div class="flex items-center justify-between py-10">
            <h2 class="text-secondary text-2xl font-bold">
                {$t("reward.trending")}
            </h2>
            <button
                class="text-tertiary flex cursor-pointer items-center gap-4 rounded-3xl bg-[#E6E5F7] px-6 py-4 font-bold transition"
                ><ArrowRightIcon />{$t("reward.showAll")}</button
            >
        </div>
        <Rewards {project} {limit} />
    </div>
    <Banner {ownerName} />
</section>
<Tabs {project} {accounting} {accountingBalance} />
