<script lang="ts">
    import BaseActivityCard from "./BaseActivityCard.svelte";
    import { client } from "../../openapi/client/client.gen.ts";
    import { apiUsersIdOrHandleGetUrl } from "../../openapi/client/operation-paths.gen.ts";
    import { apiAccountingsIdGet, apiProjectsGetCollection } from "../../openapi/client/sdk.gen.ts";
    import { projectCache } from "../../stores/projectCache";
    import { getDefaultCurrency } from "../../utils/consts";
    import { formatAmountWithSymbol } from "../../utils/currencies";
    import { extractId } from "../../utils/extractId";
    import { toCollectionItems } from "../../utils/hydra.ts";
    import { sumMoney } from "../../utils/money";
    import LoadingSpinner from "../search/LoadingSpinner.svelte";

    import type { MoneyOutput, Project, User } from "../../openapi/client/types.gen.ts";
    import type { ProjectsSummary } from "../../types/me-page";

    interface Props {
        /**
         * Current language locale
         */
        lang: string;

        /**
         * Filter period (e.g. "2025"). Only used to re-fetch on change.
         */
        period?: string;

        /**
         * Authenticated user whose projects are listed
         */
        user: User;
    }

    let { lang, period, user }: Props = $props();

    let summary = $state<ProjectsSummary | undefined>(undefined);
    let projectsPromise = $state<Promise<ProjectsSummary | undefined>>(Promise.resolve(undefined));

    // Determine if this card has data
    const hasData = $derived(!!(summary && summary.count > 0));

    // Formatted total raised
    const formattedTotal = $derived(
        summary?.totalRaised
            ? formatAmountWithSymbol(summary.totalRaised.amount, summary.totalRaised.currency, lang)
            : "",
    );

    async function fetchProjects() {
        try {
            const headers = {
                "Accept-Language": lang,
            };

            // Fetch user's owned projects - using user IRI as owner
            const userIri = client.buildUrl({
                url: apiUsersIdOrHandleGetUrl,
                path: { idOrHandle: user.id },
            });

            const { data: projectsResponse, error: projectsError } = await apiProjectsGetCollection(
                {
                    baseUrl: "/api/relay",
                    query: {
                        owner: userIri,
                        itemsPerPage: 3,
                    },
                    headers,
                },
            );

            if (projectsError) {
                console.error("Failed to fetch projects:", projectsError);
                throw projectsError;
            }

            const projects = toCollectionItems<Project>(projectsResponse);
            const projectsCount = Array.isArray(projectsResponse)
                ? projectsResponse.length
                : projects.length;

            // Use session-level cache for project details (persists across component mounts)
            // Add owned projects to the cache first
            projectCache.addMany(projects);

            // Sum the balance of each owned project's accounting
            const accountingIds = Array.from(
                new Set(
                    projects
                        .map((project) => extractId(project.accounting))
                        .filter((id): id is string => Boolean(id)),
                ),
            );

            let projectsTotalAmount = 0;
            let projectsTotalCurrency: string | null = null;

            if (accountingIds.length > 0) {
                const accountingResults = await Promise.all(
                    accountingIds.map(async (accountingId) => {
                        try {
                            const { data, error } = await apiAccountingsIdGet({
                                baseUrl: "/api/relay",
                                path: { id: accountingId },
                                headers,
                            });

                            if (error) {
                                console.warn("Failed to fetch accounting", {
                                    accountingId,
                                    error,
                                });
                                return null;
                            }

                            return data ?? null;
                        } catch (accountingError) {
                            console.warn("Error fetching accounting", {
                                accountingId,
                                accountingError,
                            });
                            return null;
                        }
                    }),
                );

                const projectBalances = accountingResults
                    .map((a) => a?.balance)
                    .filter((b): b is MoneyOutput => b != null && typeof b.amount === "number");

                if (projectBalances.length > 0) {
                    const total = sumMoney(projectBalances);
                    projectsTotalAmount = total.amount ?? 0;
                    projectsTotalCurrency = total.currency ?? getDefaultCurrency();
                }
            }

            // Map projects to recent projects
            const recentProjects = projects.slice(0, 3).map((project) => {
                // Validate that slug is not numeric (should never happen for owned projects, but be defensive)
                const hasValidSlug = project.slug && isNaN(Number(project.slug));

                if (!hasValidSlug) {
                    console.error("Owned project has invalid or missing slug", {
                        projectId: project.id,
                        projectSlug: project.slug,
                        projectTitle: project.title,
                    });
                }

                return {
                    id: project.id?.toString() || "",
                    title: project.title || "",
                    // Only use slug if it's valid (not numeric or empty)
                    slug: hasValidSlug ? project.slug : "",
                    status: (project.status as any) || "in_draft",
                    createdAt: project.dateCreated || new Date().toISOString(),
                };
            });

            summary = {
                count: projectsCount,
                totalRaised: {
                    amount: projectsTotalAmount,
                    currency: projectsTotalCurrency ?? getDefaultCurrency(),
                },
                recentProjects,
            };
            return summary;
        } catch (err) {
            console.error("Error fetching projects data:", err);
            summary = undefined;
        } finally {
            // nop
        }
    }

    // Fetch on mount and re-fetch when the period changes
    $effect(() => {
        if (period) {
            projectsPromise = fetchProjects();
        }
    });
</script>

{#await projectsPromise}
    <!-- Loading state -->
    <div class="border-grey flex min-h-96 items-center justify-center rounded-4xl border bg-white">
        <div class="flex items-center gap-2">
            <LoadingSpinner />
            <p class="text-content">Loading...</p>
        </div>
    </div>
{:then summary}
    <BaseActivityCard
        titleKey="pages.me.projects.title"
        leftStatLabel="pages.me.projects.count"
        leftStatValue={summary?.count ?? 0}
        rightStatLabel="pages.me.projects.raised"
        rightStatValue={formattedTotal}
        recentTitleKey="pages.me.projects.recent"
        illustrationPath="/images/profile/ilustration-project.png"
        primaryActionLabel="pages.me.projects.viewAll"
        primaryActionHref={lang === "es" ? "/me/projects" : `/${lang}/me/projects`}
        secondaryActionLabel="pages.me.projects.createNew"
        secondaryActionHref={lang === "es" ? "/projects/new" : `/${lang}/projects/new`}
        isEmpty={!hasData}
        emptyMessageKey="pages.me.projects.empty"
        emptyCtaLabel="pages.me.projects.create"
        emptyCtaLink={lang === "es" ? "/projects/new" : `/${lang}/projects/new`}
    >
        {#if summary?.recentProjects}
            {#each summary.recentProjects.slice(0, 2) as project}
                <li class="flex items-start gap-2">
                    {#if project.slug}
                        <a
                            href={lang === "es"
                                ? `/project/${project.slug}`
                                : `/${lang}/project/${project.slug}`}
                            class="text-content hover:text-secondary focus:text-secondary text-sm no-underline focus:outline-none"
                        >
                            {project.title}
                        </a>
                    {:else}
                        <span class="text-tertiary text-sm italic">
                            {project.title}
                        </span>
                    {/if}
                </li>
            {/each}
        {/if}
    </BaseActivityCard>
{:catch projectsError}
    <div class="border-grey flex min-h-96 items-center justify-center rounded-4xl border bg-white">
        <p class="text-tertiary font-semibold">{projectsError.message}</p>
    </div>
{/await}
