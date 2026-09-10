<script lang="ts">
    import { onMount } from "svelte";

    import { session } from "../../auth/store.ts";
    import { t } from "../../i18n/store";
    import { apiProjectsGetCollection, apiAccountingsIdGet } from "../../openapi/client/sdk.gen.ts";
    import { extractId } from "../../utils/extractId";
    import { toCollectionItems } from "../../utils/hydra.ts";
    import Carousel from "../library/layout/Carousel.svelte";
    import Title from "../library/typography/Title.svelte";

    import type { Money, Project, User } from "../../openapi/client/types.gen.ts";
    import { tabStatusGroups, statusCardConfig } from "../../utils/ownedProjectCards";
    import type { Campaign } from "../../types/campaign";
    import CampaignCard, {
        type OwnedCardActionView,
        type OwnedCardConfig,
    } from "../home/CampaignCard.svelte";
    import Tabs from "../library/layout/Tabs.svelte";

    interface Props {
        lang: string;
        user: User;
    }

    let { lang, user }: Props = $props();

    let ownedProjects = $state<Campaign[]>([]);
    let loading = $state(true);

    async function fetchOwnedProjects() {
        loading = true;

        try {
            const headers = {
                "Accept-Language": lang,
                ...$session?.token.asHttpHeaders,
            };

            // Get user's owned projects that are currently in campaign
            const userIri = `/v4/users/${user.id}`;
            const { data: projects, error: projectsError } = await apiProjectsGetCollection({
                query: {
                    owner: userIri,
                    status: "in_campaign",
                    itemsPerPage: 10,
                },
                headers,
            });

            if (projectsError) {
                console.error("Failed to fetch owned projects:", projectsError);
                return;
            }

            const projectItems = toCollectionItems<Project>(projects);

            if (projectItems.length > 0) {
                // Transform projects to Campaign format
                const campaigns = (
                    await Promise.all(
                        projectItems.map(async (project) => {
                            try {
                                if (!project.accounting) return null;

                                // Fetch accounting data to get balance
                                const accountingId = extractId(project.accounting);
                                if (!accountingId) return null;

                                const { data: accounting, error: accountingError } =
                                    await apiAccountingsIdGet({
                                        path: { id: accountingId },
                                        headers,
                                    });

                                if (accountingError || !accounting) {
                                    console.error(
                                        `Failed to fetch accounting for project ${project.slug}:`,
                                        accountingError,
                                    );
                                    return null;
                                }

                                // Calculate days remaining
                                let daysRemaining: number | undefined;
                                if (project.calendar?.minimum) {
                                    const endDate = new Date(project.calendar.minimum);
                                    const today = new Date();
                                    const diffTime = endDate.getTime() - today.getTime();
                                    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                }

                                return {
                                    ...project,
                                    slug: project.slug!,
                                    title: project.title!,
                                    image: project.video?.thumbnail!,
                                    minimum: project.budget?.minimum?.money!,
                                    optimum: project.budget?.optimum?.money,
                                    obtained: accounting.balance as Money,
                                    category: project.categories?.[0], // Get first category
                                    daysRemaining,
                                } satisfies Campaign;
                            } catch (error) {
                                console.error(
                                    `Error fetching accounting for project ${project.slug}:`,
                                    error,
                                );
                                return null;
                            }
                        }),
                    )
                ).filter(Boolean) as Campaign[];

                ownedProjects = campaigns;
            } else {
                ownedProjects = [];
            }
        } catch (error) {
            console.error("Error fetching owned projects:", error);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchOwnedProjects();
    });

    const testOwnedProjects: Campaign[] = [
        {
            id: 1,
            slug: "project-1",
            title: "Project 1",
            image: "/images/project1.jpg",
            minimum: { amount: 1000, currency: "USD" },
            optimum: { amount: 5000, currency: "USD" },
            obtained: { amount: 2000, currency: "USD" },
            category: "",
            daysRemaining: 10,
            status: "in_campaign",
            subtitle: "",
            categories: [],
            territory: {
                country: null,
                subLvl1: undefined,
                subLvl2: undefined,
                address: undefined,
            },
        },
        {
            id: 2,
            slug: "project-2",
            title: "Project 2",
            image: "/images/project2.jpg",
            minimum: { amount: 2000, currency: "USD" },
            optimum: { amount: 6000, currency: "USD" },
            obtained: { amount: 3000, currency: "USD" },
            category: "",
            daysRemaining: 20,
            status: "in_campaign",
            subtitle: "",
            categories: [],
            territory: {
                country: null,
                subLvl1: undefined,
                subLvl2: undefined,
                address: undefined,
            },
        },
        {
            id: 3,
            slug: "project-3",
            title: "Project 3",
            image: "/images/project3.jpg",
            minimum: { amount: 1500, currency: "USD" },
            optimum: { amount: 4000, currency: "USD" },
            obtained: { amount: 2500, currency: "USD" },
            category: "",
            daysRemaining: 15,
            status: "in_campaign",
            subtitle: "",
            categories: [],
            territory: {
                country: null,
                subLvl1: undefined,
                subLvl2: undefined,
                address: undefined,
            },
        },
        {
            id: 4,
            slug: "project-4",
            title: "Project 4",
            image: "/images/project4.jpg",
            minimum: { amount: 800, currency: "USD" },
            optimum: { amount: 3000, currency: "USD" },
            obtained: { amount: 0, currency: "USD" },
            category: "",
            status: "in_draft",
            subtitle: "",
            categories: [],
            territory: {
                country: null,
                subLvl1: undefined,
                subLvl2: undefined,
                address: undefined,
            },
        },
        {
            id: 5,
            slug: "project-5",
            title: "Project 5",
            image: "/images/project5.jpg",
            minimum: { amount: 1200, currency: "USD" },
            optimum: { amount: 4500, currency: "USD" },
            obtained: { amount: 0, currency: "USD" },
            category: "",
            status: "in_campaign_review",
            subtitle: "",
            categories: [],
            territory: {
                country: null,
                subLvl1: undefined,
                subLvl2: undefined,
                address: undefined,
            },
        },
        {
            id: 6,
            slug: "project-6",
            title: "Project 6",
            image: "/images/project6.jpg",
            minimum: { amount: 1800, currency: "USD" },
            optimum: { amount: 5500, currency: "USD" },
            obtained: { amount: 900, currency: "USD" },
            category: "",
            status: "in_funding_review",
            subtitle: "",
            categories: [],
            territory: {
                country: null,
                subLvl1: undefined,
                subLvl2: undefined,
                address: undefined,
            },
        },
        {
            id: 7,
            slug: "project-7",
            title: "Project 7",
            image: "/images/project7.jpg",
            minimum: { amount: 2200, currency: "USD" },
            optimum: { amount: 7000, currency: "USD" },
            obtained: { amount: 4500, currency: "USD" },
            category: "",
            status: "in_funding",
            subtitle: "",
            categories: [],
            territory: {
                country: null,
                subLvl1: undefined,
                subLvl2: undefined,
                address: undefined,
            },
        },
        {
            id: 8,
            slug: "project-8",
            title: "Project 8",
            image: "/images/project8.jpg",
            minimum: { amount: 1200, currency: "USD" },
            optimum: { amount: 3800, currency: "USD" },
            obtained: { amount: 3800, currency: "USD" },
            category: "",
            status: "funding.paid",
            subtitle: "",
            categories: [],
            territory: {
                country: null,
                subLvl1: undefined,
                subLvl2: undefined,
                address: undefined,
            },
        },
    ];

    function projectsForTab(tabId: string): Campaign[] {
        const statuses = tabStatusGroups[tabId] ?? [];
        return testOwnedProjects.filter(
            (project) => project.status !== undefined && statuses.includes(project.status),
        );
    }

    const tabs = $derived([
        { id: "active", label: $t("pages.me.ownedProjects.tabs.active") },
        { id: "review", label: $t("pages.me.ownedProjects.tabs.inReview") },
        { id: "draft", label: $t("pages.me.ownedProjects.tabs.draft") },
        { id: "archived", label: $t("pages.me.ownedProjects.tabs.archived") },
    ]);
</script>

{#if !loading && testOwnedProjects.length > 0}
    <div class="flex flex-col gap-6">
        <Title level={2} variant="section">
            {$t("pages.me.ownedProjects.title")}
        </Title>
        <Tabs {tabs} activeTab="active" alignment="left" />

        {#snippet ownedProjectsCarousel(projects: Campaign[])}
            <Carousel itemsPerGroup={3} gap={24} showDots={false}>
                {#each projects as campaign, index (campaign.id)}
                    {@const config = statusCardConfig(campaign.status)}
                    {@const ownedConfig: OwnedCardConfig | undefined = config && {
                        tagLabel: config.tagKey ? $t(`pages.me.ownedProjects.card.${config.tagKey}`) : undefined,
                        showMoney: config.showMoney,
                        actions: config.actions.map<OwnedCardActionView>((action) => ({
                            key: action.key,
                            label: $t(`pages.me.ownedProjects.card.${action.key}`),
                            kind: action.kind,
                        })),
                    }}
                    <CampaignCard
                        size={index === 0 ? "large" : "small"}
                        {campaign}
                        {ownedConfig}
                    />
                {/each}
            </Carousel>
        {/snippet}

        <div data-tab-content="active">
            {@render ownedProjectsCarousel(projectsForTab("active"))}
        </div>

        <div data-tab-content="review" style="display:none">
            {@render ownedProjectsCarousel(projectsForTab("review"))}
        </div>

        <div data-tab-content="draft" style="display:none">
            {@render ownedProjectsCarousel(projectsForTab("draft"))}
        </div>

        <div data-tab-content="archived" style="display:none">
            {@render ownedProjectsCarousel(projectsForTab("archived"))}
        </div>
    </div>
{/if}
