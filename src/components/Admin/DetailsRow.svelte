<script lang="ts">
    import { t } from "../../i18n/store";
    import ActionsBtn from "./ActionsBtn.svelte";
    import ContentFooter from "./ContentFooter.svelte";

    const { id, trackingCode, dataTime, platformLink, refundToWallet } = $props<{
        id: string;
        trackingCode: string;
        dataTime: {
            date: string;
            time: string;
            fulltime: string;
        };
        platformLink: string;
        refundToWallet: string;
    }>();
</script>

<section class="flex flex-col gap-10">
    <div
        class="grid grid-cols-4 gap-x-8 gap-y-8 rounded-md bg-[#fbfafe] p-6 text-[16px] text-[#575757]"
    >
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.operationTime")}</p>
            <span title={dataTime.fulltime}>{dataTime.time}</span>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.trackingCode")}</p>
            <p
                class="text-tertiary cursor-pointer truncate overflow-hidden whitespace-nowrap underline"
                title={trackingCode}
            >
                {trackingCode}
            </p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.toWallet")}</p>
            <p>{refundToWallet}</p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold"></p>
            <p></p>
        </div>

        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.platformLink")}</p>
            <p
                class="text-tertiary cursor-pointer truncate overflow-hidden whitespace-nowrap underline"
                title={platformLink}
            >
                {platformLink}
            </p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.estimatedFee")}</p>
            <p>-</p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold"></p>
            <p></p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold"></p>
            <p></p>
        </div>
    </div>
    <ActionsBtn />
    <ContentFooter {id} />
</section>
