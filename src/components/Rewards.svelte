<script lang="ts">
    import { cart } from "../stores/cart.ts";
    import { onMount } from "svelte";
    import type { ProjectReward } from "../openapi/client/index";
    import { extractId } from "../utils/extractId";
    import { formatCurrency, getUnit } from "../utils/currencies";

    import {
        apiProjectRewardsGetCollection,
        apiProjectsIdGet,
        apiUsersIdGet,
    } from "../openapi/client/index";

    let rewards: ProjectReward[] = [];
    let error: string | null = null;
    let amount: string;

    async function addToCart(reward: ProjectReward) {
        const projectId = extractId(reward.project) ?? "0";

        let owner = null;

        try {
            const project = await apiProjectsIdGet({ path: { id: projectId } });

            const ownerId = extractId(project.data?.owner);
            if (ownerId) {
                owner = await apiUsersIdGet({ path: { id: ownerId } });
            }
        } catch (err) {
            console.warn("No se pudo obtener los datos del proyecto o del owner:", err);
        }

        cart.addItem({
            title: reward.title,
            amount: reward.money?.amount ?? 0,
            quantity: 1,
            image: "",
            project: Number(projectId),
            owner: owner?.data?.displayName,
        });
    }

    async function handleDirectDonate(reward: ProjectReward) {
        await addToCart(reward);

        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const languages = ["es", "en", "ca", "eu", "gl", "fr", "de"];
        const currentLang = languages.includes(pathParts[0]) ? pathParts[0] : "es";

        const newPath = `/${currentLang}/checkout`;
        window.location.href = newPath;
    }

    onMount(async () => {
        try {
            const response = await apiProjectRewardsGetCollection({
                // query: { project: data.id ? String(data.id) : undefined },
                query: {},
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
                />
                <button
                    type="button"
                    on:click={() =>
                        cart.addItem({
                            title: "Donación Libre",
                            /* TODO: Fix currency */
                            amount: Number(amount) * getUnit("EUR"),
                            quantity: 1,
                            image: "",
                        })}
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
        <p>No hay recompensas disponibles.</p>
    {/if}
</section>
