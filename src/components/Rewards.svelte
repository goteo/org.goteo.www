<script lang="ts">
    import { cart } from "../stores/cart.ts";
    import { onMount } from "svelte";
    import type { ProjectReward, Project, Accounting } from "../openapi/client/index";
    import { extractId } from "../utils/extractId";
    import { apiProjectRewardsGetCollection, apiAccountingsIdGet } from "../openapi/client/index";
    import { t } from "../i18n/store.ts";
    import { getUnit } from "../utils/currencies.ts";
    import Reward from "./Reward.svelte";

    let { project, rewards } = $props<{
        project: Project;
        rewards?: ProjectReward[] | null;
    }>();

    let amount = $state("");

    let error = $state<string | null>(null);

    async function handleFreeDonation() {
        const numericAmount = Number(amount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert($t("rewards.error-amount"));
            return;
        }

        const { data: accounting } = await apiAccountingsIdGet({
            path: { id: String(extractId(project.accounting)) },
        });

        const unit = getUnit((accounting as Accounting)?.currency);
        const calculatedAmount = numericAmount * unit;

        cart.addItem({
            title: $t("reward.btnFreeDonationLabel"),
            amount: calculatedAmount,
            quantity: 1,
            image: "",
            project: Number(project.id),
            target: Number(extractId(project.accounting)),
            currency: accounting?.currency!,
        });
        window.location.href = "/checkout";
    }

    onMount(async () => {
        if (!rewards) {
            try {
                const response = await apiProjectRewardsGetCollection({
                    query: {
                        project: project.id ? String(project.id) : undefined,
                        "order[money.amount]": "asc",
                    },
                });
                rewards = Array.isArray(response.data) ? (response.data as ProjectReward[]) : [];
            } catch (err) {
                console.error(err);
                error = "Error fetching rewards";
            }
        }
    });
</script>

<section>
    {#if error}
        <p class="text-red-600">{error}</p>
    {:else if rewards && rewards.length}
        <div class="flex flex-col gap-12">
            <h2 class="text-tertiary text-3xl font-bold">
                {$t("rewards.title")}
            </h2>
            <ul class="grid gap-6 lg:grid-cols-3">
                <div
                    class="flex basis-1/3 flex-col justify-between gap-6 rounded-4xl border border-[#F3F3EF] bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A]"
                >
                    <div class="flex flex-col gap-6">
                        <h3 class="text-tertiary w-full text-left text-2xl font-semibold">
                            {$t("rewards.donation-free.title")}
                        </h3>
                        <p class="text-sm whitespace-pre-line text-gray-800">
                            {$t("rewards.donation-free.description")}
                        </p>
                    </div>
                    <div class="flex flex-col gap-6">
                        <input
                            type="text"
                            class="w-full rounded border border-gray-300 p-2"
                            placeholder={$t("rewards.donation-free.placeholder")}
                            bind:value={amount}
                        />
                        <button
                            type="button"
                            onclick={handleFreeDonation}
                            class="text-tertiary inline-block w-full cursor-pointer rounded-3xl bg-[#E6E5F7] px-6 py-4 font-bold transition"
                        >
                            {$t("rewards.donation-free.btn")}
                        </button>
                    </div>
                </div>
                {#each rewards as reward}
                    <Reward {reward} {project} />
                {/each}
            </ul>
        </div>
    {:else}
        <p>{$t("rewards.unavailable")}</p>
    {/if}
</section>
