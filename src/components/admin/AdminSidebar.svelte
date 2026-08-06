<script lang="ts">

    import { fade, slide } from "svelte/transition";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { locale, t } from "../../i18n/store";
    import Chevron from "../icons/navigation/Chevron.svelte";
    import Button from "../library/buttons/Button.svelte";

    import type { Component } from "svelte";

    export interface AdminSidebarItem {
        label: string;
        href: string;
        icon?: Component;
    }

    interface Props {
        navItems: AdminSidebarItem[];
        activePath: string;
        class?: ClassNameValue;
    }

    let { navItems, activePath, class: classes = "" }: Props = $props();

    let hoverOpen = $state(false);
    let isMobileOpen = $state(false);

    function toggleMobile() {
        isMobileOpen = !isMobileOpen;
    }

    function closeMobile() {
        isMobileOpen = false;
    }

    function isActive(item: AdminSidebarItem): boolean {
        return item.href === activePath;
    }

    function navItemClass(item: AdminSidebarItem): ClassNameValue {
        return twMerge(
            "hover:bg-variant1 flex content-center items-center w-fit gap-2 rounded-lg px-4 py-2 text-base font-bold transition-colors duration-300 text-secondary",
            isActive(item) && "bg-variant2 hover:bg-variant3",
            !hoverOpen && "justify-center mx-1 w-auto",
        );
    }
</script>

<!-- Desktop sidebar -->
<aside
    class={twMerge(
        "bg-purple-soft z-30 hidden shrink-0 flex-col items-start rounded-2xl py-10 pr-10 pl-5 shadow-sm transition-all duration-300 lg:sticky lg:top-(--sticky-top) lg:flex lg:h-[calc(100vh-var(--sticky-top)-1rem)]",
        hoverOpen ? "w-56.75" : "w-15 items-center px-0",
        classes,
    )}
    onmouseenter={() => (hoverOpen = true)}
    onmouseleave={() => (hoverOpen = false)}
>
    <div class={twMerge("absolute top-1 flex items-center p-2", hoverOpen ? "right-2" : "right-3")}>
        <Chevron direction={hoverOpen ? "left" : "right"} width="20" height="20" />
    </div>

    <nav class="flex min-h-0 w-full flex-1 flex-col gap-2 overflow-y-auto">
        {#each navItems as item}
            <a href={`/${$locale}${item.href}`} class={navItemClass(item) || ""}>
                {#if hoverOpen}
                    {#if item.icon}
                        <item.icon class="size-5 shrink-0" />
                    {/if}
                    <span>{item.label}</span>
                {:else if item.icon}
                    <item.icon class="size-5" />
                {:else}
                    <span class="text-secondary truncate text-sm font-bold" title={item.label}>
                        {item.label.charAt(0)}
                    </span>
                {/if}
            </a>
        {/each}
    </nav>
</aside>

<!-- Mobile backdrop -->
{#if isMobileOpen}
    <dialog
        open
        class="fixed inset-0 z-30 m-0 h-full max-h-none w-full max-w-none border-none bg-black/30 p-0 lg:hidden"
        onclick={closeMobile}
        aria-label={$t("pages.admin.sidebar.aria.close")}
        transition:fade={{ duration: 200 }}
    ></dialog>
{/if}

<!-- Mobile sidebar overlay -->
{#if isMobileOpen}
    <aside
        class="bg-purple-soft fixed top-(--sticky-top) left-0 z-40 flex h-[calc(100vh-var(--sticky-top)-1rem)] w-56.75 flex-col gap-2 rounded-r-2xl py-10 pr-10 pl-5 shadow-xl lg:hidden"
        transition:slide={{ duration: 300, axis: "x" }}
    >
        <nav class="flex min-h-0 w-full flex-1 flex-col gap-2 overflow-y-auto">
            {#each navItems as item}
                <a
                    href={`/${$locale}${item.href}`}
                    class={twMerge(
                        "hover:bg-variant1 text-secondary flex w-fit content-center items-center gap-2 rounded-lg px-4 py-2 text-base font-bold transition-colors duration-300",
                        isActive(item) && "bg-variant2 hover:bg-variant3",
                    )}
                    onclick={closeMobile}
                >
                    {#if item.icon}
                        <item.icon class="size-5 shrink-0" />
                    {/if}
                    <span>{item.label}</span>
                </a>
            {/each}
        </nav>
    </aside>
{/if}

<!-- Mobile floating toggle -->
<Button
    kind="secondary"
    onclick={toggleMobile}
    class={twMerge(
        "bg-purple-soft border-secondary/10 fixed top-1/2 z-50 h-12 w-12 -translate-y-1/2 cursor-pointer rounded-full border p-0 shadow-lg transition-all duration-300 lg:hidden",
        isMobileOpen ? "left-57" : "left-1",
    )}
    aria-label={$t("pages.admin.sidebar.aria.open")}
>
    <Chevron direction={isMobileOpen ? "left" : "right"} width="22" height="22" />
</Button>
