<script lang="ts">
    import { t } from "../../i18n/store";

    const tabs = [
        { id: "rewards", label: $t("project.tabs.rewards") },
        { id: "project", label: $t("project.tabs.project") },
        { id: "budget", label: $t("project.tabs.budget") },
        { id: "updates", label: $t("project.tabs.updates") },
        { id: "community", label: $t("project.tabs.community") },
    ];

    let activeTab = "rewards";

    function selectTab(tabId: string) {
        activeTab = tabId;
    }
</script>

<div class="border-b border-gray-200">
    <nav class="-mb-px flex space-x-6">
        {#each tabs as tab}
            <button
                class="text-tertiary inline-flex items-center rounded-lg px-6 py-2 font-bold transition-colors duration-100 ease-in-out"
                class:bg-[#E6E5F7]={activeTab === tab.id}
                on:click={() => selectTab(tab.id)}
            >
                {tab.label}
            </button>
        {/each}
    </nav>
</div>

<div class="bg-[#E6E5F7] py-6">
    {#if activeTab === "rewards"}
        <slot name="rewards">Contenido de la información de campaña</slot>
    {:else if activeTab === "budget"}
        <slot name="budget">Contenido de necesidades del presupuesto</slot>
    {:else if activeTab === "project"}
        <slot name="project">Contenido de recompensas</slot>
    {:else if activeTab === "updates"}
        <slot name="updates">Contenido de actualizaciones</slot>
    {:else if activeTab === "community"}
        <slot name="community">Contenido de comunidad</slot>
    {/if}
</div>
