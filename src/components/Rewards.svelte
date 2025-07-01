<script lang="ts">
    import { cart } from "../stores/cart.ts";
    import { onMount } from "svelte";
    import type { ProjectReward, Project, Accounting } from "../openapi/client/index";
    import { extractId } from "../utils/extractId";
    import { formatCurrency, defaultCurrency } from "../utils/currencies";
    import { renderMarkdown } from "../utils/renderMarkdown";
    import { apiProjectRewardsGetCollection, apiAccountingsIdGet } from "../openapi/client/index";
    import { t } from "../i18n/store.ts";
    import UserIcon from "../svgs/UserIcon.svelte";
    import UnitIcon from "../svgs/UnitIcon.svelte";
    import { getUnit } from "../utils/currencies.ts";
    import { Modal } from "flowbite-svelte";

    let { project, limit, rewards } = $props<{
        project: Project;
        limit?: number;
        rewards?: ProjectReward[] | null;
    }>();

    console.log("Project Rewards", rewards);

    let amount = $state("");
    let rewardModal = $state(false);
    let selectedReward = $state<ProjectReward | null>(null);
    let link = $state(`/calculadora-fiscal`);

    let error = $state<string | null>(null);

    async function addToCart(reward: ProjectReward) {
        const projectId = extractId(reward.project) ?? "0";
        const target = Number(extractId(project.accounting));

        cart.addItem({
            title: reward.title,
            amount: reward.money?.amount ?? 0,
            quantity: 1,
            image: "",
            project: Number(projectId),
            target,
            claimed: (reward.unitsTotal ?? 0) - (reward.unitsAvailable ?? 0),
            currency: reward.money?.currency || defaultCurrency(),
        });
    }

    async function updateAmount(action: "close" | "checkout") {
        const numericAmount = Number(amount);

        if (
            isNaN(numericAmount) ||
            !selectedReward ||
            numericAmount * getUnit(selectedReward.money?.currency ?? undefined) <
                (selectedReward.money?.amount ?? 0)
        ) {
            alert($t("rewards.error-invalid-amount"));
            return;
        }

        const target = Number(extractId(project.accounting));

        cart.addItem({
            title: selectedReward.title,
            amount: numericAmount * getUnit(selectedReward.money?.currency ?? undefined),
            quantity: 1,
            image: "",
            project: Number(extractId(selectedReward.project)),
            target,
            claimed: (selectedReward.unitsTotal ?? 0) - (selectedReward.unitsAvailable ?? 0),
            currency: selectedReward.money?.currency || defaultCurrency(),
        });

        if (action === "checkout") {
            window.location.href = "/checkout";
        } else {
            rewardModal = false;
        }
    }

    async function handleDirectDonate(reward: ProjectReward) {
        await addToCart(reward);
        selectedReward = reward;
        selectedReward = {
            ...selectedReward,
            description: await renderMarkdown(selectedReward.description || ""),
        };
        rewardModal = true;
    }

    async function handleFreeDonation() {
        const numericAmount = Number(amount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert($t("rewards.error-amount"));
            return;
        }

        const { data: accounting } = await apiAccountingsIdGet({
            path: { id: String(extractId(project.accounting)) },
        });

        const unit = getUnit((accounting as Accounting)?.currency);

        const calculatedAmount = numericAmount * unit;

        const target = Number(extractId(project.accounting));

        cart.addItem({
            title: $t("reward.btnFreeDonationLabel"),
            amount: calculatedAmount,
            quantity: 1,
            image: "",
            project: Number(project.id),
            target,
            currency: (accounting as Accounting)?.currency || defaultCurrency(),
        });
        window.location.href = "/checkout";
    }

    function cleanCloseButton() {
        const closeBtn = document.querySelector('button[aria-label="Close"]');
        if (closeBtn) {
            closeBtn.removeAttribute("aria-label");
            closeBtn.querySelectorAll("span").forEach((el) => {
                if (el.textContent?.trim() === "Close") el.remove();
            });
        }
    }

    $effect(() => {
        if (rewardModal) {
            document.body.classList.add("no-scroll");
            cleanCloseButton();
        } else {
            document.body.classList.remove("no-scroll");
        }
    });

    onMount(async () => {
        if (!rewards) {
            try {
                const response = await apiProjectRewardsGetCollection({
                    query: { project: project.id ? String(project.id) : undefined },
                });
                rewards = Array.isArray(response.data) ? (response.data as ProjectReward[]) : [];
            } catch (err) {
                console.error(err);
                error = "Error fetching rewards";
            }
        }
    });
</script>

<section>
    {#if error}
        <p class="text-red-600">{error}</p>
    {:else if rewards && rewards.length}
        <div class="flex flex-col gap-12">
            {#if !limit}
                <h2 class="text-tertiary text-3xl font-bold">
                    {$t("rewards.title")}
                </h2>
            {/if}
            <ul class={limit ? "flex flex-row gap-6" : "grid grid-cols-3 gap-6"}>
                {#if !limit}
                    <div
                        class="flex basis-1/3 flex-col justify-between gap-6 rounded-4xl border border-[#F3F3EF] bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A]"
                    >
                        <div class="flex flex-col gap-6">
                            <h3 class="text-tertiary w-full text-left text-2xl font-semibold">
                                {$t("rewards.donation-free.title")}
                            </h3>
                            <p class="text-sm whitespace-pre-line text-gray-800">
                                {$t("rewards.donation-free.description")}
                            </p>
                        </div>
                        <div class="flex flex-col gap-6">
                            <input
                                type="text"
                                class="w-full rounded border border-gray-300 p-2"
                                bind:value={amount}
                                placeholder={$t("rewards.donation-free.placeholder")}
                            />
                            <button
                                type="button"
                                onclick={handleFreeDonation}
                                class="text-tertiary inline-block w-full cursor-pointer rounded-3xl bg-[#E6E5F7] px-6 py-4 font-bold transition"
                            >
                                {$t("rewards.donation-free.btn")}
                            </button>
                        </div>
                    </div>
                {/if}
                {#each rewards ? (limit ? rewards.slice(0, limit) : rewards) : [] as reward}
                    <li
                        class="flex basis-1/3 flex-col items-center justify-between gap-8 rounded-4xl border border-[#F3F3EF] bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A]"
                        class:opacity-50={!reward.hasUnits}
                        class:cursor-not-allowed={!reward.hasUnits}
                    >
                        {#if !limit}
                            <div class="flex h-[160px] items-center justify-center">🙂</div>
                        {/if}
                        <div class="flex flex-col gap-4">
                            <h3
                                class="text-tertiary line-clamp-2 w-full text-left text-2xl font-semibold"
                            >
                                {#if !limit}
                                    <div>
                                        {@html $t(
                                            "rewards.by-amount",
                                            {
                                                amount: `${
                                                    reward.money?.currency &&
                                                    reward.money?.amount != null
                                                        ? formatCurrency(
                                                              reward.money.amount,
                                                              reward.money.currency,
                                                              {
                                                                  showSymbol: true,
                                                              },
                                                          )
                                                        : ""
                                                }`,
                                            },
                                            { allowHTML: true },
                                        )}
                                    </div>
                                {/if}
                                {reward.title
                                    .toLowerCase()
                                    .replace(/^./, (match: string) => match.toUpperCase())}
                            </h3>

                            {#if reward.description}
                                <p class="line-clamp-6 text-sm whitespace-pre-line text-gray-800">
                                    {@html reward.description}
                                </p>
                            {/if}
                        </div>
                        {#if !limit}
                            <div class="flex w-full justify-between">
                                <div
                                    class="text-tertiary flex items-center justify-between gap-2 text-sm font-bold"
                                >
                                    <UserIcon />
                                    <span>
                                        {@html $t(
                                            "rewards.donators",
                                            {
                                                donators: `${(reward.unitsTotal ?? 0) - (reward.unitsAvailable ?? 0)}`,
                                            },
                                            { allowHTML: true },
                                        )}
                                    </span>
                                </div>
                                <div
                                    class="text-tertiary flex items-center justify-between gap-2 text-sm font-bold"
                                >
                                    <UnitIcon />
                                    <span>
                                        {@html $t(
                                            "rewards.units-available",
                                            {
                                                units: `${reward.unitsAvailable}`,
                                            },
                                            { allowHTML: true },
                                        )}
                                    </span>
                                </div>
                            </div>
                        {/if}

                        <button
                            type="button"
                            onclick={() => handleDirectDonate(reward)}
                            disabled={!reward.hasUnits}
                            class:cursor-not-allowed={!reward.hasUnits}
                            class:cursor-pointer={reward.hasUnits}
                            class="text-tertiary inline-block w-full rounded-3xl bg-[#E6E5F7] px-6 py-4 font-bold transition"
                        >
                            {$t("reward.donate")}
                            {reward.money?.currency && reward.money?.amount != null
                                ? formatCurrency(reward.money.amount, reward.money.currency, {
                                      showSymbol: true,
                                  })
                                : ""}
                        </button>
                    </li>
                {/each}
            </ul>
            <Modal
                bind:open={rewardModal}
                closeBtnClass="top-7 end-7 bg-transparent text-[#462949] hover:bg-transparent hover:text-[#462949] hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-[#462949] dark:hover:text-[#462949] dark:hover:bg-transparent"
                class="!left-1/2 max-w-[800px] p-4 backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
                headerClass="py-2"
            >
                {#if selectedReward}
                    <div class="flex flex-col gap-6">
                        <div
                            class="text-tertiary flex w-full flex-col gap-6 text-left text-[40px] font-semibold"
                        >
                            <h3>
                                {@html $t(
                                    "rewards.by-amount-or-more",
                                    {
                                        amount: `${
                                            selectedReward.money?.currency &&
                                            selectedReward.money?.amount != null
                                                ? formatCurrency(
                                                      selectedReward.money.amount,
                                                      selectedReward.money.currency,
                                                      {
                                                          showSymbol: true,
                                                      },
                                                  )
                                                : ""
                                        }`,
                                    },
                                    { allowHTML: true },
                                )}
                            </h3>
                            <h3>{$t("rewards.thanks-message")}</h3>
                        </div>
                        <div class="flex flex-row gap-4">
                            <div class="flex h-[240px] w-[240px] items-center justify-center">
                                🙂
                            </div>
                            <div class=" flex min-w-0 flex-1 flex-col gap-2">
                                <p class="text-gray-700">
                                    {@html selectedReward.description}
                                </p>
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
                                        bind:value={amount}
                                        placeholder={$t("rewards.donation-free.placeholder")}
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex w-full gap-2">
                            <div
                                class="text-tertiary flex items-center justify-between gap-2 text-sm font-bold"
                            >
                                <UserIcon />
                                <span>
                                    {@html $t(
                                        "rewards.donators",
                                        {
                                            donators: `${(selectedReward.unitsTotal ?? 0) - (selectedReward.unitsAvailable ?? 0)}`,
                                        },
                                        { allowHTML: true },
                                    )}
                                </span>
                            </div>
                            <div
                                class="text-tertiary flex items-center justify-between gap-2 text-sm font-bold"
                            >
                                <UnitIcon />
                                <span>
                                    {@html $t(
                                        "rewards.units-available",
                                        {
                                            units: `${selectedReward.unitsAvailable}`,
                                        },
                                        { allowHTML: true },
                                    )}
                                </span>
                            </div>
                        </div>
                        <div class="flex flex-row gap-4">
                            <button
                                type="button"
                                onclick={() => updateAmount("close")}
                                class="text-tertiary border-tertiary inline-block w-full cursor-pointer rounded-3xl border bg-[#FFF] px-6 py-4 font-bold transition"
                            >
                                {$t("rewards.reward-donate-close")}
                            </button>
                            <button
                                type="button"
                                onclick={() => updateAmount("checkout")}
                                class="text-tertiary bg-primary bg inline-block w-full cursor-pointer rounded-3xl px-6 py-4 font-bold transition"
                            >
                                {$t("rewards.donation-free.btn")}
                            </button>
                        </div>
                    </div>
                {:else}
                    <p>{$t("rewards.loading")}</p>
                {/if}
            </Modal>
        </div>
    {:else}
        <p>{$t("rewards.unavailable")}</p>
    {/if}
</section>
