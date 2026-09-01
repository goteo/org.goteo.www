<script lang="ts">
    import Reward from "./Reward.svelte";
    import { t } from "../../i18n/store";
    import {
        apiAccountingsIdGet,
        apiProjectRewardsGetCollection,
    } from "../../openapi/client/index";
    import { cart, checkoutReady } from "../../stores/checkoutsStore";
    import { getUnit } from "../../utils/currencies";
    import { extractId } from "../../utils/extractId";
    import Button from "../library/buttons/Button.svelte";
    import Grid from "../library/layout/Grid.svelte";
    import Title from "../library/typography/Title.svelte";

    import type { ProjectReward, Project } from "../../openapi/client/index";

    let {
        lang = $bindable(),
        project,
    }: {
        lang: string;
        project: Project;
    } = $props();

    let projectId = $derived(project.id!.toString());

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
            alert($t("pages.project.view.rewards.error.amount"));
            return;
        }

        const { data: accounting } = await apiAccountingsIdGet({
            path: { id: String(extractId(project.accounting)) },
        });

        cart.addItem({
            kind: "free",
            type: "single",
            quantity: 1,
            title: $t("common.donate"),
            recipient: accounting?.owner!,
            recipientDisplayName: project.title,
            target: project.accounting!,
            money: {
                amount: numericAmount * getUnit(accounting?.currency),
                currency: accounting?.currency!,
            },
        });

        await checkoutReady();
        window.location.href = "/checkout";
    }
</script>

<section>
    <div class="flex flex-col gap-12">
        <Title level={2} variant="headline" color="secondary">
            {$t("pages.project.view.rewards.title")}
        </Title>
        <Grid>
            <div
                class:opacity-50={!isAvailable}
                class:cursor-not-allowed={!isAvailable}
                class="border-grey flex basis-1/3 flex-col justify-between rounded-4xl border bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A]"
            >
                <div class="flex flex-col gap-3">
                    <Title
                        level={3}
                        variant="subsection"
                        color="secondary"
                        weight="bold"
                        class="w-full text-left"
                    >
                        {$t("pages.project.view.rewards.donationFree.title")}
                    </Title>
                    <p class="text-content text-base whitespace-pre-line">
                        {$t("pages.project.view.rewards.donationFree.description")}
                    </p>
                </div>
                <div class="flex flex-col gap-6">
                    <input
                        type="text"
                        class="w-full rounded border border-gray-300 p-2"
                        placeholder={$t("pages.project.view.rewards.donationFree.placeholder")}
                        bind:value={freeAmount}
                    />
                    <Button
                        kind="secondary"
                        class="w-full"
                        disabled={!isAvailable}
                        onclick={handleFreeDonation}
                    >
                        {$t("common.donate")}
                    </Button>
                </div>
            </div>
            {#each rewards as reward}
                <Reward {reward} {project} isAvailable={calcAvailability(reward)} />
            {/each}
        </Grid>
    </div>
</section>
