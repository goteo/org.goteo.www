<script lang="ts">
    import Banner from "./Banner.svelte";
    import Card from "./Card.svelte";
    import Tabs from "./Tabs.svelte";
    import TopRewards from "./TopRewards.svelte";
    import { languagesList } from "../../i18n/locales";
    import { locale, setLocale, t } from "../../i18n/store";
    import {
        type Project,
        type Accounting,
        apiProjectsIdOrSlugGet,
        type User,
        type ProjectCalendar,
        type AccountingBalancePoint,
    } from "../../openapi/client/index";
    import Arrow from "../icons/Arrow.svelte";
    import RememberIcon from "../../svgs/RememberIcon.svelte";
    import { getLanguageDisplayName } from "../../utils/lang";
    import Countdown from "../Countdown.svelte";
    import LanguagesDropdown from "../LanguagesDropdown.svelte";
    import Button from "../library/Button.svelte";
    import Sharebutton from "../library/Share/ShareButton.svelte";
    import Toast from "../library/Toast.svelte";
    import Player from "../Player/Player.svelte";
    import ProjectTags from "../ProjectTags.svelte";
    import Thtml from "../Thtml.svelte";

    let {
        project,
        accounting,
        owner,
        totalSupports,
        balancePoints,
    }: {
        project: Project;
        accounting: Accounting;
        owner: User;
        totalSupports: number;
        balancePoints: AccountingBalancePoint[];
    } = $props();

    const projectDeadline = $derived(getCurrentDeadline(project.calendar!));

    function getCurrentDeadline(calendar: ProjectCalendar) {
        const now = new Date();

        const minimum = new Date(calendar.minimum!);
        if (now < minimum) {
            return minimum;
        }

        if (!calendar.optimum) {
            return undefined;
        }

        const optimum = new Date(calendar.optimum);
        if (now < optimum) {
            return optimum;
        }

        return undefined;
    }

    let projectLanguage = $state(guessProjectLanguage(project.locales!));

    function guessProjectLanguage(pLangs: string[]): string {
        for (const navLang of navigator.languages) {
            const uLang = navLang.split("-")[0].toLowerCase();

            if (pLangs.includes(uLang)) {
                return uLang;
            }
        }

        return pLangs[0];
    }

    async function changeProjectLanguage(lang: string) {
        projectLanguage = lang;

        if (Object.keys(languagesList).includes(projectLanguage)) {
            setLocale(projectLanguage);
        }

        const { data, error } = await apiProjectsIdOrSlugGet({
            path: { idOrSlug: project?.id!.toString() },
            headers: { "Accept-Language": lang },
        });

        if (error || !data) {
            console.error(error);
        }

        project = data!;
    }

    let langMismatch = $state(false);
    let attemptedLang = $state("");

    locale.subscribe((locale) => {
        if (!project.locales?.includes(locale)) {
            langMismatch = true;
            attemptedLang = locale;
        } else {
            projectLanguage = locale;
        }
    });

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
    <Toast variant="warning" bind:showToast={langMismatch} class="mb-6 w-full">
        {$t("lang.error.notAvailable", { lang: getLanguageDisplayName(attemptedLang)! })}
    </Toast>

    <div class="my-10 flex w-full flex-col-reverse gap-5 lg:flex-row lg:justify-between">
        <div class="flex w-full flex-col gap-2.5 lg:w-[70%]">
            <div class="flex flex-col gap-2">
                <h3 class="text-content text-xl font-bold lg:text-2xl">
                    <Thtml
                        key="pages.project.view.owner"
                        vars={{
                            owner: `<span class="font-bold text-black underline">${owner.displayName}</span>`,
                        }}
                    />
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
                    languages={project.locales!}
                    selected={projectLanguage}
                    onSelect={changeProjectLanguage}
                />
            </div>

            <div class="hidden lg:block">
                <Countdown deadline={projectDeadline} />
            </div>
        </div>
    </div>

    <div class="mb-6 flex h-auto flex-col items-stretch justify-between gap-6 lg:h-132 lg:flex-row">
        <div class="h-64 w-full lg:h-full lg:w-[70%]">
            <Player
                src={project.video?.src || ""}
                title={project.title || ""}
                thumbnails={project.video?.thumbnail || ""}
                poster={{ src: project.video?.cover || "", alt: "" }}
            />
        </div>
        <div class="flex h-auto w-full flex-col gap-4 lg:h-full lg:w-[30%]">
            <div class="lg:hidden">
                <Countdown deadline={projectDeadline} />
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
        <ProjectTags {project} />
        <div class="flex flex-row justify-between gap-6">
            <Sharebutton shareText={project.title ?? ""} projectSlug={project.slug ?? ""} />
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
                <Arrow />{$t("reward.showAll")}
            </Button>
        </div>
        <TopRewards bind:lang={projectLanguage} {project} />
        <Button kind="secondary" class="lg:hidden" onclick={scrollToRewards}>
            <Arrow />{$t("reward.showAll")}
        </Button>
    </div>
    <Banner ownerName={owner.displayName || ""} />
</section>
<Tabs bind:this={tabsComponent} bind:lang={projectLanguage} bind:project {accounting} />
