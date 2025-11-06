<script lang="ts">
    import { onMount } from "svelte";
    import LineIcon from "../svgs/LineIcon.svelte";
    import Button from "./library/Button.svelte";
    import { t } from "../i18n/store.ts";

    export let detailsId: string;
    export let isInitiallyCollapsed: boolean = false;
    export let showToggleButton: boolean = true;
    export let buttonTextShow: string = $t("checkout.summary.show_details");
    export let buttonTextHide: string = $t("checkout.summary.hide_details");

    let isCollapsed = isInitiallyCollapsed;

    function toggleCollapse() {
        isCollapsed = !isCollapsed;

        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            const detailsElement = document.getElementById(detailsId);
            if (detailsElement) {
                if (isCollapsed) {
                    detailsElement.style.display = "none";
                } else {
                    detailsElement.style.display = "block";
                }
            }
        }
    }

    function handleScreenSize() {
        if (typeof window !== "undefined") {
            const detailsElement = document.getElementById(detailsId);
            if (detailsElement) {
                if (window.innerWidth >= 1024) {
                    detailsElement.style.display = "";
                } else {
                    detailsElement.style.display = isCollapsed ? "none" : "block";
                }
            }
        }
    }

    function initializeMobileState() {
        handleScreenSize();
    }

    onMount(() => {
        initializeMobileState();

        const handleResize = () => handleScreenSize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    });
</script>

<div class="flex items-start justify-between">
    <div>
        <slot name="header" />
    </div>
    {#if showToggleButton}
        <div class="lg:hidden">
            <Button kind="invert" onclick={toggleCollapse} class="px-2 py-1 text-sm">
                {isCollapsed ? buttonTextShow : buttonTextHide}
                <LineIcon rotate={isCollapsed} />
            </Button>
        </div>
    {/if}
</div>

{#if !isCollapsed}
    <slot name="content" />
{/if}
