<script lang="ts">
    import WarningIcon from "../../components/icons/Warning.svelte";
    import { t } from "../../i18n/store";

    export let step = 1;
    export let hasError: boolean;

    const stepsLabels = [
        $t("checkout.steps.reward.title"),
        $t("checkout.steps.data.title"),
        $t("checkout.steps.payment.title"),
        $t("checkout.steps.confirmation.title"),
    ];
</script>

<div class="w-full">
    <div class="relative">
        <div class="bg-variant1 h-4 w-full rounded-full"></div>

        <div
            class="bg-primary absolute top-0 left-0 h-4 rounded-full transition-all duration-500"
            style="width: {Math.min(((2 * step - 1) / 6) * 100, 100)}%;"
        ></div>

        <div
            class="absolute top-1/2 flex w-full -translate-y-1/2 items-center justify-between px-2"
        >
            {#each [1, 2, 3, 4] as i}
                <div
                    class="border-secondary relative z-10 flex h-2 w-2 items-center justify-center rounded-full border-2 transition-all duration-300 lg:h-3 lg:w-3"
                    class:bg-secondary={i <= step}
                    class:bg-variant1={i > step}
                ></div>
            {/each}
        </div>
    </div>

    <div class="mt-4 flex w-full items-center justify-between text-sm font-bold text-gray-700">
        {#each stepsLabels as label, index}
            <div
                class={`flex max-w-20 items-center gap-1 text-center ${
                    step === index + 1 && hasError
                        ? "text-black"
                        : step >= index + 1
                          ? "text-black"
                          : "text-gray-400"
                }`}
            >
                {#if step === index + 1 && hasError}
                    <WarningIcon class="h-4 w-4" />
                {/if}
                <span class="text-xs leading-tight">{label}</span>
            </div>
        {/each}
    </div>
</div>
