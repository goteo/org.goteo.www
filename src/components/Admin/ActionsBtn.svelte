<script lang="ts">
    import { t } from "../../i18n/store";
    import Button from "../library/Button.svelte";
</script>

<section>
    <div class="flex flex-row flex-wrap gap-6">
        <Button
            kind="ghost"
            size="sm"
            class="min-h-10 rounded-[18px] bg-transparent px-4 py-2 text-base leading-5"
        >
            {$t("contributions.grid.actions.refundToWallet")}</Button
        >
        <Button
            kind="ghost"
            size="sm"
            class="min-h-10 rounded-[18px] bg-transparent px-4 py-2 text-base leading-5"
        >
            {$t("contributions.grid.actions.refundToUser")}
        </Button>
        <Button
            kind="ghost"
            size="sm"
            class="min-h-10 rounded-[18px] bg-transparent px-4 py-2 text-base leading-5"
            >{$t("contributions.grid.actions.changeUser")}</Button
        >
        <Button
            kind="ghost"
            size="sm"
            class="min-h-10 rounded-[18px] bg-transparent px-4 py-2 text-base leading-5"
            >{$t("contributions.grid.actions.manageReward")}
        </Button>
    </div>
</section>
