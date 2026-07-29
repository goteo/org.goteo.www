<script lang="ts">
    import type { Snippet } from "svelte";

    import Sidebar from "../components/admin/Sidebar.svelte";

    import type { AdminSidebarItem } from "../components/admin/Sidebar.svelte";

    interface Props {
        navItems: AdminSidebarItem[];
        activePath: string;
        children: Snippet;
    }

    let { navItems, activePath, children }: Props = $props();
</script>

<div class="mb-20 w-full px-2 md:px-6">
    <div class="mx-auto flex max-w-360 px-2">
        <Sidebar {navItems} {activePath} />

        <div class="flex min-w-0 flex-1 flex-col gap-10 pt-10 pl-6">
            {@render children?.()}
        </div>
    </div>
</div>
