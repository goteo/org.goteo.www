<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { renderMarkdown } from "../../utils/renderMarkdown";

    let { project } = $props();
    let contentDescription = $state("");
    let activeTab = $state("rewards");

    const tabs = [
        { id: "rewards", label: $t("project.tabs.rewards") },
        { id: "project", label: $t("project.tabs.project") },
        { id: "budget", label: $t("project.tabs.budget") },
        { id: "updates", label: $t("project.tabs.updates") },
        { id: "community", label: $t("project.tabs.community") },
    ];

    function selectTab(tabId: string) {
        activeTab = tabId;
    }

    onMount(async () => {
        contentDescription = await renderMarkdown(project.description || "");
    });
</script>

<div class="border-b border-gray-200">
    <div class="flex space-x-6" role="tablist" aria-label="Project tabs">
        {#each tabs as tab}
            <button
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tab-${tab.id}`}
                id={`tab-button-${tab.id}`}
                class="text-tertiary inline-flex items-center rounded-t-lg px-6 py-2 font-bold transition-colors duration-100 ease-in-out"
                class:bg-[#E6E5F7]={activeTab === tab.id}
                onclick={() => selectTab(tab.id)}
            >
                {tab.label}
            </button>
        {/each}
    </div>
</div>

<div class="flex justify-center bg-[#E6E5F7] py-20">
    {#if activeTab === "rewards"}
        <div id="tab-rewards" role="tabpanel" aria-labelledby="tab-button-rewards">
            Contenido de las recompensas
        </div>
    {:else if activeTab === "project"}
        <div
            id="tab-project"
            role="tabpanel"
            aria-labelledby="tab-button-project"
            class="flex max-w-4xl flex-col items-center gap-4 px-4"
        >
            {@html contentDescription}
        </div>
    {:else if activeTab === "budget"}
        <div id="tab-budget" role="tabpanel" aria-labelledby="tab-button-budget">
            Contenido de necesidades del presupuesto
        </div>
    {:else if activeTab === "updates"}
        <div id="tab-updates" role="tabpanel" aria-labelledby="tab-button-updates">
            Contenido de actualizaciones
        </div>
    {:else if activeTab === "community"}
        <div id="tab-community" role="tabpanel" aria-labelledby="tab-button-community">
            Contenido de comunidad
        </div>
    {/if}
</div>
