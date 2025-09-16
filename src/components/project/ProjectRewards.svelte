<script lang="ts">
    import { t } from "../../i18n/store";
    import type { ProjectReward, Project, Accounting } from "../../openapi/client/index";
    import {
        apiAccountingsIdGet,
        apiProjectRewardsGetCollection,
    } from "../../openapi/client/index";
    import { cart } from "../../stores/cart";
    import { getUnit } from "../../utils/currencies";
    import { extractId } from "../../utils/extractId";
    import Reward from "../Reward.svelte";

    let {
        lang = $bindable(),
        project,
    }: {
        lang: string;
        project: Project;
    } = $props();

    const projectId = project.id!.toString();

    let rewards: ProjectReward[] = $state([]);

    $effect(() => {
        apiProjectRewardsGetCollection({
            query: { project: projectId, "order[money.amount]": "asc" },
            headers: { "Accept-Language": lang },
        }).then((data) => {
            rewards = data.data!;
        });
    });

    let freeAmount = $state("");

    async function handleFreeDonation() {
        const numericAmount = Number(freeAmount);

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
</script>

<section>
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
                        bind:value={freeAmount}
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
</section>
