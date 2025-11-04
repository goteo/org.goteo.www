<script lang="ts">
    import { t } from "../../i18n/store";
    import VerifiedBadge from "../../svgs/VerifiedBadge.svelte";
    import { formatCurrency } from "../../utils/currencies";

    interface Props {
        projectsDonated?: number;
        moneyDonatedAmount?: number; // Amount in minor units (cents)
        moneyDonatedCurrency?: string; // ISO 4217 currency code
    }

    let {
        projectsDonated = 1,
        moneyDonatedAmount = 500,
        moneyDonatedCurrency = "EUR",
    }: Props = $props();

    // Format currency using the project's formatCurrency function
    const formattedMoney = $derived(formatCurrency(moneyDonatedAmount, moneyDonatedCurrency));
</script>

<div class="mx-auto mt-10 flex w-full gap-6 px-10">
    <!-- Fan Card -->
    <div
        class="bg-light-muted border-light-muted flex max-h-64 grow flex-col gap-6 rounded-3xl border p-6 shadow-sm"
    >
        <div class="flex flex-col gap-10">
            <div class="flex items-center justify-between">
                <div class="text-secondary flex flex-col gap-2">
                    <p class="text-4xl leading-tight font-bold">
                        {$t("profile.donorType.fan.title")}
                    </p>
                    <p class="text-base leading-normal">
                        {$t("profile.donorType.fan.description")}
                    </p>
                </div>
                <div class="size-[100px]">
                    <VerifiedBadge class="size-full" />
                </div>
            </div>
            <div class="flex gap-10">
                <div class="text-secondary flex flex-col">
                    <p class="text-base leading-normal">
                        {$t("profile.donorType.fan.projectsDonated")}
                    </p>
                    <p class="text-3xl leading-tight font-bold">
                        {projectsDonated.toString().padStart(2, "0")}
                    </p>
                </div>
                <div class="text-secondary flex flex-col">
                    <p class="text-base leading-normal">
                        {$t("profile.donorType.fan.moneyDonated")}
                    </p>
                    <p class="text-3xl leading-tight font-bold">
                        {formattedMoney}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Next Level Card -->
    <div
        class="bg-light-surface border-light-muted flex max-h-64 grow flex-col gap-6 rounded-3xl border p-6"
    >
        <div class="flex flex-col gap-2">
            <p class="text-secondary text-4xl leading-tight font-bold">
                {$t("profile.donorType.nextLevel.title")}
            </p>
            <p class="text-tertiary text-base leading-normal">
                {$t("profile.donorType.nextLevel.description")}
            </p>
        </div>
        <div class="flex w-full items-center justify-between gap-2">
            <!-- Current Badge -->
            <VerifiedBadge class="size-24" />

            <!-- Progress Bar -->
            <div
                class="bg-light-surface border-light-muted flex h-4 w-full grow rounded-lg border p-[2px] shadow-lg"
            >
                <div
                    class="from-light-muted h-3 w-[86px] rounded-lg bg-gradient-to-r to-[#c2eeff] shadow-[8px_8px_20px_0px_inset_rgba(255,255,255,0.2)]"
                ></div>
            </div>

            <!-- Next Badge -->
            <VerifiedBadge class="size-24" />
        </div>
    </div>
</div>
