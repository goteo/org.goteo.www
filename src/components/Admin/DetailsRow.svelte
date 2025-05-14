<script lang="ts">
    import { t } from "../../i18n/store";
    import ActionsBtn from "./ActionsBtn.svelte";
    import ContentFooter from "./ContentFooter.svelte";

    const { id, trackingCode, time, platformLink } = $props<{
        id: string;
        trackingCode: string;
        time: string;
        platformLink: string;
    }>();
</script>

<section class="flex flex-col gap-10">
    <div
        class="grid grid-cols-4 gap-x-8 gap-y-8 rounded-md bg-[#fbfafe] p-6 text-[16px] text-[#575757]"
    >
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.operationTime")}</p>
            <p>{time}</p>
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
            <p>Sí</p>
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
