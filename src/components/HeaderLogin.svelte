<script lang="ts">
    import { clickOutside } from "flowbite-svelte";

    import { session } from "../auth/store";
    import { t } from "../i18n/store";
    import UserIcon from "../svgs/UserIcon.svelte";

    let userDropdown: HTMLDivElement;

    function userDropdownToggle() {
        if (userDropdown.classList.contains("hidden")) {
            userDropdown.classList.add("flex");
        }

        userDropdown.classList.toggle("hidden");
    }

    function userDropdownClose() {
        userDropdown.classList.add("hidden");
    }
</script>

{#if $session}
    <div class="relative inline-block w-full">
        <button
            onclick={userDropdownToggle}
            use:clickOutside={userDropdownClose}
            class="flex w-full cursor-pointer items-center gap-1"
        >
            <UserIcon />
            <span class="hidden sm:inline">
                {$t("domain.header.loggedIn", {
                    name: $session.person?.firstName || $t("common.unknown"),
                })}
            </span>
        </button>

        <div
            bind:this={userDropdown}
            class="absolute top-full left-0 mt-2 hidden w-full min-w-30 flex-col rounded-lg bg-white p-2 shadow-lg"
        >
            <a
                href="/me"
                class="border-grey text-secondary hover:bg-grey block w-full overflow-hidden border-b px-4 py-2 font-bold overflow-ellipsis"
            >
                {$t("domain.header.goToProfile")}
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
        <span class="hidden sm:inline">{$t("domain.header.login")}</span>
    </a>
{/if}
