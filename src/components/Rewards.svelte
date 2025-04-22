<script lang="ts">
    import { cart } from "../stores/cart.ts";
    import { onMount } from "svelte";
    import type { ProjectReward, Project } from "../openapi/client/index";
    import { extractId } from "../utils/extractId";
    import { formatCurrency, getUnit } from "../utils/currencies";
    import {
        apiProjectRewardsGetCollection,
        apiProjectsIdGet,
        apiUsersIdGet,
    } from "../openapi/client/index";
    import { t } from "../i18n/store.ts";
    import { languagesList, type Locale } from "../i18n/locales/index.ts";

    export let project: Project;
    export let projectCurrency: string;

    let rewards: ProjectReward[] = [];
    let error: string | null = null;
    let amount: string = "";

    async function getDisplayName(projectId: string): Promise<string> {
        try {
            const project = await apiProjectsIdGet({ path: { id: projectId } });
            const ownerId = extractId(project.data?.owner);
            if (ownerId) {
                const user = await apiUsersIdGet({ path: { id: ownerId } });
                return user.data?.displayName ?? "";
            }
        } catch (err) {
            console.warn("No se pudo obtener el owner del proyecto:", err);
        }
        return "";
    }

    async function addToCart(reward: ProjectReward) {
        const projectId = extractId(reward.project) ?? "0";
        const target = await getDisplayName(projectId);

        cart.addItem({
            title: reward.title,
            amount: reward.money?.amount ?? 0,
            quantity: 1,
            image: "",
            project: Number(projectId),
            target,
            claimed: (reward.unitsTotal ?? 0) - (reward.unitsAvailable ?? 0),
            accountingId: extractId(project.accounting) ?? "",
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

    async function handleFreeDonation() {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert("Por favor ingresa una cantidad válida.");
            return;
        }

        const target = await getDisplayName(`${project.id}`);

        cart.addItem({
            title: "Donación Libre",
            amount: numericAmount * getUnit(projectCurrency),
            quantity: 1,
            image: "",
            project: Number(project.id),
            target,
            accountingId: extractId(project.accounting) ?? "",
            currency: projectCurrency,
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
            error = "Error al cargar las recompensas o los datos del proyecto.";
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
                    placeholder="Ingresa una cantidad"
                />
                <button
                    type="button"
                    on:click={handleFreeDonation}
                    class="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                >
                    Donar
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
