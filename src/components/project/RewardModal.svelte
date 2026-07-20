<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import { onMount } from "svelte";

    import { t } from "../../i18n/store";
    import { cart } from "../../stores/cart";
    import { formatCurrency, getUnit } from "../../utils/currencies";
    import { getDefaultCurrency } from "../../utils/consts";
    import { lt } from "../../utils/money";
    import { renderMarkdown } from "../../utils/renderMarkdown";
    import UnitIcon from "../icons/UnitIcon.svelte";
    import UserIcon from "../icons/user/User.svelte";
    import Button from "../library/buttons/Button.svelte";

    import type { Project, ProjectReward } from "../../openapi/client";

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
            lt(
                {
                    amount: numericAmount * getUnit(reward.money?.currency),
                    currency: reward.money.currency,
                },
                reward.money ?? { amount: 0, currency: getDefaultCurrency() },
            )
        ) {
            alert($t("pages.project.view.rewards.error.invalidAmount"));
            return;
        }

        cart.addItem({
            kind: "reward",
            type: "single",
            reward: reward,
            title: reward.title,
            quantity: 1,
            recipient: reward.project,
            recipientDisplayName: project.title,
            target: project.accounting!,
            money: {
                amount: numericAmount * getUnit(reward.money?.currency),
                currency: reward.money.currency,
            },
        });

        if (action === "checkout") {
            window.location.href = "/checkout";
        } else {
            open = false;
        }
    }

    onMount(() => {
        rawInput = formatCurrency(reward.money);
        customAmount = +formatCurrency(reward.money, {
            asLocaleString: false,
        });
    });
</script>

<Modal
    bind:open
    closeBtnClass="top-7 end-7 bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 w-full max-w-225 -translate-x-1/2 -translate-y-1/2 bg-transparent backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    bodyClass="p-0"
>
    <div
        class="flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-lg"
        onclick={(e) => e.stopPropagation()}
        role="presentation"
    >
        <div
            class="text-secondary flex w-full flex-col gap-6 text-left text-[2.5rem] font-semibold"
        >
            <h3>
                {@html $t(
                    "domain.project.reward.byAtLeastOrMore",
                    {
                        amount: `${formatCurrency(reward.money)}`,
                    },
                    { allowHTML: true },
                )}
            </h3>
            <h3>{$t("pages.project.view.rewards.thanksMessage")}</h3>
        </div>
        <div class="flex flex-row gap-4">
            <div class="marked-content flex min-w-0 flex-1 flex-col gap-2 text-gray-700">
                {#await renderMarkdown(reward.description!) then content}
                    {@html content}
                {/await}
                <p class="mb-8">
                    {@html $t(
                        "pages.project.view.rewards.ivaMessage",
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
                        placeholder={$t("pages.project.view.rewards.donationFree.placeholder")}
                    />
                </div>
            </div>
        </div>
        <div class="flex w-full gap-2">
            <div class="text-secondary flex items-center justify-between gap-2 text-sm font-bold">
                <UserIcon />
                <span>
                    {@html $t(
                        "domain.project.reward.donators",
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
                            "domain.project.reward.unitsAvailable",
                            { units: reward.unitsAvailable! },
                            { allowHTML: true },
                        )}
                    </span>
                </div>
            {/if}
        </div>
        <div class="flex flex-row gap-4">
            <Button kind="ghost" onclick={() => updateAmount("close")} class="w-full">
                {$t("pages.project.view.rewards.addToCart")}
            </Button>
            <Button onclick={() => updateAmount("checkout")} class="w-full">
                {$t("common.donate")}
            </Button>
        </div>
    </div>
</Modal>
