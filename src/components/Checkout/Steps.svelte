<script lang="ts">
    import { t } from "../../i18n/store";
    import WarningIcon from "../../svgs/WarningIcon.svelte";

    export let step = 1;
    export let hasError: boolean;

    const stepsLabels = [
        $t("checkout.steps.reward.title"),
        $t("checkout.steps.data.title"),
        $t("checkout.steps.payment.title"),
        $t("checkout.steps.confirmation.title"),
    ];
</script>

<div class="px-6">
    <div class="relative">
        <div class="bg-primary flex w-full items-center justify-between rounded-full border">
            {#each [1, 2, 3, 4] as i}
                <div
                    class="h-4 w-4 rounded-full border-2 transition-all duration-300"
                    class:bg-purple-900={i <= step}
                    class:border-white={i <= step}
                    class:bg-white={i > step}
                    class:border-purple-900={i > step}
                ></div>
            {/each}
        </div>
    </div>

    <div class="mt-2 flex w-full items-center justify-between text-sm font-bold text-gray-700">
        {#each stepsLabels as label, index}
            <div
                class={`flex items-center gap-1 ${
                    step === index + 1 && hasError
                        ? "text-[#E94668]"
                        : step > index
                          ? "text-purple-900"
                          : ""
                }`}
            >
                {#if step === index + 1 && hasError}
                    <WarningIcon className="w-5 h-5" />
                {/if}
                {label}
            </div>
        {/each}
    </div>
</div>
