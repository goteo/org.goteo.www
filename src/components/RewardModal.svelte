<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import type { Project, ProjectReward } from "../openapi/client";
    import { t } from "../i18n/store";
    import { formatCurrency, getUnit } from "../utils/currencies";
    import UnitIcon from "../svgs/UnitIcon.svelte";
    import UserIcon from "../svgs/UserIcon.svelte";
    import { extractId } from "../utils/extractId";
    import { cart } from "../stores/cart";
    import { renderMarkdown } from "../utils/renderMarkdown";
    import { onMount } from "svelte";
    import Button from "./library/Button.svelte";

    let {
        open = $bindable(false),
        reward = $bindable(),
        project,
    }: {
        open: boolean;
        reward: ProjectReward;
        project: Project;
    } = $props();

    let rawInput = $state("");
    let customAmount = $state(0);
    let link = $state(`/calculadora-fiscal`);

    async function updateAmount(action: "close" | "checkout") {
        const numericAmount = customAmount;

        if (
            isNaN(numericAmount) ||
            numericAmount * getUnit(reward.money?.currency) < (reward.money?.amount ?? 0)
        ) {
            alert($t("rewards.error-invalid-amount"));
            return;
        }

        const target = Number(extractId(project.accounting));

        cart.addItem({
            title: reward.title,
            amount: numericAmount * getUnit(reward.money?.currency),
            quantity: 1,
            image: "",
            project: Number(extractId(reward.project)),
            target,
            claimed: reward.unitsTotal! - reward.unitsAvailable!,
            currency: reward.money?.currency,
        });

        if (action === "checkout") {
            window.location.href = "/checkout";
        } else {
            open = false;
        }
    }

    onMount(() => {
        rawInput = formatCurrency(reward.money.amount, reward.money.currency);
        customAmount = +formatCurrency(reward.money.amount, reward.money.currency, {
            asLocaleString: false,
        });
    });
</script>

<Modal
    bind:open
    closeBtnClass="top-7 end-7 bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="bg-white fixed top-1/2 left-1/2 w-full max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    headerClass="py-2"
>
    <div class="flex flex-col gap-6">
        <div class="text-secondary flex w-full flex-col gap-6 text-left text-[40px] font-semibold">
            <h3>
                {@html $t(
                    "rewards.by-amount-or-more",
                    {
                        amount: `${formatCurrency(reward.money.amount, reward.money.currency)}`,
                    },
                    { allowHTML: true },
                )}
            </h3>
            <h3>{$t("rewards.thanks-message")}</h3>
        </div>
        <div class="flex flex-row gap-4">
            <div class="marked-content flex min-w-0 flex-1 flex-col gap-2 text-gray-700">
                {#await renderMarkdown(reward.description!) then content}
                    {@html content}
                {/await}
                <p class="mb-8">
                    {@html $t(
                        "rewards.reward-iva-message",
                        {
                            link: `<a class="font-bold" href="${window.location.origin}${link}" target="_blank">${window.location.origin}${link}</a>`,
                        },
                        { allowHTML: true },
                    )}
                </p>
                <div>
                    <input
                        type="text"
                        class="focus-ring-2 focus:ring-tertiary w-full rounded border border-gray-300 p-4"
                        bind:value={rawInput}
                        onfocus={() => {
                            rawInput = customAmount.toString();
                        }}
                        onblur={() => {
                            const currency = reward?.money?.currency!;
                            const unit = getUnit(currency);

                            const parsed = parseFloat(
                                rawInput.replace(/[^\d.,]/g, "").replace(",", "."),
                            );
                            customAmount = isNaN(parsed) ? 0 : parsed;

                            rawInput =
                                customAmount > 0
                                    ? formatCurrency(customAmount * unit, currency)
                                    : "";
                        }}
                        placeholder={$t("rewards.donation-free.placeholder")}
                    />
                </div>
            </div>
        </div>
        <div class="flex w-full gap-2">
            <div class="text-secondary flex items-center justify-between gap-2 text-sm font-bold">
                <UserIcon />
                <span>
                    {@html $t(
                        "rewards.donators",
                        { donators: reward.unitsClaimed! },
                        { allowHTML: true },
                    )}
                </span>
            </div>
            {#if reward.isFinite}
                <div
                    class="text-secondary flex items-center justify-between gap-2 text-sm font-bold"
                >
                    <UnitIcon />
                    <span>
                        {@html $t(
                            "rewards.units-available",
                            { units: reward.unitsAvailable! },
                            { allowHTML: true },
                        )}
                    </span>
                </div>
            {/if}
        </div>
        <div class="flex flex-row gap-4">
            <Button kind="ghost" onclick={() => updateAmount("close")} class="w-full">
                {$t("rewards.reward-donate-close")}
            </Button>
            <Button onclick={() => updateAmount("checkout")} class="w-full">
                {$t("rewards.donation-free.btn")}
            </Button>
        </div>
    </div>
</Modal>
