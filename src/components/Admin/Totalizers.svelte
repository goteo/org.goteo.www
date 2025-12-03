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

<div class="grid self-center w-full max-w-[1360px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
    <TotalizerCard
        i18n={{ title: $t("admin.totalizers.selectedCampaigns.title"), value: selectedCampaigns }}
    />
    <TotalizerCard 
        i18n={{ title: $t("admin.totalizers.totalEarned.title"), value: totalEarned }} 
    />
    <TotalizerCard 
        i18n={{ title: $t("admin.totalizers.totalPaid.title"), value: totalPaid }} 
    />
    <TotalizerCard 
        i18n={{ title: $t("admin.totalizers.totalUnpaid.title"), value: totalUnpaid }} 
    />
</div>
