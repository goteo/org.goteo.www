<script lang="ts">
    import TotalizerCard from "./TotalizerCard.svelte";

    import { t } from "../../i18n/store";

    let {
        selectedCampaigns,
        totalEarned,
        totalPaid,
        totalUnpaid,
    }: {
        selectedCampaigns: string;
        totalEarned: string;
        totalPaid: string;
        totalUnpaid: string;
    } = $props();
</script>

<div class="grid w-full max-w-[1360px] grid-cols-1 gap-6 self-center md:grid-cols-2 lg:grid-cols-4">
    <TotalizerCard
        i18n={{
            title: $t("admin.projects.totalizers.selectedCampaigns"),
            value: selectedCampaigns,
        }}
    />
    <TotalizerCard
        i18n={{ 
            title: $t("admin.projects.totalizers.totalEarned"), 
            value: totalEarned 
        }}
    />
    <TotalizerCard i18n={{ 
            title: $t("admin.projects.totalizers.totalPaid"), 
            value: totalPaid
        }} 
    />
    <TotalizerCard
        i18n={{ 
            title: $t("admin.projects.totalizers.totalUnpaid"), 
            value: totalUnpaid 
        }}
    />
</div>
