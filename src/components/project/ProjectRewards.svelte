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
    import Button from "../library/Button.svelte";
    import Grid from "../library/Grid.svelte";
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

    let isAvailable = $state(calcAvailability());
    function calcAvailability(reward?: ProjectReward): boolean {
        if (project.status !== "in_campaign") {
            return false;
        }

        if (reward && reward.isFinite && reward.unitsAvailable === 0) {
            return false;
        }

        return true;
    }

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
        <h2 class="text-secondary text-4xl font-bold">
            {$t("rewards.title")}
        </h2>
        <Grid>
            <div
                class:opacity-50={!isAvailable}
                class:cursor-not-allowed={!isAvailable}
                class="border-grey flex basis-1/3 flex-col justify-between gap-6 rounded-4xl border bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A]"
            >
                <div class="flex flex-col gap-6">
                    <h3 class="text-secondary w-full text-left text-2xl font-semibold">
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
                    <Button
                        kind="secondary"
                        class="w-full"
                        disabled={!isAvailable}
                        onclick={handleFreeDonation}
                    >
                        {$t("rewards.donation-free.btn")}
                    </Button>
                </div>
            </div>
            {#each rewards as reward}
                <Reward
                    {reward}
                    {project}
                    variant={"public"}
                    isAvailable={calcAvailability(reward)}
                />
            {/each}
        </Grid>
    </div>
</section>
