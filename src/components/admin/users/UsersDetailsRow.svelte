<script lang="ts">
    import { t } from "../../../i18n/store";
    import {
        apiGatewayChargestotalsGetCollection,
        apiGatewayChargesGetCollection,
    } from "../../../openapi/client/index.ts";
    import DetailsRow, { type DetailsField } from "../DetailsRow.svelte";

    import type { UserRow } from "./UsersTable.svelte";

    let { user }: { user: UserRow } = $props();

    let totalCollected = $state<number | string>("—");
    let recentCharges = $state<any[]>([]);

    $effect(() => {
        if (user.accounting) {
            loadUserFinancials(user.accounting);
        }
    });

    async function loadUserFinancials(accounting: string) {
        const { data: totalsData } = await apiGatewayChargestotalsGetCollection({
            baseUrl: "/api/relay",
            query: { "checkout.origin": accounting, status: "in_charge" },
        });
        totalCollected = (totalsData as any)?.total ?? (totalsData as any)?.amount ?? 0;

        const { data: chargesData } = await apiGatewayChargesGetCollection({
            baseUrl: "/api/relay",
            query: { "checkout.origin": accounting, itemsPerPage: 6 },
        });
        recentCharges = (chargesData as any)?.member ?? [];
    }

    const fields: DetailsField[] = $derived([
        {
            label: $t("pages.admin.users.table.rows.details.totalCollected", {
                default: "Total collected",
            }),
            value: totalCollected,
        },
        {
            label: $t("pages.admin.users.table.rows.details.id"),
            value: user.id,
        },
        {
            label: $t("pages.admin.users.table.rows.details.handle"),
            value: user.handle,
        },
        {
            label: $t("pages.admin.users.table.rows.details.email"),
            value: user.email,
        },
        {
            label: $t("pages.admin.users.table.rows.details.type"),
            value: $t(`pages.admin.users.table.rows.type.${user.type}`, {
                default: user.type,
            }),
        },
        {
            label: $t("pages.admin.users.table.rows.details.territory"),
            value: user.territory,
        },
        {
            label: $t("pages.admin.users.table.rows.details.active"),
            value: user.active
                ? $t("pages.admin.users.table.rows.active")
                : $t("pages.admin.users.table.rows.inactive"),
        },
    ]);
</script>

<DetailsRow {fields} columns={2}>
    <div class="col-span-2 mt-4">
        <h4 class="mb-2 font-bold">
            {$t("pages.admin.users.table.rows.details.recentCharges", {
                default: "Recent charges",
            })}
        </h4>
        <div class="flex flex-col gap-2">
            {#each recentCharges as charge}
                <div class="flex justify-between rounded border bg-gray-50 p-2 text-sm">
                    <span
                        >{charge.title ||
                            $t("common.untitled", { default: "Untitled charge" })}</span
                    >
                    <span class="font-semibold">
                        {charge.money?.amount}
                        {charge.money?.currency}
                    </span>
                </div>
            {:else}
                <p class="text-sm text-gray-400">
                    {$t("pages.admin.users.table.rows.details.noRecentCharges", {
                        default: "No recent charges found",
                    })}
                </p>
            {/each}
        </div>
    </div>
</DetailsRow>
