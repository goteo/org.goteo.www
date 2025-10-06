<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import type { Project, ProjectBudgetItem, Accounting } from "../../openapi/client/index";
    import { apiProjectBudgetItemsGetCollection } from "../../openapi/client/index";
    import Carousel from "../Carousel.svelte";
    import ResumeBudget from "./ResumeBudget.svelte";

    let {
        lang = $bindable(),
        project,
        accounting,
    }: {
        lang: string;
        project: Project;
        accounting: Accounting;
    } = $props();

    const projectId = project.id!.toString();

    let projectsBudgetItems: ProjectBudgetItem[] = $state([]);
    let minimumItems: ProjectBudgetItem[] = $state([]);
    let optimumItems: ProjectBudgetItem[] = $state([]);
    let itemsPerGroup = $state(3);

    $effect(() => {
        apiProjectBudgetItemsGetCollection({
            query: { project: projectId },
            headers: { "Accept-Language": lang },
        }).then((data) => {
            projectsBudgetItems = data.data!;
            minimumItems = projectsBudgetItems.filter((item) => item.deadline === "minimum");
            optimumItems = projectsBudgetItems.filter((item) => item.deadline === "optimum");
        });
    });

    const typeBudget: Record<ProjectBudgetItem["type"], string> = {
        task: "#99FFCC",
        infrastructure: "#462949",
        material: "#E94668",
    };

    function updateItemsPerGroup() {
        // Check for mobile devices using multiple criteria
        const isMobileScreen = window.innerWidth <= 768;
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        const isMobileUserAgent =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
            );

        // Consider it mobile if it's a small screen OR (touch device AND mobile user agent)
        const isMobile = isMobileScreen || (isTouchDevice && isMobileUserAgent);

        itemsPerGroup = isMobile ? 1 : 3;
    }

    onMount(() => {
        updateItemsPerGroup();

        window.addEventListener("resize", updateItemsPerGroup);
    });

    onDestroy(() => {
        return () => {
            window.removeEventListener("resize", updateItemsPerGroup);
        };
    });
</script>

<div class="flex flex-col gap-10">
    <div>
        <ResumeBudget {project} {accounting} />
    </div>
    <div class="flex flex-col gap-10">
        <div class="flex flex-col gap-6">
            <span class="text-secondary text-3xl font-bold">
                {$t("project.tabs.budget.minimum")}:
                {formatCurrency(
                    project.budget?.minimum?.money?.amount,
                    project.budget?.minimum?.money?.currency,
                )}
            </span>
            <Carousel gap={16} showDots={true} {itemsPerGroup}>
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
                            <h2 class="text-secondary line-clamp-1 text-2xl">{item.title}</h2>
                            <p class="text-content line-clamp-3 font-normal">
                                {item.description}
                            </p>
                        </div>
                        <div class="flex flex-row items-center justify-between">
                            <p class="text-2xl text-black">
                                {formatCurrency(item.money.amount, item.money.currency)}
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
            <span class="text-secondary text-3xl font-bold">
                {$t("project.tabs.budget.optimal")}:

                {formatCurrency(
                    project.budget?.optimum?.money?.amount,
                    project.budget?.optimum?.money?.currency,
                )}
            </span>
            <Carousel gap={16} showDots={true} {itemsPerGroup}>
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
                            <h2 class="text-secondary line-clamp-1 text-2xl">{item.title}</h2>
                            <p class="text-content line-clamp-3 font-normal">
                                {item.description}
                            </p>
                        </div>
                        <div class="flex flex-row items-center justify-between">
                            <p class="text-2xl text-black">
                                {formatCurrency(item.money.amount, item.money.currency)}
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
