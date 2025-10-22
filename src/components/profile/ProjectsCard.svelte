<script lang="ts">
    import BaseActivityCard from "./BaseActivityCard.svelte";
    import { formatAmountWithSymbol } from "../../utils/currencies";
    import type { ActivityData } from "../../types/me-page";

    interface Props {
        /**
         * Current language locale
         */
        lang: string;

        /**
         * Optional activity data for filled state
         * If undefined/null, shows empty state
         */
        data?: ActivityData;
    }

    let { lang, data }: Props = $props();

    // Determine if this card has data
    const hasData = $derived(!!(data?.projects && data.projects.count > 0));

    // Get projects data
    const projectsData = $derived(data?.projects);

    // Formatted total raised
    const formattedTotal = $derived(
        projectsData?.totalRaised
            ? formatAmountWithSymbol(
                  projectsData.totalRaised.amount,
                  projectsData.totalRaised.currency,
                  lang,
              )
            : "",
    );
</script>

<BaseActivityCard
    titleKey="me.projects.title"
    leftStatLabel="me.projects.count"
    leftStatValue={projectsData?.count ?? 0}
    rightStatLabel="me.projects.raised"
    rightStatValue={formattedTotal}
    recentTitleKey="me.projects.recent"
    illustrationPath="/images/profile/ilustration-project.png"
    primaryActionLabel="me.projects.viewAll"
    primaryActionHref={lang === "es" ? "/me/projects" : `/${lang}/me/projects`}
    secondaryActionLabel="me.projects.createNew"
    secondaryActionHref={lang === "es" ? "/projects/new" : `/${lang}/projects/new`}
    isEmpty={!hasData}
    emptyMessageKey="me.projects.empty"
    emptyCtaLabel="me.projects.create"
    emptyCtaLink={lang === "es" ? "/projects/new" : `/${lang}/projects/new`}
>
    {#if projectsData?.recentProjects}
        {#each projectsData.recentProjects.slice(0, 2) as project}
            <li class="flex items-start gap-[8px]">
                <a
                    href={lang === "es"
                        ? `/projects/${project.slug}`
                        : `/${lang}/projects/${project.slug}`}
                    class="font-['Karla'] text-[14px] leading-[20px] font-normal text-[#575757] no-underline hover:text-[#462949]"
                >
                    {project.title}
                </a>
            </li>
        {/each}
    {/if}
</BaseActivityCard>
