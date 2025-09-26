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
        <div
            class="w-full rounded-full"
            style="height: 16px; background: var(--Variant-1, #E6E5F7);"
        ></div>
        <div
            class="absolute top-0 left-0 rounded-full transition-all duration-500"
            style="width: {((step - 1) / 3) *
                100}%; height: 16px; background: var(--Primary, #59E9D3);"
        ></div>

        <div
            class="absolute top-1/2 flex w-full -translate-y-1/2 items-center justify-between px-1"
        >
            {#each [1, 2, 3, 4] as i}
                <div
                    class="relative z-10 h-6 w-6 rounded-full border-2 bg-white transition-all duration-300"
                    class:border-gray-300={i > step}
                    style={i <= step
                        ? "background: var(--Primary, #462949); border-color: var(--Primary, #462949);"
                        : ""}
                >
                    {#if i <= step}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="h-2 w-2 rounded-full bg-white"></div>
                        </div>
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
                          ? ""
                          : "text-gray-400"
                }`}
                style={step >= index + 1 && !(step === index + 1 && hasError)
                    ? "color: black;"
                    : ""}
            >
                {#if step === index + 1 && hasError}
                    <WarningIcon className="w-4 h-4" />
                {/if}
                <span class="text-xs leading-tight">{label}</span>
            </div>
        {/each}
    </div>
</div>
