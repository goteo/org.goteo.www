<script>
    import { t } from "../../i18n/store";
    export let step = 1;
</script>

<div class="bg-primary flex w-full items-center justify-between rounded-full border">
    {#each [1, 2, 3, 4] as i}
        <div
            class="h-4 w-4 rounded-full border-2 transition-all duration-300"
            class:bg-purple-900={i <= step}
            class:bg-white={i > step}
            class:border-white={i <= step}
            class:border-purple-900={i > step}
        ></div>
    {/each}
</div>

<div class="mt-2 flex w-full items-center justify-between text-sm font-medium text-gray-700">
    <div class={step >= 1 ? "text-purple-900" : ""}>{$t("checkout.steps.reward.title")}</div>
    <div class={step >= 2 ? "text-purple-900" : ""}>{$t("checkout.steps.data.title")}</div>
    <div class={step >= 3 ? "text-purple-900" : ""}>{$t("checkout.steps.payment.title")}</div>
    <div class={step >= 4 ? "text-purple-900" : ""}>{$t("checkout.steps.confirmation.title")}</div>
</div>
