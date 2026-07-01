<script lang="ts">
    import { onMount } from "svelte";

    import { t } from "../../../i18n/store.ts";
    import LineIcon from "../../icons/LineIcon.svelte";
    import Button from "../buttons/Button.svelte";

    import type { Snippet } from "svelte";

    interface Props {
        detailsId: string;
        isInitiallyCollapsed?: boolean;
        showToggleButton?: boolean;
        buttonTextShow?: string;
        buttonTextHide?: string;
        header: Snippet;
        content?: Snippet;
    }

    let {
        detailsId,
        isInitiallyCollapsed = false,
        showToggleButton = true,
        buttonTextShow = $t("pages.checkout.summary.showDetails"),
        buttonTextHide = $t("pages.checkout.summary.hideDetails"),
        header,
        content,
    }: Props = $props();

    let isCollapsed = $state(isInitiallyCollapsed);

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

<div class="flex w-full items-start justify-between">
    <div class="flex-1">
        {@render header()}
    </div>
    {#if showToggleButton}
        <div class="self-start lg:hidden">
            <Button kind="invert" onclick={toggleCollapse} class="px-2 py-1 text-sm">
                {isCollapsed ? buttonTextShow : buttonTextHide}
                <LineIcon rotate={isCollapsed} />
            </Button>
        </div>
    {/if}
</div>

{#if !isCollapsed && content}
    {@render content()}
{/if}
