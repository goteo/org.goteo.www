<script>
    import { t } from "../../i18n/store";
    import Button from "../library/Button.svelte";
</script>

<section>
    <div class="flex flex-row gap-6">
        <Button size="sm" kind="ghost">{$t("contributions.grid.actions.refundToWallet")}</Button>
        <Button size="sm" kind="ghost">{$t("contributions.grid.actions.refundToUser")}</Button>
        <Button size="sm" kind="ghost">{$t("contributions.grid.actions.changeUser")}</Button>
        <Button size="sm" kind="ghost">{$t("contributions.grid.actions.manageReward")}</Button>
    </div>
</section>
