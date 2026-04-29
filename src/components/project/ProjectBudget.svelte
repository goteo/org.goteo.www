<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import ResumeBudget from "./ResumeBudget.svelte";
    import { t } from "../../i18n/store";
    import { apiProjectBudgetItemsGetCollection } from "../../openapi/client/index";
    import { formatCurrency } from "../../utils/currencies";
    import Carousel from "../Carousel.svelte";
    import PublicBudgetCard from "./PublicBudgetCard.svelte";

    import type { Project, ProjectBudgetItem, Accounting } from "../../openapi/client/index";

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
                {$t("pages.project.view.tabs.budget.minimum")}:
                {formatCurrency(
                    project.budget?.minimum?.money?.amount,
                    project.budget?.minimum?.money?.currency,
                )}
            </span>
            <Carousel gap={16} showDots={true} {itemsPerGroup}>
                {#if minimumItems.length === 0}
                    <div
                        class="flex h-35 w-full items-center justify-center rounded bg-indigo-100 font-bold"
                    >
                        {$t("pages.project.view.tabs.updates.content.empty")}
                    </div>
                {/if}

                {#each minimumItems as item}
                    <PublicBudgetCard {item} />
                {/each}
            </Carousel>
        </div>
        <div class="flex flex-col gap-6">
            <div></div>
            <span class="text-secondary text-3xl font-bold">
                {$t("pages.project.view.tabs.budget.optimal")}:

                {formatCurrency(
                    project.budget?.optimum?.money?.amount,
                    project.budget?.optimum?.money?.currency,
                )}
            </span>
            <Carousel gap={16} showDots={true} {itemsPerGroup}>
                {#if optimumItems.length === 0}
                    <div
                        class="flex h-35 w-full items-center justify-center rounded bg-indigo-100 font-bold"
                    >
                        {$t("pages.project.view.tabs.updates.content.empty")}
                    </div>
                {/if}

                {#each optimumItems as item}
                    <PublicBudgetCard {item} />
                {/each}
            </Carousel>
        </div>
    </div>
</div>
