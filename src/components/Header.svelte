<script lang="ts">
    import { clickOutside } from "flowbite-svelte";

    import CartButton from "./CartButton.svelte";
    import HeaderButtons from "./HeaderButtons.svelte";
    import UiLanguages from "./UiLanguages.svelte";
    import { session } from "../auth/store";
    import CloseMenu from "./icons/CloseMenu.svelte";
    import { t } from "../i18n/store";
    import Logo from "../svgs/Logo.svelte";
    import MenuIcon from "../svgs/MenuIcon.svelte";
    import Search from "./icons/Search.svelte";
    import UserIcon from "./icons/User.svelte";

    function isHidden(element: HTMLElement): boolean {
        return element.classList.contains("hidden");
    }

    let mobileMenu: HTMLDivElement;
    let menuIcon: HTMLDivElement;
    let closeIcon: HTMLDivElement;

    function mobileMenuToggle() {
        if (isHidden(mobileMenu)) {
            mobileMenuOpen();
        } else {
            mobileMenuClose();
        }
    }

    function mobileMenuOpen() {
        mobileMenu!.classList.remove("hidden");
        setTimeout(() => {
            mobileMenu!.classList.remove("translate-y-[-20px]", "opacity-0");
        }, 10);

        menuIcon.classList.add("hidden");
        closeIcon.classList.remove("hidden");
    }

    function mobileMenuClose() {
        mobileMenu.classList.add("translate-y-[-20px]", "opacity-0");
        setTimeout(() => {
            mobileMenu.classList.add("hidden");
        }, 200);

        closeIcon.classList.add("hidden");
        menuIcon.classList.remove("hidden");
    }

    let userDropdown: HTMLDivElement;

    function userDropdownToggle() {
        if (isHidden(userDropdown)) {
            userDropdown.classList.add("flex");
        }

        userDropdown.classList.toggle("hidden");
    }

    function userDropdownClose() {
        userDropdown.classList.add("hidden");
    }
</script>

<header class="sticky top-0 z-100 w-full px-2 py-3 md:px-6 md:py-8">
    <div class="mx-auto max-w-[1440px] px-2">
        <div
            class="border-grey flex flex-col rounded-xl border bg-white/50 backdrop-blur-xl transition-all duration-300"
            id="header-container"
        >
            <div
                class="flex items-center justify-between px-2 py-3 md:px-4 md:py-6"
                id="header-main"
            >
                <div class="flex items-center gap-2 md:gap-4">
                    <a href="/" class="shrink-0"><Logo /></a>
                    <div class="hidden sm:block">
                        <HeaderButtons />
                    </div>
                </div>
                <nav>
                    <ul class="flex items-center gap-1 md:gap-4">
                        {#if $session}
                            <li class="flex items-center pr-2">
                                <CartButton />
                            </li>
                        {/if}
                        <li class="flex items-center gap-1 pr-2 text-sm md:text-base">
                            {#if $session}
                                <div class="relative inline-block w-full">
                                    <button
                                        onclick={userDropdownToggle}
                                        use:clickOutside={userDropdownClose}
                                        class="flex w-full cursor-pointer items-center gap-1"
                                    >
                                        <UserIcon />
                                        <span class="hidden sm:inline">
                                            {$t("common.greeting")}, {$session.person?.firstName}
                                        </span>
                                    </button>

                                    <div
                                        bind:this={userDropdown}
                                        class="absolute top-full left-0 mt-2 hidden w-full min-w-[120px] flex-col rounded-lg bg-white p-2 shadow-lg"
                                    >
                                        <a
                                            href="/me"
                                            class="border-grey text-secondary hover:bg-grey block w-full overflow-hidden border-b px-4 py-2 font-bold overflow-ellipsis"
                                        >
                                            {$t("header.goToProfile")}
                                        </a>
                                        <a
                                            href="/logout"
                                            class="text-secondary hover:bg-grey block w-full cursor-pointer overflow-hidden px-4 py-2 font-bold overflow-ellipsis"
                                        >
                                            {$t("logout.label")}
                                        </a>
                                    </div>
                                </div>
                            {:else}
                                <a href="/login" class="flex w-full items-center gap-1">
                                    <UserIcon />
                                    <span class="hidden sm:inline">{$t("header.login")}</span>
                                </a>
                            {/if}
                        </li>
                        <li class="hidden items-center pr-2 md:flex">
                            <UiLanguages />
                        </li>
                        <li class="flex items-center md:hidden">
                            <button class="p-1" onclick={mobileMenuToggle}>
                                <div bind:this={menuIcon}>
                                    <MenuIcon />
                                </div>
                                <div bind:this={closeIcon} class="hidden">
                                    <CloseMenu />
                                </div>
                            </button>
                        </li>
                        <li class="hidden items-center md:flex">
                            <MenuIcon />
                        </li>
                    </ul>
                </nav>
            </div>

            <div
                bind:this={mobileMenu}
                class="hidden transform overflow-hidden opacity-0 transition-all duration-300 ease-in-out md:hidden"
            >
                <div class="border-grey border-t">
                    <div class="flex flex-col gap-4 p-4">
                        <div class="flex gap-2">
                            <a
                                href="/search"
                                class="font-karla text-secondary disabled:bg-grey bg-purple-tint flex w-auto items-center justify-center gap-2 rounded-2xl px-4 py-2 text-base leading-6 font-bold transition hover:cursor-pointer"
                            >
                                <Search width="16" height="16" />
                                {$t("header.search")}
                            </a>

                            <a
                                href="/create/project"
                                class="font-karla bg-primary text-secondary hover:bg-primary flex-1 rounded-lg px-3 py-2 text-center text-base leading-6 font-bold"
                            >
                                {$t("header.createProject")}
                            </a>
                        </div>

                        <div class="flex flex-col gap-2 pt-1">
                            <UiLanguages />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
