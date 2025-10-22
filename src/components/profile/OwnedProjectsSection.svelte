<script lang="ts">
    import { onMount } from "svelte";

    import Carousel from "../Carousel.svelte";
    import CampaignCard from "../home/CampaignCard.svelte";
    import { apiProjectsGetCollection, apiAccountingsIdGet } from "../../openapi/client/sdk.gen.ts";
    import { t } from "../../i18n/store";
    import { extractId } from "../../utils/extractId";
    import { toCollectionItems } from "../../utils/hydra.ts";

    import type { Money, Project, Accounting } from "../../openapi/client/types.gen.ts";
    import type { Campaign } from "../../types/campaign";

    interface Props {
        lang: string;
        user: {
            id: number;
            token: string;
            accountingId: string;
            isAdmin?: boolean;
        };
    }

    let { lang, user }: Props = $props();

    let ownedProjects = $state<Campaign[]>([]);
    let loading = $state(true);

    async function fetchOwnedProjects() {
        loading = true;

        try {
            const headers = {
                "Accept-Language": lang,
                Authorization: `Bearer ${user.token}`,
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
                                    id: project.slug!,
                                    title: project.title!,
                                    image: project.video?.thumbnail!,
                                    minimum: project.budget?.minimum?.money!,
                                    optimum: project.budget?.optimum?.money,
                                    obtained: accounting.balance as Money,
                                    status: project.status,
                                    category: project.categories?.[0], // Get first category
                                    daysRemaining,
                                } as Campaign;
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
</script>

{#if !loading && ownedProjects.length > 0}
    <div class="flex flex-col gap-6">
        <h2 class="text-3xl font-bold text-black md:text-4xl">
            {$t("me.ownedProjects.title")}
        </h2>
        <Carousel itemsPerGroup={3} gap={24} showDots={false}>
            {#each ownedProjects as campaign, index (campaign.id)}
                <CampaignCard
                    size={index === 0 ? "large" : "small"}
                    {campaign}
                    showOwnerActions={true}
                />
            {/each}
        </Carousel>
    </div>
{/if}
