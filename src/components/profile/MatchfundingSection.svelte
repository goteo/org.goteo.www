<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { extractId } from "../../utils/extractId";
    import { toCollectionItems } from "../../utils/hydra.ts";
    import MatchfundingCallCard from "./MatchfundingCallCard.svelte";
    import Carousel from "../Carousel.svelte";
    import {
        apiMatchCallsGetCollection,
        apiAccountingsIdGet,
        apiProjectSupportsGetCollection,
        apiMatchCallSubmissionsGetCollection,
    } from "../../openapi/client/sdk.gen.ts";
    import { createClient } from "@hey-api/client-fetch";

    import type { MatchCall, MatchCallSubmission } from "../../openapi/client/types.gen.ts";
    import type { MatchfundingCall } from "../../types/me-page";

    interface Props {
        lang: string;
        user: {
            id: number;
            accountingId: string;
            isAdmin?: boolean;
        };
    }

    let { lang, user }: Props = $props();

    // Create a client instance configured to use the API relay
    // This ensures all authenticated requests go through the server-side proxy
    const relayClient = createClient({
        baseUrl: "/api/relay",
    });

    let matchfundingCalls = $state<MatchfundingCall[]>([]);
    let loading = $state(true);
    let error = $state(false);

    async function fetchMatchfundingCalls() {
        loading = true;
        error = false;

        try {
            const headers = {
                "Accept-Language": lang,
            };

            // Fetch match calls for this user (filtered by manager ID)
            const { data: callsData, error: callsError } = await apiMatchCallsGetCollection({
                client: relayClient,
                query: {
                    "managers.id": user.id,
                    itemsPerPage: 30,
                } as any,
                headers,
            });

            if (callsError) {
                console.error("Failed to fetch match calls:", callsError);
                error = true;
                return;
            }

            const calls = toCollectionItems<MatchCall>(callsData);

            if (calls.length > 0) {
                // Transform calls to MatchfundingCall format
                const transformedCalls = (
                    await Promise.all(
                        calls.map(async (call) => {
                            try {
                                if (!call.accounting) return null;

                                // Extract accounting ID from IRI
                                const accountingId = extractId(call.accounting);
                                if (!accountingId) return null;

                                // Fetch all data in parallel for better performance
                                const [
                                    { data: accounting, error: accountingError },
                                    { data: supportsData },
                                    { data: submissionsData },
                                ] = await Promise.all([
                                    // Fetch accounting data for donation amount
                                    apiAccountingsIdGet({
                                        client: relayClient,
                                        path: { id: accountingId },
                                        headers,
                                    }),
                                    // Fetch participating projects via ProjectSupport (filtered by call's accounting ID)
                                    apiProjectSupportsGetCollection({
                                        client: relayClient,
                                        query: {
                                            "origin.id": accountingId,
                                            itemsPerPage: 100,
                                        } as any,
                                        headers,
                                    }),
                                    // Fetch successful projects (accepted submissions)
                                    apiMatchCallSubmissionsGetCollection({
                                        client: relayClient,
                                        query: {
                                            "call.id": call.id,
                                            itemsPerPage: 100,
                                        } as any,
                                        headers,
                                    }),
                                ]);

                                if (accountingError || !accounting) {
                                    console.error(
                                        `Failed to fetch accounting for call ${call.id}:`,
                                        accountingError,
                                    );
                                    return null;
                                }

                                const participatingProjects =
                                    toCollectionItems(supportsData).length || 0;

                                const submissions =
                                    toCollectionItems<MatchCallSubmission>(submissionsData);
                                const successfulProjects = submissions.filter(
                                    (s) => s.status === "accepted",
                                ).length;

                                return {
                                    id: call.id!,
                                    title: call.title!,
                                    description: call.description || "",
                                    slug: (call as any).slug || `call-${call.id}`,
                                    imageUrl: (call as any).backgroundImage || (call as any).logo,
                                    logo: (call as any).logo,
                                    donationAmount: accounting.balance!,
                                    participatingProjects,
                                    successfulProjects,
                                    status: call.status || "active",
                                    territory: call.territory?.toString() || undefined,
                                } as MatchfundingCall;
                            } catch (err) {
                                console.error(`Error transforming match call ${call.id}:`, err);
                                return null;
                            }
                        }),
                    )
                ).filter(Boolean) as MatchfundingCall[];

                matchfundingCalls = transformedCalls;
            } else {
                matchfundingCalls = [];
            }
        } catch (err) {
            console.error("Error fetching matchfunding calls:", err);
            error = true;
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchMatchfundingCalls();
    });
</script>

{#if loading}
    <!-- Loading State -->
    <div class="flex flex-col gap-6">
        <h2 class="text-2xl font-bold text-black md:text-3xl">
            {$t("me.matchfunding.section.title")}
        </h2>
        <!-- Single hero card skeleton matching actual dimensions -->
        <div class="bg-light-muted h-64 w-full animate-pulse rounded-[32px] md:h-80 lg:h-96"></div>
    </div>
{:else if error}
    <!-- Error State -->
    <div class="flex flex-col gap-6">
        <h2 class="text-2xl font-bold text-black md:text-3xl">
            {$t("me.matchfunding.section.title")}
        </h2>
        <p class="text-content text-base leading-normal">
            {$t("me.matchfunding.section.error")}
        </p>
    </div>
{:else if matchfundingCalls.length > 0}
    <!-- Filled State -->
    <div class="flex flex-col gap-6">
        <h2 class="text-2xl font-bold text-black md:text-3xl">
            {$t("me.matchfunding.section.title")}
        </h2>
        <Carousel itemsPerGroup={1} gap={24} showDots={false}>
            {#each matchfundingCalls as call (call.id)}
                <MatchfundingCallCard {lang} {call} />
            {/each}
        </Carousel>
    </div>
{/if}
<!-- Empty state: don't show anything if no calls -->
