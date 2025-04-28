<script lang="ts">
    import { cart } from "../stores/cart.ts";
    import { onMount } from "svelte";
    import type { ProjectReward, Project } from "../openapi/client/index";
    import { extractId } from "../utils/extractId";
    import { formatCurrency, getUnit } from "../utils/currencies";
    import { apiProjectRewardsGetCollection } from "../openapi/client/index";
    import { t } from "../i18n/store.ts";
    import { languagesList, type Locale } from "../i18n/locales/index.ts";
    import ArrowRightIcon from "../svgs/ArrowRightIcon.svelte";

    export let project: Project;
    export let projectCurrency: string;
    export let limit: number = 0;

    let rewards: ProjectReward[] = [];
    let error: string | null = null;
    let amount: string = "";

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
            currency: reward.money?.currency ?? projectCurrency,
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

    // async function handleFreeDonation() {
    //     const numericAmount = Number(amount);
    //     if (isNaN(numericAmount) || numericAmount <= 0) {
    //         alert("Por favor ingresa una cantidad válida.");
    //         return;
    //     }

    //     const target = Number(extractId(project.accounting));

    //     cart.addItem({
    //         title: $t("checkout.cart.freeDonation.title"),
    //         amount: numericAmount * getUnit(projectCurrency),
    //         quantity: 1,
    //         image: "",
    //         project: Number(project.id),
    //         target,
    //         currency: projectCurrency,
    //     });
    // }

    onMount(async () => {
        try {
            const response = await apiProjectRewardsGetCollection({
                query: { project: project.id ? String(project.id) : undefined },
                //query: {},
            });
            rewards = response.data as ProjectReward[];
        } catch (err) {
            console.error(err);
            error = "Error al cargar las recompensas o los datos del proyecto.";
        }
    });
</script>

<section>
    {#if error}
        <p class="text-red-600">{error}</p>
    {:else if rewards.length}
        <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between">
                <h2 class="text-secondary text-2xl font-bold">
                    {$t("reward.trending")}
                </h2>
                <button
                    class="text-tertiary flex cursor-pointer items-center gap-4 rounded-3xl bg-[#E6E5F7] px-6 py-4 font-bold transition"
                    ><ArrowRightIcon />{$t("reward.showAll")}</button
                >
            </div>
            <ul class="flex flex-row gap-6">
                <!-- <div>
                    <input
                        type="text"
                        class="w-full rounded border border-gray-300 p-2"
                        bind:value={amount}
                        placeholder="Ingresa una cantidad"
                    />
                    <button
                        type="button"
                        on:click={handleFreeDonation}
                        class="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                    >
                        Donar
                    </button>
                </div> -->
                {#each limit ? rewards.slice(0, limit) : rewards as reward}
                    <li
                        class="flex flex-col gap-2 rounded-4xl border border-[#F3F3EF] p-4 shadow-[0px_1px_3px_0px_#0000001A]"
                    >
                        <h3 class="text-tertiary text-2xl font-semibold">
                            {reward.title
                                .toLowerCase()
                                .replace(/^./, (match) => match.toUpperCase())}
                        </h3>
                        {#if reward.description}
                            <p class="mb-2 text-sm whitespace-pre-line text-gray-800">
                                {reward.description}
                            </p>
                        {/if}
                        <button
                            type="button"
                            on:click={() => handleDirectDonate(reward)}
                            class="text-tertiary inline-block w-full cursor-pointer rounded-3xl bg-[#E6E5F7] px-6 py-4 font-bold transition"
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
        </div>
    {:else}
        <p>{$t("rewards.unavailable")}</p>
    {/if}
</section>
