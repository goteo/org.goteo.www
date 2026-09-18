<script lang="ts">
    import BaseActivityCard from "./BaseActivityCard.svelte";
    import {
        apiProjectSupportsGetCollection,
        apiProjectSupportsmoneyTotalGetCollection,
        apiProjectsIdOrSlugGet,
    } from "../../openapi/client/sdk.gen.ts";
    import { projectCache } from "../../stores/projectCache";
    import { getDefaultCurrency } from "../../utils/consts";
    import { formatAmountWithSymbol } from "../../utils/currencies";
    import { extractId } from "../../utils/extractId";
    import { toCollectionItems } from "../../utils/hydra.ts";
    import { sumMoney } from "../../utils/money";
    import LoadingSpinner from "../search/LoadingSpinner.svelte";

    import type { ProjectSupport, User } from "../../openapi/client/types.gen.ts";
    import type { DonationsSummary } from "../../types/me-page";

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
         * Authenticated user whose donations are listed
         */
        user: User;
    }

    let { lang, period, user }: Props = $props();

    let summary = $state<DonationsSummary | undefined>(undefined);
    let donationsPromise
 = $state<Promise<DonationsSummary | undefined>>(Promise.resolve(undefined));

    const fallbackProjectTitle = $derived(lang === "es" ? "Proyecto" : "Project");

    // Determine if this card has data
    const hasData = $derived(!!(summary && summary.count > 0));

    // Formatted total
    const formattedTotal = $derived(
        summary?.total
            ? formatAmountWithSymbol(summary.total.amount, summary.total.currency, lang)
            : "",
    );

    async function fetchDonations() {
        try {
            const headers = {
                "Accept-Language": lang,
            };

            // Fetch user's donations - using accounting IRI as origin
            const { data: supportsResponse, error: supportsError } =
                await apiProjectSupportsGetCollection({
                    baseUrl: "/api/relay",
                    query: {
                        origin: user.accounting,
                        itemsPerPage: 100,
                    },
                    headers,
                });

            // Try to fetch total money contributed, but it might fail with 500.
            // In that case, we'll calculate it manually from the contributions.
            let totalMoney = null;
            try {
                const response = await apiProjectSupportsmoneyTotalGetCollection({
                    baseUrl: "/api/relay",
                    query: {
                        origin: user.accounting,
                    },
                    headers,
                });
                totalMoney = response.data;
                if (response.error) {
                    console.warn("Total money endpoint returned error, calculating manually:", {
                        error: response.error,
                        user,
                    });
                }
            } catch (err) {
                console.warn("money_total endpoint failed, will calculate manually:", err);
            }

                if (supportsError) {
                    console.error("Failed to fetch contributions:", supportsError);
                    throw new Error("Failed to load donation data");
                }

            const contributions = toCollectionItems<ProjectSupport>(supportsResponse);
            const contributionsCount = Array.isArray(supportsResponse)
                ? supportsResponse.length
                : contributions.length;

            // Project details are cached in a session-level store (projectCache),
            // so only fetch the ones missing from the cache.
            const supportProjectIdOrSlugs = Array.from(
                new Set(
                    contributions
                        .map((support) =>
                            extractId(
                                typeof support.project === "string" ? support.project : undefined,
                            ),
                        )
                        .filter((idOrSlug): idOrSlug is string => Boolean(idOrSlug)),
                ),
            );

            const slugsToFetch = supportProjectIdOrSlugs.filter(
                (idOrSlug) => !projectCache.has(idOrSlug),
            );

            if (slugsToFetch.length > 0) {
                const projectDetailResults = await Promise.all(
                    slugsToFetch.map(async (idOrSlug) => {
                        try {
                            const { data, error } = await apiProjectsIdOrSlugGet({
                                baseUrl: "/api/relay",
                                path: { idOrSlug },
                                headers,
                            });

                            if (error) {
                                console.warn("Failed to fetch project detail for support", {
                                    idOrSlug,
                                    error,
                                });
                                return { idOrSlug, project: null };
                            }

                            return { idOrSlug, project: data ?? null };
                        } catch (fetchError) {
                            console.warn("Error fetching project detail for support", {
                                idOrSlug,
                                fetchError,
                            });
                            return { idOrSlug, project: null };
                        }
                    }),
                );

                projectDetailResults.forEach(({ idOrSlug, project: projectDetail }) => {
                    if (!projectDetail) return;

                    // Add to the persistent cache with all keys
                    projectCache.add(projectDetail, idOrSlug);
                });
            }

            const fallbackNow = new Date().toISOString();

            const resolveSupportDate = (support: ProjectSupport): string => {
                const createdAtValue = (support as { createdAt?: unknown }).createdAt;

                if (typeof createdAtValue === "string") {
                    return createdAtValue;
                }

                return fallbackNow;
            };

            // Calculate total money (either from API or manually)
            const totalMoneyValue = totalMoney
                ? {
                      amount: totalMoney.amount ?? 0,
                      currency: totalMoney.currency ?? getDefaultCurrency(),
                  }
                : contributions.length > 0
                  ? sumMoney(
                        contributions.map(
                            (s) => s.money ?? { amount: 0, currency: getDefaultCurrency() },
                        ),
                    )
                  : { amount: 0, currency: getDefaultCurrency() };

            // Map contributions to recent donations
            const sortedContributions = [...contributions].sort((a, b) => {
                const dateA = Date.parse(resolveSupportDate(a));
                const dateB = Date.parse(resolveSupportDate(b));
                return dateB - dateA;
            });

            const recentDonations = sortedContributions.slice(0, 3).map((support) => {
                const idOrSlug = extractId(
                    typeof support.project === "string" ? support.project : undefined,
                );
                // Get project from the persistent cache
                const project = idOrSlug ? projectCache.get(idOrSlug) : undefined;

                // Validate that we have a proper slug, not just an ID
                const hasValidSlug = project?.slug && isNaN(Number(project.slug));

                // Ensure we always use the slug for URLs, never the ID
                // If project is not found or slug is invalid, log an error
                if (!project && idOrSlug) {
                    const cacheStats = projectCache.getStats();
                    console.error("Project not found in cache", {
                        idOrSlug,
                        supportId: support.id,
                        cacheSize: cacheStats.size,
                        sampleKeys: cacheStats.sampleKeys,
                    });
                } else if (project && !hasValidSlug) {
                    console.error("Project found but has invalid slug (numeric or missing)", {
                        projectId: project.id,
                        projectSlug: project.slug,
                        supportId: support.id,
                    });
                }

                return {
                    id: support.id?.toString() || idOrSlug || "",
                    amount: support.money || { amount: 0, currency: getDefaultCurrency() },
                    // Use project title if available, otherwise use a placeholder
                    projectTitle: project?.title || `Project ${idOrSlug || "Unknown"}`,
                    // CRITICAL: Only use slug if it's valid (not a number). Never fall back to ID.
                    // Empty string will prevent broken links - UI should handle gracefully
                    projectSlug: hasValidSlug ? project.slug : "",
                    date: resolveSupportDate(support),
                };
            });

            summary = {
                count: contributionsCount,
                total: {
                    amount: totalMoneyValue.amount,
                    currency: totalMoneyValue.currency,
                },
                recentDonations,
            };
        } catch (err) {
            console.error("Error fetching donation data:", err);
            return Promise.reject(err);
        }
    }

    // Fetch on mount and re-fetch when the period changes
    $effect(() => {
        if (period) {
            donationsPromise = fetchDonations();
        }
    });
</script>

{#await donationsPromise}
    <!-- Loading state -->
    <div class="border-grey flex min-h-96 items-center justify-center rounded-4xl border bg-white">
        <div class="flex items-center gap-2">
            <LoadingSpinner />
            <p class="text-content">Loading...</p>
        </div>
    </div>
{:then summary}
    <BaseActivityCard
        titleKey="pages.me.donations.title"
        leftStatLabel="pages.me.donations.count"
        leftStatValue={summary?.count ?? 0}
        rightStatLabel="pages.me.donations.total"
        rightStatValue={formattedTotal}
        recentTitleKey="pages.me.donations.recent"
        illustrationPath="/images/profile/ilustration-donations.png"
        primaryActionLabel="pages.me.donations.viewAll"
        primaryActionHref={lang === "es" ? "/me/donations" : `/${lang}/me/donations`}
        secondaryActionLabel="pages.me.donations.certificate"
        secondaryActionHref="#"
        isEmpty={!hasData}
        emptyMessageKey="pages.me.donations.empty"
        emptyCtaLabel="pages.me.donations.explore"
        emptyCtaLink={lang === "es" ? "/discover" : `/${lang}/discover`}
    >
        {#if summary?.recentDonations}
            {#each summary.recentDonations.slice(0, 2) as donation}
                <li class="flex flex-wrap items-center gap-2">
                    <span class="text-sm font-semibold text-black">
                        {formatAmountWithSymbol(
                            donation.amount.amount,
                            donation.amount.currency,
                            lang,
                        )}
                    </span>
                    <span class="text-sm font-semibold text-black"> - </span>
                    {#if donation.projectSlug}
                        <a
                            href={lang === "es"
                                ? `/project/${donation.projectSlug}`
                                : `/${lang}/project/${donation.projectSlug}`}
                            class="text-secondary text-sm no-underline hover:underline focus:underline focus:outline-none"
                        >
                            {donation.projectTitle || fallbackProjectTitle}
                        </a>
                    {:else}
                        <span class="text-tertiary text-sm italic">
                            {donation.projectTitle || fallbackProjectTitle}
                        </span>
                    {/if}
                </li>
            {/each}
        {/if}
    </BaseActivityCard>
{:catch donationsError}
    <!-- Error state -->
    <div class="border-grey flex min-h-96 items-center justify-center rounded-4xl border bg-white">
        <p class="text-tertiary font-semibold">{donationsError}</p>
    </div>
{/await}

