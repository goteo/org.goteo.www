<script lang="ts">
    import CollapsibleBox from "./CollapsibleBox.svelte";
    import { t } from "../i18n/store";
</script>

<div class="flex items-start justify-between px-0 pt-0 pb-0 lg:hidden">
    <CollapsibleBox
        detailsId="auth-details"
        isInitiallyCollapsed={true}
        buttonTextShow={$t("checkout.summary.show_more")}
        buttonTextHide={$t("checkout.summary.hide")}
    >
        {#snippet header()}
            <h2 class="text-secondary flex items-center gap-2 text-base font-semibold">
                {$t("login.page.welcome.title")}
            </h2>
        {/snippet}
    </CollapsibleBox>
</div>

<div class="hidden flex-col gap-6 pt-6 pb-0 lg:flex">
    <div>
        <h2 class="text-secondary text-[56px] leading-tight font-semibold">
            {$t("login.page.welcome.title")}
        </h2>
        <p class="text-content font-light">
            {$t("login.page.welcome.subtitle")}
        </p>
    </div>
    <hr class="bg-secondary" />
</div>
