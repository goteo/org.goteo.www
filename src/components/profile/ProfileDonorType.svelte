<script lang="ts">
    import { t } from "../../i18n/store";

    interface Props {
        projectsDonated?: number;
        moneyDonated?: string;
    }

    let { projectsDonated = 1, moneyDonated = "5,00€" }: Props = $props();
</script>

<div class="mx-auto mt-10 flex w-full max-w-[1200px] gap-6 px-10">
    <!-- Fan Card -->
    <div
        class="border-light-muted bg-light-muted flex grow basis-0 flex-col gap-6 rounded-3xl border p-6 shadow-sm"
    >
        <div class="flex flex-col gap-10">
            <div class="flex items-center justify-between">
                <div class="text-tertiary flex flex-col gap-2">
                    <p class="text-4xl leading-tight font-bold">
                        {$t("profile.donorType.fan.title")}
                    </p>
                    <p class="text-base leading-6">
                        {$t("profile.donorType.fan.description")}
                    </p>
                </div>
                <div class="size-[100px] overflow-clip shadow-lg">
                    <!-- Badge placeholder -->
                    <div
                        class="from-light-muted to-purple-tint flex size-full items-center justify-center bg-gradient-to-br"
                    >
                        <span class="text-4xl">🏅</span>
                    </div>
                </div>
            </div>
            <div class="flex gap-10">
                <div class="text-tertiary flex flex-col">
                    <p class="text-base leading-6">
                        {$t("profile.donorType.fan.projectsDonated")}
                    </p>
                    <p class="text-[32px] leading-[40px] font-bold">
                        {projectsDonated.toString().padStart(2, "0")}
                    </p>
                </div>
                <div class="text-tertiary flex flex-col">
                    <p class="text-base leading-6">
                        {$t("profile.donorType.fan.moneyDonated")}
                    </p>
                    <p class="text-[32px] leading-[40px] font-bold">
                        {moneyDonated}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Next Level Card -->
    <div
        class="border-light-muted bg-light-surface flex grow basis-0 flex-col gap-6 rounded-3xl border p-6"
    >
        <div class="flex flex-col gap-2">
            <p class="text-tertiary text-4xl leading-tight font-bold">
                {$t("profile.donorType.nextLevel.title")}
            </p>
            <p class="text-secondary text-base leading-6">
                {$t("profile.donorType.nextLevel.description")}
            </p>
        </div>
        <div class="flex items-center gap-6">
            <!-- Current Badge -->
            <div class="size-[100px] shrink-0 overflow-clip shadow-lg">
                <div
                    class="from-light-muted to-purple-tint flex size-full items-center justify-center bg-gradient-to-br"
                >
                    <span class="text-4xl">🏅</span>
                </div>
            </div>

            <!-- Progress Bar -->
            <div
                class="border-light-muted bg-light-surface flex h-4 grow rounded-lg border p-[2px] shadow-lg"
            >
                <div
                    class="from-light-muted h-3 w-[86px] rounded-lg bg-gradient-to-r to-[#c2eeff] shadow-[8px_8px_20px_0px_inset_rgba(255,255,255,0.2)]"
                ></div>
            </div>

            <!-- Next Badge -->
            <div class="size-[100px] shrink-0 overflow-clip shadow-lg">
                <div
                    class="to-primary flex size-full items-center justify-center bg-gradient-to-br from-[#c2eeff]"
                >
                    <span class="text-4xl">🏆</span>
                </div>
            </div>
        </div>
    </div>
</div>
