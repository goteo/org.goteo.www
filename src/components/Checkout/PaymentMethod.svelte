<script lang="ts">
    import type { ApiGatewaysNameGetResponse } from "../../openapi/client/index";
    import CreditCardIcon from "../../svgs/CreditCardIcon.svelte";
    import PaypalIcon from "../../svgs/PaypalIcon.svelte";
    import StripeIcon from "../../svgs/StripeIcon.svelte";
    import { t } from "../../i18n/store";

    export let paymentGateways: ApiGatewaysNameGetResponse[] = [];

    let selectedPaymentMethod = "";
</script>

<section>
    <div class="flex flex-col gap-6 sm:w-full sm:max-w-md">
        <p class="text-2xl font-bold">
            {$t("payment.page.selectMethod")}
        </p>

        <form id="register" method="POST" class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
                {#each paymentGateways as gateway}
                    <label
                        class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-6 py-4 shadow-sm transition-all hover:shadow-md"
                        class:selected={selectedPaymentMethod === gateway.name}
                        class:bg-teal-300={selectedPaymentMethod === gateway.name}
                        class:text-[#2f1e2e]={selectedPaymentMethod === gateway.name}
                        class:border-teal-400={selectedPaymentMethod === gateway.name}
                        class:border-[#F3F3EF]={selectedPaymentMethod !== gateway.name}
                    >
                        <div class="flex items-center gap-2">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={gateway.name}
                                bind:group={selectedPaymentMethod}
                                class="after:bg-primary relative h-6 w-6 appearance-none rounded-full border border-[#462949] after:absolute after:top-1/2 after:left-1/2 after:hidden after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:transform after:rounded-full after:content-[''] checked:border-[#462949] checked:bg-[#462949] checked:after:block"
                            />
                            <div class="flex flex-col leading-tight">
                                <span class="font-semibold capitalize">
                                    {gateway.name}
                                </span>
                            </div>
                        </div>
                        <div>
                            {#if gateway.name === "paypal"}
                                <PaypalIcon />
                            {:else if gateway.name === "stripe"}
                                <StripeIcon />
                            {:else if gateway.name === "wallet"}
                                <CreditCardIcon />
                            {/if}
                        </div>
                    </label>
                {/each}
            </div>

            <button
                class="bg-primary cursor-pointer rounded-3xl px-6 py-4 font-bold text-[#462949]"
                type="submit"
            >
                {$t("global.btn.send")}
            </button>
        </form>
    </div>
</section>
