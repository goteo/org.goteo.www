<script lang="ts">
    import { onMount } from "svelte";

    import Sidebar from "../components/admin/AdminSidebar.svelte";

    import type { AdminSidebarItem } from "../components/admin/AdminSidebar.svelte";
    import type { Snippet } from "svelte";

    interface Props {
        navItems: AdminSidebarItem[];
        activePath: string;
        children: Snippet;
    }

    let { navItems, activePath, children }: Props = $props();

    let resolvedActivePath = $state(activePath);

    onMount(() => {
        resolvedActivePath = activePath + window.location.hash;

        function onHashChange() {
            resolvedActivePath = activePath + window.location.hash;
        }

        window.addEventListener("hashchange", onHashChange);
        return () => window.removeEventListener("hashchange", onHashChange);
    });
</script>

<div class="mb-20 w-full px-2 md:px-6">
    <div class="mx-auto flex max-w-360 px-2">
        <Sidebar {navItems} activePath={resolvedActivePath} />

        <div class="flex min-w-0 flex-1 flex-col gap-10 pt-10 pl-6">
            {@render children?.()}
        </div>
    </div>
</div>
