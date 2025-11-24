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

<div class="lg:px-6">
    <div class="relative">
        <div class="bg-variant1 h-4 w-full rounded-full"></div>

        <div
            class="bg-primary absolute top-0 left-0 h-4 rounded-full transition-all duration-500"
            style="width: {((step - 1) / 3) * 100}%;"
        ></div>

        <div
            class="absolute top-1/2 flex w-full -translate-y-1/2 items-center justify-between px-1"
        >
            {#each [1, 2, 3, 4] as i}
                <div
                    class="relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all duration-300"
                    class:bg-secondary={i <= step}
                    class:bg-variant1={i > step}
                    class:border-primary={i <= step}
                    class:border-black={i > step}
                >
                    {#if i <= step}
                        <div class="bg-secondary h-1.5 w-1.5 rounded-full"></div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <div class="mt-4 flex w-full items-center justify-between text-sm font-bold text-gray-700">
        {#each stepsLabels as label, index}
            <div
                class={`flex max-w-[80px] items-center gap-1 text-center ${
                    step === index + 1 && hasError
                        ? "text-black"
                        : step >= index + 1
                          ? "text-black"
                          : "text-gray-400"
                }`}
            >
                {#if step === index + 1 && hasError}
                    <WarningIcon className="w-4 h-4" />
                {/if}
                <span class="text-xs leading-tight">{label}</span>
            </div>
        {/each}
    </div>
</div>
