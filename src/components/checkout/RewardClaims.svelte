<script lang="ts">
    import { get } from "svelte/store";

    import {
        apiProjectRewardClaimsPost,
        type GatewayCharge,
    } from "../../openapi/client";
    import { client } from "../../openapi/client/client.gen";
    import {
        apiGatewayChargesIdGetUrl,
        apiProjectRewardsIdGetUrl,
    } from "../../openapi/client/operation-paths.gen";
    import {
        cart,
        clearForUser,
        type CheckoutItem,
    } from "../../stores/checkoutsStore";

    let {
        userId,
        charges,
    }: {
        userId?: number;
        charges: GatewayCharge[];
    } = $props();

    /**
     * Pairs each cart item with the GatewayCharge that paid for it.
     *
     * The v4 payment API has no way to know that a charge pays for a Reward, so
     * the association must be recovered from the local cart. The charges come
     * from the checkout already fetched and validated in `verify.astro`.
     */
    function pairRewardsToCharges(
        items: CheckoutItem[],
        charges: GatewayCharge[],
    ): Array<{ reward: string; charge: string }> {
        const claims: Array<{ reward: string; charge: string }> = [];

        for (const item of items) {
            if (item.kind !== "reward" || item.reward?.id == null) continue;

            const match = charges.find(
                (charge) =>
                    charge.target === item.target &&
                    charge.money.amount === item.money.amount &&
                    charge.money.currency === item.money.currency,
            );

            if (!match) {
                console.warn("No matching charge found for reward item:", item);
                continue;
            }

            claims.push({
                reward: client.buildUrl({
                    url: apiProjectRewardsIdGetUrl,
                    path: { id: item.reward.id },
                }),
                charge: client.buildUrl({
                    url: apiGatewayChargesIdGetUrl,
                    path: { id: match.id },
                }),
            });
        }

        return claims;
    }

    (async () => {
        try {
            const items = Object.values(get(cart).items);

            const hasRewards = items.some(
                (item) => item.kind === "reward" && item.reward?.id != null,
            );

            if (!hasRewards) return;

            const claims = pairRewardsToCharges(items, charges);

            for (const claim of claims) {
                const { error } = await apiProjectRewardClaimsPost({
                    baseUrl: "/api/relay",
                    body: claim,
                });

                if (error) {
                    console.error("[RewardClaims] failed:", claim.reward, error);
                }
            }
        } catch (err) {
            console.error("[RewardClaims] error:", err);
        } finally {
            if (userId != null) clearForUser(userId);
        }
    })();
</script>
