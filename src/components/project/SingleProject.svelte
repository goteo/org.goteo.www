<script lang="ts">
    import Slider from "./../Admin/Slider.svelte";
    import { onMount } from "svelte";
    import type {
        Project,
        Accounting,
        ApiAccountingBalancePointsGetCollectionData,
    } from "../../openapi/client/index";
    import Tags from "../Tags.svelte";
    import { getTerritoryTag } from "../../utils/getTerritoryTag";
    import Countdown from "../Countdown.svelte";
    import LanguagesDropdown from "../LanguagesDropdown.svelte";

    import { languagesList } from "../../i18n/locales";
    import Tabs from "./Tabs.svelte";

    import Card from "./Card.svelte";
    import Player from "../Player/Player.svelte";
    import Rewards from "../Rewards.svelte";
    import Banner from "./Banner.svelte";
    import { t } from "../../i18n/store";

    export let project: Project;
    export let accounting: Accounting;
    export let ownerName: string;
    export let balancePoints: ApiAccountingBalancePointsGetCollectionData;

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
    const slides = [
        { title: "Total aportes:", amount: "250,95€" },
        { title: "Total Tips:", amount: "250,96€" },
        { title: "Total comisiones:", amount: "250,97€" },
        { title: "Pasar a operativa:", amount: "250,98€" },
        { title: "Slide 5", amount: "250,99€" },
    ];

    onMount(() => {
        const twoLinesHeight = parseFloat(getComputedStyle(paragraphRef).lineHeight) * 2;
        if (paragraphRef.scrollHeight > twoLinesHeight + 1) {
            showToggle = true;
        }
    });
</script>

<section class="wrapper">
    <div class="my-10 flex w-full flex-row justify-between gap-5">
        <div class="flex w-4/5 flex-col gap-2.5">
            <div class="flex flex-col gap-2">
                <h3 class="text-2xl/[32px] font-bold text-[#575757]">
                    {$t("project.owner")}
                    <span class="text-tertiary text-2xl font-bold underline"> {ownerName}</span>
                </h3>
                <h1 class="text-[40px]/[48px] font-bold text-[#575757]">
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

        <div class="flex w-1/5 flex-col justify-between">
            <LanguagesDropdown {languages} />

            <Countdown {countdownEnd} />
        </div>
    </div>

    <div class="flex items-stretch justify-between gap-6">
        <div class="h-full w-[70%]">
            <!-- <Player
                src={project.video?.src || ""}
                title={project.title || ""}
                thumbnails={project.video?.thumbnail || ""}
                {poster}
            /> -->
        </div>
        <div class="h-full w-[30%]">
            <Card {project} {accounting} {balancePoints} />
        </div>
    </div>

    <Tags {tags} />

    <Rewards {project} {limit} />
    <Banner {ownerName} />
    <Slider {slides} />
    <Tabs {project} />
</section>
