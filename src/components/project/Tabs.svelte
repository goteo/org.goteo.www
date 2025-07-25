<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { renderMarkdown } from "../../utils/renderMarkdown";
    import ProjectRewards from "./ProjectRewards.svelte";
    import ProjectUpdate from "./ProjectUpdate.svelte";
    import ProjectBudget from "./ProjectBudget.svelte";
    import ProjectCommunity from "./ProjectCommunity.svelte";
    import type { Project, Accounting } from "../../openapi/client/index";

    let { project, accounting } = $props<{ project: Project; accounting: Accounting }>();
    let contentDescription = $state("");
    let activeTab = $state("rewards");

    const tabs = [
        { id: "rewards", label: $t("project.tabs.rewards") },
        { id: "project", label: $t("project.tabs.project") },
        { id: "budget", label: $t("project.tabs.budget.title") },
        { id: "updates", label: $t("project.tabs.updates.title") },
        { id: "community", label: $t("project.tabs.community.title") },
    ];

    function selectTab(tabId: string) {
        activeTab = tabId;
    }

    onMount(async () => {
        contentDescription = await renderMarkdown(project.description || "");
    });
</script>

<div class="wrapper">
    <div class="flex space-x-6" role="tablist" aria-label="Project tabs">
        {#each tabs as tab}
            <button
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tab-${tab.id}`}
                id={`tab-button-${tab.id}`}
                class="text-tertiary inline-flex items-center rounded-t-lg border-t-1 border-r-1 border-l-1 border-[#E6E5F7] px-6 py-2 font-bold transition-colors duration-100 ease-in-out"
                class:bg-[#E6E5F7]={activeTab === tab.id}
                onclick={() => selectTab(tab.id)}
            >
                {tab.label}
            </button>
        {/each}
    </div>
</div>

<div class="flex w-full justify-center bg-[#E6E5F7] py-20">
    <div class="wrapper flex items-center justify-center">
        {#if activeTab === "rewards"}
            <div
                id="tab-rewards"
                role="tabpanel"
                aria-labelledby="tab-button-rewards"
                class="w-full"
            >
                <ProjectRewards {project} />
            </div>
        {:else if activeTab === "project"}
            <div
                id="tab-project"
                role="tabpanel"
                aria-labelledby="tab-button-project"
                class="flex max-w-4xl flex-col items-center gap-4"
            >
                {@html contentDescription}
            </div>
        {:else if activeTab === "budget"}
            <div id="tab-budget" role="tabpanel" aria-labelledby="tab-button-budget" class="w-full">
                <ProjectBudget {project} {accounting} />
            </div>
        {:else if activeTab === "updates"}
            <div
                id="tab-updates"
                role="tabpanel"
                aria-labelledby="tab-button-updates"
                class="w-full"
            >
                <ProjectUpdate {project} />
            </div>
        {:else if activeTab === "community"}
            <div
                id="tab-community"
                role="tabpanel"
                aria-labelledby="tab-button-community"
                class="w-full"
            >
                <ProjectCommunity {project} />
            </div>
        {/if}
    </div>
</div>
