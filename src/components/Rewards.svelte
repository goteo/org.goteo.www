<script lang="ts">
    import { cart } from "../stores/cart.ts";
    import { onMount } from "svelte";
    import type { ProjectReward, Project, Accounting } from "../openapi/client/index";
    import { extractId } from "../utils/extractId";
    import { formatCurrency, getUnit, defaultCurrency } from "../utils/currencies";
    import { apiProjectRewardsGetCollection } from "../openapi/client/index";
    import { t } from "../i18n/store.ts";
    import { languagesList, type Locale } from "../i18n/locales/index.ts";

    export let project: Project;
    export let accounting: Accounting;

    let rewards: ProjectReward[] = [];
    let error: string | null = null;
    let amount: string = "";

    async function addToCart(reward: ProjectReward) {
        const projectId = extractId(reward.project) ?? "0";
        const target = extractId(project.accounting) ?? "";

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

    async function handleDirectDonate(reward: ProjectReward) {
        await addToCart(reward);

        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const languages = Object.keys(languagesList) as Locale[];
        const currentLang: Locale = languages.includes(pathParts[0] as Locale)
            ? (pathParts[0] as Locale)
            : "es";

        window.location.href = `/${currentLang}/checkout`;
    }

    async function handleFreeDonation() {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        const target = extractId(project.accounting) ?? "";

        cart.addItem({
            title: "Donación Libre",
            amount: numericAmount * getUnit(accounting.currency),
            quantity: 1,
            image: "",
            project: Number(project.id),
            target,
            currency: accounting.currency || defaultCurrency(),
        });
    }

    onMount(async () => {
        try {
            const response = await apiProjectRewardsGetCollection({
                query: { project: project.id ? String(project.id) : undefined },
                //query: {},
            });
            rewards = response.data as ProjectReward[];
        } catch (err) {
            console.error(err);
            error = "Error fetching rewards";
        }
    });
</script>

<section>
    {#if error}
        <p class="text-red-600">{error}</p>
    {:else if rewards.length}
        <ul class="space-y-8">
            <div>
                <input
                    type="text"
                    class="w-full rounded border border-gray-300 p-2"
                    bind:value={amount}
                    placeholder={$t("reward.input")}
                />
                <button
                    type="button"
                    on:click={handleFreeDonation}
                    class="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                >
                    {$t("reward.btnFreeDonation")}
                </button>
            </div>
            {#each rewards as reward}
                <li class="rounded-md border p-4 shadow-sm">
                    <h3 class="mb-1 text-xl font-semibold">{reward.title}</h3>
                    {#if reward.description}
                        <p class="mb-2 text-sm whitespace-pre-line text-gray-800">
                            {reward.description}
                        </p>
                    {/if}
                    <button
                        type="button"
                        on:click={() => handleDirectDonate(reward)}
                        class="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                    >
                        {reward.money?.currency && reward.money?.amount != null
                            ? formatCurrency(reward.money.amount, reward.money.currency, {
                                  showSymbol: true,
                              })
                            : ""}
                    </button>
                </li>
            {/each}
        </ul>
    {:else}
        <p>{$t("rewards.unavailable")}</p>
    {/if}
</section>
