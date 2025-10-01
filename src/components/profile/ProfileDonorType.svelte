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
        class="flex grow basis-0 flex-col gap-6 rounded-[24px] border border-[#f3f3ef] bg-[#f3f3ef] p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]"
    >
        <div class="flex flex-col gap-10">
            <div class="flex items-center justify-between">
                <div class="flex flex-col gap-2 text-[#462949]">
                    <p class="font-['Karla'] text-[40px] leading-[48px] font-bold">
                        {$t("profile.donorType.fan.title")}
                    </p>
                    <p class="font-['Karla'] text-[16px] leading-[24px]">
                        {$t("profile.donorType.fan.description")}
                    </p>
                </div>
                <div
                    class="size-[100px] overflow-clip shadow-[0px_35px_10px_0px_rgba(0,0,0,0),0px_22px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
                >
                    <!-- Badge placeholder -->
                    <div
                        class="flex size-full items-center justify-center bg-gradient-to-br from-[#f3f3ef] to-[#e6e5f7]"
                    >
                        <span class="font-['Karla'] text-4xl">🏅</span>
                    </div>
                </div>
            </div>
            <div class="flex gap-10">
                <div class="flex flex-col text-[#462949]">
                    <p class="font-['Karla'] text-[16px] leading-[24px]">
                        {$t("profile.donorType.fan.projectsDonated")}
                    </p>
                    <p class="font-['Karla'] text-[32px] leading-[40px] font-bold">
                        {projectsDonated.toString().padStart(2, "0")}
                    </p>
                </div>
                <div class="flex flex-col text-[#462949]">
                    <p class="font-['Karla'] text-[16px] leading-[24px]">
                        {$t("profile.donorType.fan.moneyDonated")}
                    </p>
                    <p class="font-['Karla'] text-[32px] leading-[40px] font-bold">
                        {moneyDonated}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Next Level Card -->
    <div
        class="flex grow basis-0 flex-col gap-6 rounded-[24px] border border-[#f3f3ef] bg-[#fbfbfb] p-6"
    >
        <div class="flex flex-col gap-2">
            <p class="font-['Karla'] text-[40px] leading-[48px] font-bold text-[#462949]">
                {$t("profile.donorType.nextLevel.title")}
            </p>
            <p class="font-['Karla'] text-[16px] leading-[24px] text-[#575757]">
                {$t("profile.donorType.nextLevel.description")}
            </p>
        </div>
        <div class="flex items-center gap-6">
            <!-- Current Badge -->
            <div
                class="size-[100px] shrink-0 overflow-clip shadow-[0px_35px_10px_0px_rgba(0,0,0,0),0px_22px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
            >
                <div
                    class="flex size-full items-center justify-center bg-gradient-to-br from-[#f3f3ef] to-[#e6e5f7]"
                >
                    <span class="font-['Karla'] text-4xl">🏅</span>
                </div>
            </div>

            <!-- Progress Bar -->
            <div
                class="flex h-4 grow rounded-lg border border-[#f3f3ef] bg-[#fbfbfb] p-[2px] shadow-[0px_35px_10px_0px_rgba(0,0,0,0),0px_22px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
            >
                <div
                    class="h-3 w-[86px] rounded-lg bg-gradient-to-r from-[#f3f3ef] to-[#c2eeff] shadow-[8px_8px_20px_0px_inset_rgba(255,255,255,0.2)]"
                ></div>
            </div>

            <!-- Next Badge -->
            <div
                class="size-[100px] shrink-0 overflow-clip shadow-[0px_35px_10px_0px_rgba(0,0,0,0),0px_22px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
            >
                <div
                    class="flex size-full items-center justify-center bg-gradient-to-br from-[#c2eeff] to-[#59e9d3]"
                >
                    <span class="font-['Karla'] text-4xl">🏆</span>
                </div>
            </div>
        </div>
    </div>
</div>
