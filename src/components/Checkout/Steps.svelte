<script lang="ts">
    import WarningIcon from "../../components/icons/Warning.svelte";
    import { t } from "../../i18n/store";

    export let step = 1;
    export let hasError: boolean;

    const stepsLabels = [
        $t("pages.checkout.steps.reward.title"),
        $t("pages.checkout.steps.data.title"),
        $t("pages.checkout.steps.payment.title"),
        $t("pages.checkout.steps.confirmation.title"),
    ];

    $: progressPercentage = ((step - 1) / (stepsLabels.length - 1)) * 100;
</script>

<div class="w-full">
    <div class="relative px-2">
        <div class="bg-variant1 h-4 w-full rounded-full"></div>

        <div
            class="bg-primary absolute top-0 left-2 h-4 rounded-full transition-all duration-500"
            style="width: calc({progressPercentage}%);"
        ></div>

        <div
            class="absolute top-1/2 left-0 flex w-full -translate-y-1/2 items-center justify-between px-2"
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

    <div class="mt-3 flex w-full justify-between">
        {#each stepsLabels as label, index}
            {@const active = step === index + 1}

            <div class="flex flex-col items-center px-1 text-center">
                <div class="flex min-h-6 items-center justify-center gap-1">
                    {#if active && hasError}
                        <WarningIcon class="h-4 w-4 shrink-0" />
                    {/if}
                    <span
                        class="font-karla text-[14px] leading-6 font-bold
                        {step >= index + 1 ? 'text-secondary' : 'text-gray-400/60'}"
                    >
                        {label}
                    </span>
                </div>
            </div>
        {/each}
    </div>
</div>
