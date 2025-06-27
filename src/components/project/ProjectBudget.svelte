<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import type { Project, ProjectBudgetItem, Accounting } from "../../openapi/client/index";
    import { apiProjectBudgetItemsGetCollection } from "../../openapi/client/index";
    import Carousel from "../Carousel.svelte";
    import ResumeBudget from "./ResumeBudget.svelte";

    const { project, accounting } = $props<{ project: Project; accounting: Accounting }>();
    let projectsBudgetItems: ProjectBudgetItem[] = $state([]);
    let minimumItems: ProjectBudgetItem[] = $state([]);
    let optimumItems: ProjectBudgetItem[] = $state([]);

    const typeBudget: Record<ProjectBudgetItem["type"], string> = {
        task: "#99FFCC",
        infrastructure: "#462949",
        material: "#E94668",
    };

    onMount(async () => {
        const { data } = await apiProjectBudgetItemsGetCollection({
            query: { project: `/v4/projects/${project.id}` },
        });
        projectsBudgetItems = data || [];
        minimumItems = projectsBudgetItems.filter((item) => item.deadline === "minimum");
        optimumItems = projectsBudgetItems.filter((item) => item.deadline === "optimum");
    });
</script>

<div class="flex flex-col gap-10">
    <div>
        <ResumeBudget {project} {accounting} />
    </div>
    <div class="flex flex-col gap-10">
        <div class="flex flex-col gap-6">
            <span class="text-tertiary text-2xl font-bold">
                {$t("project.tabs.budget.minimum")}:
                {formatCurrency(
                    project.budget.minimum.money.amount,
                    project.budget.minimum.money.currency,
                    {
                        showSymbol: true,
                    },
                )}
            </span>
            <Carousel gap={16} showDots={true} itemsPerGroup={3}>
                {#if minimumItems.length === 0}
                    <div
                        class="flex h-[140px] w-full items-center justify-center rounded bg-indigo-100 font-bold"
                    >
                        {$t("project.tabs.updates.content.empty")}
                    </div>
                {/if}

                {#each minimumItems as item}
                    <div
                        class="flex w-full flex-col justify-between gap-6 rounded-4xl bg-white p-6 font-bold"
                    >
                        <div class="flex flex-col gap-4">
                            <h2 class="text-tertiary line-clamp-1 text-2xl">{item.title}</h2>
                            <p
                                class="line-clamp-3 font-normal text-[#575757]
"
                            >
                                {item.description}
                            </p>
                        </div>
                        <div class="flex flex-row items-center justify-between">
                            <p class="text-secondary text-2xl">
                                {formatCurrency(item.money.amount, item.money.currency, {
                                    showSymbol: true,
                                })}
                            </p>
                            <div class="flex items-center gap-2">
                                <div
                                    class="inline-block h-[10px] w-5 rounded-lg"
                                    style={`background-color: ${typeBudget[item.type]}`}
                                ></div>
                                <span class="capitalize">{item.type}</span>
                            </div>
                        </div>
                    </div>
                {/each}
            </Carousel>
        </div>
        <div class="flex flex-col gap-6">
            <div></div>
            <span class="text-tertiary text-2xl font-bold">
                {$t("project.tabs.budget.optimal")}:

                {formatCurrency(
                    project.budget.optimum.money.amount,
                    project.budget.optimum.money.currency,
                    {
                        showSymbol: true,
                    },
                )}
            </span>
            <Carousel gap={16} showDots={true} itemsPerGroup={3}>
                {#if optimumItems.length === 0}
                    <div
                        class="flex h-[140px] w-full items-center justify-center rounded bg-indigo-100 font-bold"
                    >
                        {$t("project.tabs.updates.content.empty")}
                    </div>
                {/if}

                {#each optimumItems as item}
                    <div
                        class="flex w-full flex-col justify-between gap-6 rounded-4xl bg-white p-6 font-bold"
                    >
                        <div class="flex flex-col gap-4">
                            <h2 class="text-tertiary line-clamp-1 text-2xl">{item.title}</h2>
                            <p
                                class="line-clamp-3 font-normal text-[#575757]
"
                            >
                                {item.description}
                            </p>
                        </div>
                        <div class="flex flex-row items-center justify-between">
                            <p class="text-secondary text-2xl">
                                {formatCurrency(item.money.amount, item.money.currency, {
                                    showSymbol: true,
                                })}
                            </p>
                            <div class="flex items-center gap-2">
                                <div
                                    class="inline-block h-[10px] w-5 rounded-lg"
                                    style={`background-color: ${typeBudget[item.type]}`}
                                ></div>
                                <span class="capitalize">{item.type}</span>
                            </div>
                        </div>
                    </div>
                {/each}
            </Carousel>
        </div>
    </div>
</div>
