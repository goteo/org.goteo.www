<script lang="ts">
    import { onMount } from "svelte";
    import {
        type Project,
        type Accounting,
        type ApiAccountingBalancePointsGetCollectionData,
        apiProjectsIdOrSlugGet,
    } from "../../openapi/client/index";
    import Tags from "../Tags.svelte";
    import Countdown from "../Countdown.svelte";
    import LanguagesDropdown from "../LanguagesDropdown.svelte";
    import Sharebutton from "./Sharebutton.svelte";

    import Tabs from "./Tabs.svelte";

    import Card from "./Card.svelte";
    import Player from "../Player/Player.svelte";
    import Banner from "./Banner.svelte";
    import { setLocale, t } from "../../i18n/store";
    import ArrowRightIcon from "../../svgs/ArrowRightIcon.svelte";
    import RememberIcon from "../../svgs/RememberIcon.svelte";
    import { getDefaultLanguage } from "../../utils/consts";
    import TopRewards from "./TopRewards.svelte";
    import Button from "../library/Button.svelte";

    let {
        lang = $bindable(),
        project,
        accounting,
        ownerName,
        totalSupports,
        balancePoints,
    }: {
        lang: string;
        project: Project;
        accounting: Accounting;
        ownerName: string;
        totalSupports: number;
        balancePoints: ApiAccountingBalancePointsGetCollectionData;
    } = $props();

    let poster = { src: project.video?.thumbnail || "", alt: "Miniatura del video" };

    const countdownEnd = project.calendar?.optimum ? new Date(project.calendar.optimum) : undefined;

    async function getProjectData(code?: string) {
        lang = code ? code : getDefaultLanguage();

        setLocale(lang);

        const { data } = await apiProjectsIdOrSlugGet({
            path: { idOrSlug: project?.id!.toString() },
            headers: { "Accept-Language": lang },
        });

        project = data!;
    }

    let tabsComponent: any;

    function scrollToRewards() {
        if (tabsComponent?.activateRewardsTab) {
            tabsComponent.activateRewardsTab();
        }
        setTimeout(() => {
            const rewardsElement = document.getElementById("tab-rewards");
            if (rewardsElement) {
                rewardsElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }, 100);
    }
</script>

<section class="wrapper">
    <div class="my-10 flex w-full flex-col-reverse gap-5 lg:flex-row lg:justify-between">
        <div class="flex w-full flex-col gap-2.5 lg:w-[70%]">
            <div class="flex flex-col gap-2">
                <h3 class="text-content text-xl font-bold lg:text-2xl">
                    {$t("project.owner")}
                    <span class="font-bold text-black underline"> {ownerName}</span>
                </h3>
                <h1 class="text-content text-3xl font-bold lg:text-4xl">
                    {project.title}
                </h1>
            </div>

            <div>
                <p class="text-content transition-all duration-300 ease-in-out">
                    {project.subtitle}
                </p>
            </div>
        </div>

        <div class="flex w-full flex-col gap-4 lg:w-[30%] lg:justify-between">
            <div class="flex justify-end">
                <LanguagesDropdown
                    {lang}
                    languages={project.locales!}
                    select={(lang: string) => getProjectData(lang)}
                />
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
            <Card
                {project}
                {accounting}
                {balancePoints}
                {totalSupports}
                onScrollToRewards={scrollToRewards}
            />
        </div>
    </div>

    <div class="mb-12 flex w-full flex-col justify-between gap-4 lg:flex-row">
        <Tags {project} {lang} />
        <div class="flex flex-row justify-between gap-6">
            <Sharebutton {project} />
            <Button kind="invert" size="sm" class="px-0">
                <RememberIcon />
                {$t("project.actions.remember")}
            </Button>
        </div>
    </div>
    <div class="flex flex-col gap-8">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-black">
                {$t("reward.trending")}
            </h2>
            <Button kind="secondary" class="hidden lg:flex" onclick={scrollToRewards}>
                <ArrowRightIcon />{$t("reward.showAll")}
            </Button>
        </div>
        <TopRewards bind:lang {project} />
        <Button kind="secondary" class="lg:hidden" onclick={scrollToRewards}>
            <ArrowRightIcon />{$t("reward.showAll")}
        </Button>
    </div>
    <Banner {ownerName} />
</section>
<Tabs bind:this={tabsComponent} bind:lang bind:project {accounting} />
