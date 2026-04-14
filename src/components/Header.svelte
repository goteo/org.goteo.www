<script lang="ts">
    import HeaderCart from "./HeaderCart.svelte";
    import HeaderLanguages from "./HeaderLanguages.svelte";
    import HeaderLogin from "./HeaderLogin.svelte";
    import { session } from "../auth/store";
    import { t } from "../i18n/store";
    import CloseIconMenu from "../svgs/CloseIconMenu.svelte";
    import Logo from "../svgs/Logo.svelte";
    import MenuIcon from "../svgs/MenuIcon.svelte";
    import SearchIcon from "../svgs/SearchIcon.svelte";
    import Button from "./library/Button.svelte";

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
</script>

<header class="sticky top-0 z-100 w-full px-2 py-3 md:px-6 md:py-8">
    <div class="mx-auto max-w-360">
        <div
            class="border-grey flex flex-col rounded-xl border bg-white/50 backdrop-blur-xl transition-all duration-300"
            id="domain.header-container"
        >
            <div
                class="flex items-center justify-between px-2 py-3 md:px-4 md:py-6"
                id="domain.header-main"
            >
                <div class="flex items-center gap-2 md:gap-4">
                    <a href="/" class="shrink-0"><Logo /></a>
                    <div class="hidden sm:flex sm:gap-2">
                        <a href="/search">
                            <Button size="sm" kind="secondary">
                                <SearchIcon width="16" height="16" />
                                {$t("domain.header.search")}
                            </Button>
                        </a>
                        <a href="/create/project">
                            <Button size="sm" kind="primary">
                                {$t("domain.header.createProject")}
                            </Button>
                        </a>
                    </div>
                </div>
                <nav>
                    <ul class="flex items-center gap-1 md:gap-4">
                        {#if $session}
                            <li class="flex items-center pr-2">
                                <HeaderCart />
                            </li>
                        {/if}
                        <li class="flex items-center gap-1 pr-2 text-sm md:text-base">
                            <HeaderLogin />
                        </li>
                        <li class="hidden items-center pr-2 md:flex">
                            <HeaderLanguages />
                        </li>
                        <li class="flex items-center md:hidden">
                            <button class="p-1" onclick={mobileMenuToggle}>
                                <div bind:this={menuIcon}>
                                    <MenuIcon />
                                </div>
                                <div bind:this={closeIcon} class="hidden">
                                    <CloseIconMenu />
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
                                <SearchIcon width="16" height="16" />
                                {$t("domain.header.search")}
                            </a>

                            <a
                                href="/create/project"
                                class="font-karla bg-primary text-secondary hover:bg-primary flex-1 rounded-lg px-3 py-2 text-center text-base leading-6 font-bold"
                            >
                                {$t("domain.header.createProject")}
                            </a>
                        </div>

                        <div class="flex flex-col gap-2 pt-1">
                            <HeaderLanguages />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
