<script lang="ts">
    import type { Accounting, ApiGatewaysNameGetResponse } from "../../openapi/client/index";
    import CreditCardIcon from "../../svgs/CreditCardIcon.svelte";
    import PaypalIcon from "../../svgs/PaypalIcon.svelte";
    import StripeIcon from "../../svgs/StripeIcon.svelte";
    import { formatCurrency } from "../../utils/currencies";
    import { t } from "../../i18n/store";
    import { onMount } from "svelte";
    import { actions, isInputError } from "astro:actions";

    const {
        hasError,
        paymentGateways,
        selectedGateway,
        accounting,
    }: {
        hasError?: boolean;
        paymentGateways?: ApiGatewaysNameGetResponse[];
        selectedGateway?: string;
        accounting: Accounting;
    } = $props();

    let formEl: HTMLFormElement | null = null;

    let paymentMethod = $state<string | null>(
        selectedGateway ?? paymentGateways?.find((g) => g.name !== "wallet")?.name ?? null,
    );
    let errorMessage = $state<string | null>(null);
    let inputErrors = $state<string[]>([]);

    let cartData = $state<string | null>(null);
    let walletDisabled = $state(false);

    let balance = $state(0);

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        errorMessage = null;
        inputErrors = [];

        if (!formEl) return;

        const formData = new FormData(formEl);
        const selectedMethod = formData.get("paymentMethod");

        if (!selectedMethod) return;

        if (selectedMethod === "wallet") {
            window.location.href = "/payment/wallet";
            return;
        }

        const { error, data } = await actions.payment(formData);

        if (!error) {
            const checkoutLink = data?.checkout?.links?.find((link) => link.type === "payment");

            if (!checkoutLink) throw new Error("No payment link found in the response");

            if (checkoutLink.method === "GET") {
                window.location.href = checkoutLink.href!;
                return;
            }

            if (checkoutLink.method === "POST") {
                submitPostRedirect(checkoutLink);
                return;
            }
        }

        if (error) {
            if (isInputError(error)) {
                inputErrors = error.issues.map((i) => i.message);
            } else {
                errorMessage = error.message;
            }
        }
    }

    function submitPostRedirect(link: { href?: string; body?: Record<string, string> }) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = link.href!;

        Object.entries(link.body ?? {}).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    }

    onMount(() => {
        cartData = localStorage.getItem("cart");
        if (!cartData) return;

        try {
            const cart = JSON.parse(cartData);
            const total = cart.items.reduce(
                (sum: number, item: { price: number; quantity: number }) =>
                    sum + item.price * item.quantity,
                0,
            );

            const balanceAttr = formEl?.dataset.balance;
            balance = balanceAttr ? parseFloat(balanceAttr) : 0;

            walletDisabled = balance < total;
        } catch (e) {
            console.error("Failed to parse cart data:", e);
        }
    });
</script>

<section>
    <div class="flex flex-col gap-6 sm:w-full sm:max-w-md">
        <p class="text-2xl font-bold">
            {hasError ? $t("payment.page-error.selectMethod") : $t("payment.page.selectMethod")}
        </p>

        <form
            bind:this={formEl}
            method="POST"
            class="flex flex-col gap-4"
            data-balance={accounting.balance?.amount}
            onsubmit={handleSubmit}
        >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {#if paymentGateways}
                    {#each paymentGateways as gateway}
                        <label
                            class="border-grey flex cursor-pointer items-center justify-between gap-4 rounded-2xl border px-6 py-4 shadow-sm transition-all hover:shadow-md
                            has-[input:checked]:border-teal-400 has-[input:checked]:bg-teal-300
                            has-[input:checked]:text-[#2f1e2e] has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50"
                            data-gateway={gateway.name}
                        >
                            <div class="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value={gateway.name}
                                    bind:group={paymentMethod}
                                    disabled={gateway.name === "wallet" && walletDisabled}
                                    class="after:bg-primary border-secondary checked:border-secondary checked:bg-secondary relative h-6 w-6 appearance-none rounded-full border after:absolute after:top-1/2 after:left-1/2 after:hidden after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:transform after:rounded-full after:content-[''] checked:after:block"
                                />
                                <div class="flex flex-col leading-tight">
                                    <span class="font-semibold capitalize">{gateway.name}</span>
                                    {#if gateway.name === "wallet"}
                                        <span class="text-sm font-normal">
                                            {$t("payment.wallet.balanceLabel")}
                                            {formatCurrency(
                                                accounting.balance?.amount,
                                                accounting.currency,
                                            )}
                                        </span>
                                    {/if}
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
                {/if}
            </div>
            <input type="hidden" name="cartData" value={cartData ?? ""} />
        </form>
        {#if inputErrors.length > 0}
            <div class="mt-4 text-center text-sm text-red-700">
                <ul class="list-disc space-y-1 pl-5">
                    {#each inputErrors as err}
                        <li>{err}</li>
                    {/each}
                </ul>
            </div>
        {:else if errorMessage}
            <div class="mt-4 text-center text-sm text-red-700">
                {errorMessage}
            </div>
        {/if}
    </div>
</section>
