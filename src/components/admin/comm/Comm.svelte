<script lang="ts">
    import { onMount } from "svelte";

    import Banners from "./banners/Banners.svelte";
    import { t } from "../../../i18n/store";
    import Newsletter from "../Newsletter.svelte";

    import type { Component } from "svelte";

    import type { BannerRecord } from "../../../repositories/banner";
    import type { Component } from "svelte";

    interface Props {
        banners: BannerRecord[];
    }

    let { banners }: Props = $props();

    interface CommTab {
        id: string;
        hash: string;
        label: string;
        component: Component;
    }

    const tabs: CommTab[] = [
        {
            id: "banners",
            hash: "#banners",
            label: $t("pages.admin.comm.tabs.banners"),
            component: Banners,
        },
        {
            id: "newsletter",
            hash: "#newsletter",
            label: $t("pages.admin.comm.tabs.newsletter"),
            component: Newsletter,
        },
    ];

    let activeTab = $state<string>("");

    function resolveTab(): string {
        const hash = window.location.hash;
        const match = tabs.find((t) => t.hash === hash);
        return match ? match.id : (tabs[0]?.id ?? "");
    }

    onMount(() => {
        if (tabs.length === 0) return;

        if (!window.location.hash) {
            window.location.hash = tabs[0].hash;
        } else {
            activeTab = resolveTab();
        }

        const onHashChange = () => (activeTab = resolveTab());
        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    });
</script>

<nav class="mb-6 flex gap-4">
    {#each tabs as tab}
        <a
            href={tab.hash}
            class:font-bold={activeTab === tab.id}
            class:text-secondary={activeTab === tab.id}
            class="text-content hover:text-secondary"
        >
            {tab.label}
        </a>
    {/each}
</nav>

{#each tabs as tab}
    {#if tab.id === activeTab}
        <tab.component {banners} />
    {/if}
{/each}
