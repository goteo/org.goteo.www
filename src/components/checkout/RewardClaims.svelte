<script lang="ts">
    import { get } from "svelte/store";

    import { apiProjectRewardClaimsPost, type GatewayCharge } from "../../openapi/client";
    import { client } from "../../openapi/client/client.gen";
    import {
        apiGatewayChargesIdGetUrl,
        apiProjectRewardsIdGetUrl,
    } from "../../openapi/client/operation-paths.gen";
    import { cart, clearForUser, type CheckoutItem } from "../../stores/checkoutsStore";

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
     * from the checkout already fetched and validated in `verify.astro`, so
     * they carry the same fields the cart item was created with.
     */
    function pairRewardsToCharges(
        items: CheckoutItem[],
        charges: GatewayCharge[],
    ): Array<{ reward: string; charge: string }> {
        const pendingItems: CheckoutItem[] = [];
        const usedCharges = new Set<GatewayCharge>();

        const toClaim = (
            item: CheckoutItem,
            charge: GatewayCharge,
        ): { reward: string; charge: string } => ({
            reward: client.buildUrl({
                url: apiProjectRewardsIdGetUrl,
                path: { id: item.reward!.id },
            }),
            charge: client.buildUrl({
                url: apiGatewayChargesIdGetUrl,
                path: { id: charge.id },
            }),
        });

        const claims: Array<{ reward: string; charge: string }> = [];

        for (const item of items) {
            if (item.kind !== "reward" || item.reward?.id == null) continue;

            const match = charges.find(
                (charge) =>
                    !usedCharges.has(charge) &&
                    charge.target === item.target &&
                    charge.title === item.title &&
                    charge.type === item.type &&
                    charge.money.amount === item.money.amount &&
                    charge.money.currency === item.money.currency,
            );

            if (!match) {
                pendingItems.push(item);
                continue;
            }

            usedCharges.add(match);
            claims.push(toClaim(item, match));
        }

        // Items that did not match by fields fall back to the next unused
        // charge, relying on the 1:1 creation order preserved in the checkout.
        for (const item of pendingItems) {
            const next = charges.find((charge) => !usedCharges.has(charge));

            if (!next) {
                console.warn("No charge left for reward item:", item);
                continue;
            }

            usedCharges.add(next);
            claims.push(toClaim(item, next));
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
