<script lang="ts">
    interface Tab {
        id: string;
        label: string;
        icon?: any;
    }

    interface Props {
        tabs: Tab[];
        activeTab?: string;
        onTabChange?: (tabId: string) => void;
    }

    let { tabs, activeTab = tabs[0]?.id, onTabChange }: Props = $props();

    let currentTab = $state(activeTab);

    function handleTabClick(tabId: string) {
        currentTab = tabId;

        // Hide all tab content
        const allTabContent = document.querySelectorAll("[data-tab-content]");
        allTabContent.forEach((content) => {
            (content as HTMLElement).style.display = "none";
        });

        // Show selected tab content
        const selectedContent = document.querySelector(`[data-tab-content="${tabId}"]`);
        if (selectedContent) {
            (selectedContent as HTMLElement).style.display = "block";
        }

        if (onTabChange) {
            onTabChange(tabId);
        }
    }
</script>

<div class="flex w-full items-center justify-center">
    <div class="flex cursor-pointer items-center">
        {#each tabs as tab}
            <button
                class="box-border flex items-center justify-center gap-2 overflow-visible rounded-tl-lg rounded-tr-lg border-b-2 px-6 py-2 {currentTab ===
                tab.id
                    ? 'border-primary text-tertiary'
                    : 'border-purple-tint text-secondary'}"
                onclick={() => handleTabClick(tab.id)}
            >
                {#if tab.icon}
                    <div class="size-4 overflow-hidden">
                        <svelte:component this={tab.icon} />
                    </div>
                {/if}
                <span class="text-base leading-6 font-bold">
                    {tab.label}
                </span>
            </button>
        {/each}
    </div>
</div>

<style>
    button {
        transition: all 0.2s ease;
    }

    button:hover {
        opacity: 0.8;
    }
</style>
