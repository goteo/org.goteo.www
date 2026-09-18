<script lang="ts">
    import BaseActivityCard from "./BaseActivityCard.svelte";
    import {
        apiAccountingsIdGet,
        apiMatchCallsGetCollection,
    } from "../../openapi/client/sdk.gen.ts";
    import { getDefaultCurrency } from "../../utils/consts";
    import { formatAmountWithSymbol } from "../../utils/currencies";
    import { extractId } from "../../utils/extractId";
    import { toCollectionItems } from "../../utils/hydra.ts";
    import { sumMoney } from "../../utils/money";
    import LoadingSpinner from "../search/LoadingSpinner.svelte";

    import type { MatchCall, User } from "../../openapi/client/types.gen.ts";
    import type { MatchfundingCardData } from "../../types/me-page";

    interface Props {
        /**
         * Current language locale
         */
        lang: string;

        /**
         * Authenticated user whose matchfunding calls are listed
         */
        user: User;

        /**
         * Notifies the parent whether the card has data, so the layout can
         * decide how many grid columns to use.
         */
        onHasData?: (hasData: boolean) => void;
    }

    let { lang, user, onHasData }: Props = $props();

    let data = $state<MatchfundingCardData | undefined>(undefined);
    let matchfundingPromise = $state<Promise<MatchfundingCardData | undefined>>(
        Promise.resolve(undefined),
    );

    const hasData = $derived(!!(data && data.totalCalls > 0));
    const formattedTotal = $derived(
        data?.totalDonated
            ? formatAmountWithSymbol(data.totalDonated.amount, data.totalDonated.currency, lang)
            : "",
    );

    async function fetchMatchfunding() {
        try {
            const headers = {
                "Accept-Language": lang,
            };

            const { data: callsData, error: callsError } = await apiMatchCallsGetCollection({
                baseUrl: "/api/relay",
                query: {
                    itemsPerPage: 100,
                },
                headers,
            });

            if (callsError) {
                console.warn("Failed to fetch matchfunding calls:", callsError);
                data = undefined;
                return;
            }

            const calls = toCollectionItems<MatchCall>(callsData);

            // Filter calls where the user is a manager.
            // managers is Array<string> containing IRI paths like "/v4/users/123"
            const userCalls = calls.filter((call) => {
                if (!call.managers || call.managers.length === 0) return false;
                return call.managers.some((managerIri) => managerIri.includes(String(user.id)));
            });

            if (userCalls.length === 0) {
                data = undefined;
                return;
            }

            // Fetch accounting data for each call to get donation amounts
            const callAccountings = await Promise.all(
                userCalls.map(async (call) => {
                    const accountingId = extractId(call.accounting);
                    if (!accountingId)
                        return {
                            callId: call.id,
                            amount: 0,
                            currency: getDefaultCurrency(),
                        };

                    try {
                        const { data: accounting } = await apiAccountingsIdGet({
                            baseUrl: "/api/relay",
                            path: { id: accountingId },
                            headers,
                        });

                        return {
                            callId: call.id,
                            amount: accounting?.balance?.amount || 0,
                            currency: accounting?.balance?.currency || getDefaultCurrency(),
                        };
                    } catch {
                        return {
                            callId: call.id,
                            amount: 0,
                            currency: getDefaultCurrency(),
                        };
                    }
                }),
            );

            // Calculate total donated across all calls
            const totalDonatedMoney = sumMoney(
                callAccountings.map((acc) => ({
                    amount: acc.amount,
                    currency: acc.currency,
                })),
            );
            const totalDonated = totalDonatedMoney.amount ?? 0;
            const currency = totalDonatedMoney.currency ?? getDefaultCurrency();

            // Get recent calls (up to 3)
            const recentCalls = userCalls.slice(0, 3).map((call, index) => ({
                id: call.id || 0,
                title: call.title || "",
                donationAmount: {
                    amount: callAccountings[index]?.amount || 0,
                    currency: callAccountings[index]?.currency || getDefaultCurrency(),
                },
            }));

            data = {
                totalCalls: userCalls.length,
                totalDonated: {
                    amount: totalDonated,
                    currency,
                },
                recentCalls,
            };
            return data;
        } catch (matchfundingError) {
            console.warn("Failed to fetch matchfunding data:", matchfundingError);
            // Don't fail the whole page if matchfunding fails
            throw matchfundingError;
        } finally {
            // nop
        }
    }

    $effect(() => {
        matchfundingPromise = fetchMatchfunding();
    });

    // Notify the parent about its presence so the grid columns can adapt
    $effect(() => {
        onHasData?.(hasData);
    });
</script>

{#await matchfundingPromise}
    <!-- Loading state -->
    <div class="border-grey flex min-h-96 items-center justify-center rounded-4xl border bg-white">
        <div class="flex items-center gap-2">
            <LoadingSpinner />
            <p class="text-content">Loading...</p>
        </div>
    </div>
{:then data}
    <BaseActivityCard
        titleKey="pages.me.matchfunding.card.title"
        leftStatLabel="pages.me.matchfunding.card.calls"
        leftStatValue={data?.totalCalls ?? 0}
        rightStatLabel="pages.me.matchfunding.card.donated"
        rightStatValue={formattedTotal}
        recentTitleKey="pages.me.matchfunding.card.recent"
        illustrationPath="/images/profile/ilustration-matchfunding.png"
        primaryActionLabel="pages.me.matchfunding.card.viewAll"
        primaryActionHref={lang === "es" ? "/me/matchfunding" : `/${lang}/me/matchfunding`}
        secondaryActionLabel="pages.me.matchfunding.card.create"
        secondaryActionHref={lang === "es" ? "/matchfunding/new" : `/${lang}/matchfunding/new`}
        isEmpty={false}
    >
        {#if data?.recentCalls}
            {#each data.recentCalls.slice(0, 2) as call}
                <li class="flex flex-wrap items-center gap-2">
                    <span class="text-sm font-semibold text-black">
                        {formatAmountWithSymbol(
                            call.donationAmount.amount,
                            call.donationAmount.currency,
                            lang,
                        )}
                    </span>
                    <span class="text-sm font-semibold text-black"> - </span>
                    <span class="text-content text-sm">
                        {call.title}
                    </span>
                </li>
            {/each}
        {/if}
    </BaseActivityCard>
{:catch matchfundingError}
    <div class="border-grey flex min-h-96 items-center justify-center rounded-4xl border bg-white">
        <p class="text-tertiary font-semibold">{matchfundingError.message}</p>
    </div>
{/await}
