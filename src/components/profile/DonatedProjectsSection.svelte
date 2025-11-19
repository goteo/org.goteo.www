<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import CampaignCard from "../home/CampaignCard.svelte";
    import Carousel from "../Carousel.svelte";
    import {
        apiGatewayChargesGetCollection,
        apiAccountingsIdGet,
        apiProjectsIdOrSlugGet,
    } from "../../openapi/client/sdk.gen.ts";
    import { extractId } from "../../utils/extractId";
    import { toCollectionItems } from "../../utils/hydra.ts";
    import type { Campaign } from "../../types/campaign";
    import type {
        Money,
        GatewayCharge,
        Accounting,
        Project,
    } from "../../openapi/client/types.gen.ts";

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

    let donatedCampaigns = $state<Campaign[]>([]);
    let loading = $state(true);

    async function fetchDonatedProjects() {
        loading = true;

        try {
            const headers = {
                "Accept-Language": lang,
                Authorization: `Bearer ${user.token}`,
            };

            // Get user's gateway charges to find donated projects
            const { data: charges, error: chargesError } = await apiGatewayChargesGetCollection({
                query: {
                    itemsPerPage: 100,
                },
                headers,
            });

            if (chargesError) {
                console.error("Failed to fetch gateway charges:", chargesError);
                donatedCampaigns = [];
                loading = false;
                return;
            }

            const chargeItems = toCollectionItems<GatewayCharge>(charges);

            if (chargeItems.length > 0) {
                // Get unique project accounting IRIs from charges
                const projectAccountingIRIs = [
                    ...new Set(
                        chargeItems
                            .filter((charge) => charge.target && charge.status === "charged")
                            .map((charge) => charge.target)
                            .filter(Boolean),
                    ),
                ] as string[];

                // Calculate total donations per project
                const projectDonations = new Map<string, number>();
                chargeItems.forEach((charge) => {
                    if (charge.target && charge.status === "charged" && charge.money?.amount) {
                        const current = projectDonations.get(charge.target) || 0;
                        projectDonations.set(charge.target, current + charge.money.amount);
                    }
                });

                // Fetch project details for each unique project
                const campaigns = (
                    await Promise.all(
                        projectAccountingIRIs.slice(0, 10).map(async (accountingIRI) => {
                            try {
                                // Fetch accounting to get project reference
                                const accountingId = extractId(accountingIRI);
                                if (!accountingId) return null;

                                const { data: accounting, error: accountingError } =
                                    await apiAccountingsIdGet({
                                        path: { id: accountingId },
                                        headers,
                                    });

                                if (accountingError || !accounting?.owner) {
                                    console.error(
                                        `Failed to fetch accounting ${accountingIRI}:`,
                                        accountingError,
                                    );
                                    return null;
                                }

                                // Fetch project data
                                const projectId = extractId(accounting.owner);
                                if (!projectId) return null;

                                const { data: project, error: projectError } =
                                    await apiProjectsIdOrSlugGet({
                                        path: { idOrSlug: projectId },
                                        headers,
                                    });

                                if (projectError || !project) {
                                    console.error(
                                        `Failed to fetch project for accounting ${accountingIRI}:`,
                                        projectError,
                                    );
                                    return null;
                                }

                                // Calculate days remaining and check if campaign is active
                                let daysRemaining: number | undefined;
                                let isActive = false;

                                if (project.calendar?.minimum) {
                                    const endDate = new Date(project.calendar.minimum);
                                    const today = new Date();
                                    const diffTime = endDate.getTime() - today.getTime();
                                    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    isActive = endDate.getTime() > today.getTime();
                                }

                                if (project.status !== "in_campaign") return null;
                                if (!isActive) return null;

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
                                    userDonations: {
                                        amount: projectDonations.get(accountingIRI) || 0,
                                        currency: "EUR",
                                        conversion: null,
                                    } as Money,
                                } as Campaign;
                            } catch (error) {
                                console.error(
                                    `Error fetching project for accounting ${accountingIRI}:`,
                                    error,
                                );
                                return null;
                            }
                        }),
                    )
                ).filter(Boolean) as Campaign[];

                donatedCampaigns = campaigns;
            } else {
                donatedCampaigns = [];
            }
        } catch (error) {
            console.error("Error fetching donated projects:", error);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchDonatedProjects();
    });
</script>

{#if !loading && donatedCampaigns.length > 0}
    <div class="flex flex-col gap-6">
        <h2 class="text-3xl font-bold text-black md:text-4xl">
            {$t("me.donatedProjects.title")}
        </h2>
        <Carousel itemsPerGroup={3} gap={24} showDots={false}>
            {#each donatedCampaigns as campaign, index (campaign.id)}
                <CampaignCard
                    size={index === 0 ? "large" : "small"}
                    {campaign}
                    showUserDonations={true}
                />
            {/each}
        </Carousel>
    </div>
{/if}
