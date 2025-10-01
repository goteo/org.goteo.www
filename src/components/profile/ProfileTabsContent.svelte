<script lang="ts">
    import ProfileTabs from "./ProfileTabs.svelte";
    import ProfileDonorType from "./ProfileDonorType.svelte";

    interface Tab {
        id: string;
        label: string;
    }

    interface Props {
        tabs: Tab[];
        bioHtml?: string;
        projectsHtml?: string;
        projectsDonated?: number;
        moneyDonated?: string;
    }

    let { tabs, bioHtml, projectsHtml, projectsDonated, moneyDonated }: Props = $props();

    let activeTab = $state(tabs[0]?.id || "about");

    function handleTabChange(tabId: string) {
        activeTab = tabId;
    }
</script>

<div class="w-full">
    <!-- Tabs Navigation -->
    <div class="mt-8">
        <ProfileTabs {tabs} {activeTab} onTabChange={handleTabChange} />
    </div>

    <!-- Tab Content -->
    <div class="mt-4">
        {#if activeTab === "about"}
            <!-- About/Bio Tab -->
            {#if bioHtml}
                <div class="mx-auto mt-10 w-full max-w-[898px] px-4">
                    <div class="prose prose-base text-secondary leading-6">
                        {@html bioHtml}
                    </div>
                </div>
            {/if}
        {:else if activeTab === "projects"}
            <!-- Projects Tab -->
            {#if projectsHtml}
                <div class="mx-auto mt-10 w-full max-w-[1200px] px-4">
                    {@html projectsHtml}
                </div>
            {:else}
                <div class="mx-auto mt-10 w-full max-w-[898px] px-4 text-center">
                    <p class="text-secondary text-base">No hay proyectos impulsados aún.</p>
                </div>
            {/if}
        {:else if activeTab === "donorType"}
            <!-- Donor Type Tab -->
            <ProfileDonorType {projectsDonated} {moneyDonated} />
        {/if}
    </div>
</div>
