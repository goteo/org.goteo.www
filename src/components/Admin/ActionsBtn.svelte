<script>
    import { t } from "../../i18n/store";
</script>

<section>
    <div class="flex flex-row gap-6">
        <button
            class="btn btn-primary cursor-pointer rounded-2xl border border-[#462949] px-4 py-2 font-bold text-[#575757]"
        >
            {$t("contributions.grid.actions.refundToWallet")}</button
        >
        <button
            class="btn btn-secondary cursor-pointer rounded-2xl border border-[#462949] px-4 py-2 font-bold text-[#575757]"
        >
            {$t("contributions.grid.actions.refundToUser")}
        </button>
        <button
            class="btn btn-danger cursor-pointer rounded-2xl border border-[#462949] px-4 py-2 font-bold text-[#575757]"
            >{$t("contributions.grid.actions.changeUser")}</button
        >
        <button
            class="btn btn-danger cursor-pointer rounded-2xl border border-[#462949] px-4 py-2 font-bold text-[#575757]"
            >{$t("contributions.grid.actions.manageReward")}
        </button>
    </div>
</section>
