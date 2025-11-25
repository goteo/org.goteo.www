<script lang="ts">
    import { onMount } from "svelte";
    import DonationsCard from "./DonationsCard.svelte";
    import ProjectsCard from "./ProjectsCard.svelte";
    import MatchfundingCard from "./MatchfundingCard.svelte";
    import type { ActivityData, MatchfundingCardData } from "../../types/me-page";
    import {
        apiAccountingsIdGet,
        apiProjectSupportsGetCollection,
        apiProjectSupportsmoneyTotalGetCollection,
        apiProjectsGetCollection,
        apiProjectsIdOrSlugGet,
        apiMatchCallsGetCollection,
    } from "../../openapi/client/sdk.gen.ts";
    import { apiAccountingsIdGetUrl, apiUsersIdGetUrl } from "../../openapi/client/paths.gen.ts";
    import { createClient } from "@hey-api/client-fetch";
    import { extractId } from "../../utils/extractId";
    import { toCollectionItems } from "../../utils/hydra.ts";
    import type { ProjectSupport, Project, MatchCall } from "../../openapi/client/types.gen.ts";
    import { projectCache } from "../../stores/projectCache";

    interface Props {
        lang: string;
        period?: string;
        user: {
            id: number;
            accountingId: string;
            isAdmin?: boolean;
        };
    }

    let { lang, period = new Date().getFullYear().toString(), user }: Props = $props();

    let activityData = $state<ActivityData | undefined>(undefined);
    let matchfundingData = $state<MatchfundingCardData | undefined>(undefined);
    let loading = $state(true);
    let error = $state<string | null>(null);

    // Create a client instance configured to use the API relay
    // This ensures all authenticated requests go through the server-side proxy
    const relayClient = createClient({
        baseUrl: "/api/relay",
    });

    // Helper function to build URLs from templates by replacing path parameters
    function buildUrl(template: string, params: Record<string, string | number>): string {
        return Object.entries(params).reduce(
            (url, [key, value]) => url.replace(`{${key}}`, String(value)),
            template,
        );
    }

    async function fetchActivityData() {
        loading = true;
        error = null;

        try {
            // Project details are cached in a session-level store (projectCache)
            // This cache persists across component mounts and page navigations,
            // reducing redundant API calls and improving performance.
            // Projects are indexed by ID, slug, and original IRI segment.

            // Only send Accept-Language header; auth is handled by the relay
            const headers = {
                "Accept-Language": lang,
            };

            // Fetch user's contributions (donations) - using accounting IRI as origin
            const accountingIri = buildUrl(apiAccountingsIdGetUrl, { id: user.accountingId });
            const { data: supportsResponse, error: supportsError } =
                await apiProjectSupportsGetCollection({
                    client: relayClient,
                    query: {
                        origin: accountingIri,
                        itemsPerPage: 100,
                    },
                    headers,
                });

            // Try to fetch total money contributed, but it might fail with 500
            // In that case, we'll calculate it manually from the contributions
            let totalMoney = null;
            let totalMoneyError = null;

            try {
                const response = await apiProjectSupportsmoneyTotalGetCollection({
                    client: relayClient,
                    query: {
                        origin: accountingIri,
                    },
                    headers,
                });
                totalMoney = response.data;
                totalMoneyError = response.error;
            } catch (err) {
                console.warn("money_total endpoint failed, will calculate manually:", err);
                totalMoneyError = err;
            }

            // Log detailed error information
            if (totalMoneyError) {
                console.warn("Total money endpoint returned error, calculating manually:", {
                    error: totalMoneyError,
                    accountingIri,
                });
            }

            // Fetch user's owned projects - using user IRI as owner
            const userIri = buildUrl(apiUsersIdGetUrl, { id: user.id });
            const { data: projectsResponse, error: projectsError } = await apiProjectsGetCollection(
                {
                    client: relayClient,
                    query: {
                        owner: userIri,
                        itemsPerPage: 3,
                    },
                    headers,
                },
            );

            // Only fail if we can't get the critical data (contributions or projects)
            if (supportsError) {
                console.error("Failed to fetch contributions:", supportsError);
                error = "Failed to load donation data";
                return;
            }

            if (projectsError) {
                console.error("Failed to fetch projects:", projectsError);
            }

            // Transform the data into the ActivityData format expected by ActivityCard
            const contributions = toCollectionItems<ProjectSupport>(supportsResponse);
            const projects = toCollectionItems<Project>(projectsResponse);

            const contributionsCount = Array.isArray(supportsResponse)
                ? supportsResponse.length
                : contributions.length;
            const projectsCount = Array.isArray(projectsResponse)
                ? projectsResponse.length
                : projects.length;

            // Use session-level cache for project details (persists across component mounts)
            // Add owned projects to the cache first
            projectCache.addMany(projects);

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

            // Check which projects are not in the cache and need to be fetched
            const slugsToFetch = supportProjectIdOrSlugs.filter(
                (idOrSlug) => !projectCache.has(idOrSlug),
            );

            if (slugsToFetch.length > 0) {
                const projectDetailResults = await Promise.all(
                    slugsToFetch.map(async (idOrSlug) => {
                        try {
                            const { data, error } = await apiProjectsIdOrSlugGet({
                                client: relayClient,
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

                // Add fetched projects to the cache using multiple keys for reliable lookups
                projectDetailResults.forEach(({ idOrSlug, project: projectDetail }) => {
                    if (!projectDetail) return;

                    // Add to the persistent cache with all keys
                    projectCache.add(projectDetail, idOrSlug);
                });
            }

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
                                client: relayClient,
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

                accountingResults.forEach((accounting) => {
                    const balance = accounting?.balance;

                    if (!balance) {
                        return;
                    }

                    if (typeof balance.amount === "number") {
                        projectsTotalAmount += balance.amount;
                    }

                    if (!projectsTotalCurrency && balance.currency) {
                        projectsTotalCurrency = balance.currency;
                    }
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
            let totalAmount = totalMoney?.amount || 0;
            let totalCurrency = totalMoney?.currency || "EUR";

            if (!totalMoney && contributions.length > 0) {
                // Calculate manually from contributions
                totalAmount = contributions.reduce((sum, support) => {
                    return sum + (support.money?.amount || 0);
                }, 0);
                totalCurrency = contributions[0]?.money?.currency || "EUR";
            }

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
                    amount: support.money || { amount: 0, currency: "EUR" },
                    // Use project title if available, otherwise use a placeholder
                    projectTitle: project?.title || `Project ${idOrSlug || "Unknown"}`,
                    // CRITICAL: Only use slug if it's valid (not a number). Never fall back to ID.
                    // Empty string will prevent broken links - UI should handle gracefully
                    projectSlug: hasValidSlug ? project.slug : "",
                    date: resolveSupportDate(support),
                };
            });

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

            activityData = {
                donations: {
                    count: contributionsCount,
                    total: {
                        amount: totalAmount,
                        currency: totalCurrency,
                    },
                    recentDonations,
                },
                projects: projectsError
                    ? undefined
                    : {
                          count: projectsCount,
                          totalRaised: {
                              amount: projectsTotalAmount,
                              currency: projectsTotalCurrency ?? "EUR",
                          },
                          recentProjects,
                      },
            };

            // Fetch matchfunding data
            try {
                const { data: callsData, error: callsError } = await apiMatchCallsGetCollection({
                    client: relayClient,
                    query: {
                        itemsPerPage: 100,
                    },
                    headers,
                });

                if (!callsError && callsData) {
                    const calls = toCollectionItems<MatchCall>(callsData);

                    // Filter calls where user is a manager
                    const userCalls = calls.filter((call) => {
                        if (!call.managers || call.managers.length === 0) return false;
                        // managers is Array<string> containing IRI paths like "/v4/users/123"
                        return call.managers.some((managerIri) =>
                            managerIri.includes(String(user.id)),
                        );
                    });

                    if (userCalls.length > 0) {
                        // Fetch accounting data for each call to get donation amounts
                        const callAccountings = await Promise.all(
                            userCalls.map(async (call) => {
                                const accountingId = extractId(call.accounting);
                                if (!accountingId)
                                    return { callId: call.id, amount: 0, currency: "EUR" };

                                try {
                                    const { data: accounting } = await apiAccountingsIdGet({
                                        client: relayClient,
                                        path: { id: accountingId },
                                        headers,
                                    });

                                    return {
                                        callId: call.id,
                                        amount: accounting?.balance?.amount || 0,
                                        currency: accounting?.balance?.currency || "EUR",
                                    };
                                } catch {
                                    return { callId: call.id, amount: 0, currency: "EUR" };
                                }
                            }),
                        );

                        // Calculate total donated across all calls
                        const totalDonated = callAccountings.reduce(
                            (sum, acc) => sum + acc.amount,
                            0,
                        );
                        const currency = callAccountings[0]?.currency || "EUR";

                        // Get recent calls (up to 3)
                        const recentCalls = userCalls.slice(0, 3).map((call, index) => ({
                            id: call.id || 0,
                            title: call.title || "",
                            donationAmount: {
                                amount: callAccountings[index]?.amount || 0,
                                currency: callAccountings[index]?.currency || "EUR",
                            },
                        }));

                        matchfundingData = {
                            totalCalls: userCalls.length,
                            totalDonated: {
                                amount: totalDonated,
                                currency,
                            },
                            recentCalls,
                        };
                    }
                }
            } catch (matchfundingError) {
                console.warn("Failed to fetch matchfunding data:", matchfundingError);
                // Don't fail the whole page if matchfunding fails
                matchfundingData = undefined;
            }
        } catch (err) {
            console.error("Error fetching activity data:", err);
            error = "Failed to load activity data";
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchActivityData();
    });

    // Re-fetch when period changes
    $effect(() => {
        if (period) {
            fetchActivityData();
        }
    });
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-{matchfundingData ? '3' : '2'}">
    {#if loading}
        <!-- Loading state -->
        <div
            class="border-grey flex min-h-[384px] items-center justify-center rounded-[32px] border bg-white"
        >
            <p class="text-content">Loading...</p>
        </div>
        <div
            class="border-grey flex min-h-[384px] items-center justify-center rounded-[32px] border bg-white"
        >
            <p class="text-content">Loading...</p>
        </div>
        <div
            class="border-grey flex min-h-[384px] items-center justify-center rounded-[32px] border bg-white"
        >
            <p class="text-content">Loading...</p>
        </div>
    {:else if error}
        <!-- Error state -->
        <div
            class="border-grey flex min-h-[384px] items-center justify-center rounded-[32px] border bg-white"
        >
            <p class="text-tertiary font-semibold">{error}</p>
        </div>
        <div
            class="border-grey flex min-h-[384px] items-center justify-center rounded-[32px] border bg-white"
        >
            <p class="text-tertiary font-semibold">{error}</p>
        </div>
        <div
            class="border-grey flex min-h-[384px] items-center justify-center rounded-[32px] border bg-white"
        >
            <p class="text-tertiary font-semibold">{error}</p>
        </div>
    {:else}
        <!-- Activity cards -->
        <DonationsCard {lang} data={activityData} />
        <ProjectsCard {lang} data={activityData} />
        {#if matchfundingData}
            <MatchfundingCard {lang} data={matchfundingData} />
        {/if}
    {/if}
</div>
