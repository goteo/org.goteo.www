<script lang="ts">
    import { t } from "../../../i18n/store";
    import {
        apiProjectBudgetItemsGetCollection,
        type Project,
        type ProjectBudgetItem,
    } from "../../../openapi/client";
    import { formatCurrency } from "../../../utils/currencies";
    import Button from "../../library/Button.svelte";
    import Grid from "../../library/Grid.svelte";
    import BudgetCard from "../BudgetCard.svelte";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";

    let {
        project,
    }: {
        project: Project;
    } = $props();

    let minBudgetItems: ProjectBudgetItem[] = $state([]);
    let optBudgetItems: ProjectBudgetItem[] = $state([]);

    async function loadBudgetItems() {
        if (!project) return;

        const projectIri = apiProjectsGetCollectionUrl + "/" + (project.slug ?? project.id);

        // Get all budget items in current project and store them in items var
        const { data, error } = await apiProjectBudgetItemsGetCollection({
            query: { project: projectIri },
        });

        minBudgetItems = [];
        optBudgetItems = [];

        if (error) console.error("Error loading budget items:", error);
        else if (data) {
            data.forEach((item) => {
                if (item.deadline === "minimum") minBudgetItems.push(item);
                else if (item.deadline === "optimum") optBudgetItems.push(item);
            });
        }
    }

    function handleEdit() {}

    $effect(() => {
        if (project) {
            loadBudgetItems();
        }
    });
</script>

<div class="flex flex-col gap-10">
    <div class="space-y-4">
        <h1 class="text-3xl leading-12 font-bold text-black lg:text-[40px]">
            {$t("wizard.budget.title")}
        </h1>
        <p class="text-content text-base">{$t("wizard.budget.subtitle")}</p>
    </div>

    <div class="flex flex-col gap-6">
        <span class="text-secondary text-3xl font-bold">
            {$t("wizard.budget.minimum")}:
            {formatCurrency(
                project.budget?.minimum?.money?.amount,
                project.budget?.minimum?.money?.currency,
            )}
        </span>
        <Grid>
            {#snippet children()}
                {#each minBudgetItems as item}
                    <BudgetCard {item} isEditable={true} onEdit={handleEdit} />
                {/each}
                <!-- TODO: Add CreateCard component and modify it to admit budget variant -->
            {/snippet}
        </Grid>
    </div>
    <div class="flex flex-col gap-6">
        <span class="text-secondary text-3xl font-bold">
            {$t("wizard.budget.optimum")}:
            {formatCurrency(
                project.budget?.optimum?.money?.amount,
                project.budget?.optimum?.money?.currency,
            )}
        </span>
        <Grid>
            {#snippet children()}
                {#each optBudgetItems as item}
                    <BudgetCard {item} isEditable={true} onEdit={handleEdit} />
                {/each}
                <!-- TODO: Add CreateCard component and modify it to admit budget variant -->
            {/snippet}
        </Grid>
    </div>
</div>

<Button kind="primary" size="md" onclick={handleContinue} class="min-w-[200px]">
    {#snippet children()}
        {$t("wizard.campaignInfo.continue")}
    {/snippet}
</Button>
