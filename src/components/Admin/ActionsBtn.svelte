<script>
    import { t } from "../../i18n/store";
</script>

<section>
    <div class="flex flex-row gap-6">
        <button
            class="btn btn-primary text-content border-secondary cursor-pointer rounded-2xl border px-4 py-2 font-bold"
        >
            {$t("contributions.grid.actions.refundToWallet")}</button
        >
        <button
            class="btn btn-secondary text-content border-secondary cursor-pointer rounded-2xl border px-4 py-2 font-bold"
        >
            {$t("contributions.grid.actions.refundToUser")}
        </button>
        <button
            class="btn btn-danger text-content border-secondary cursor-pointer rounded-2xl border px-4 py-2 font-bold"
            >{$t("contributions.grid.actions.changeUser")}</button
        >
        <button
            class="btn btn-danger text-content border-secondary cursor-pointer rounded-2xl border px-4 py-2 font-bold"
            >{$t("contributions.grid.actions.manageReward")}
        </button>
    </div>
</section>
