<script lang="ts">
    import LineIcon from "../svgs/LineIcon.svelte";
    import Button from "./library/Button.svelte";
    import { t } from "../i18n/store";
    import { itemCount } from "../stores/cart";
    import { onMount } from "svelte";

    let isCollapsed = true;
    let hasCart = false;

    itemCount.subscribe((count) => {
        hasCart = count > 0;
    });

    function toggleCollapse() {
        isCollapsed = !isCollapsed;

        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            const detailsElement = document.getElementById("auth-details");
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
            const detailsElement = document.getElementById("auth-details");
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

<div class="flex items-start justify-between px-0 pt-0 pb-0 lg:hidden">
    <div>
        <h2 class="text-secondary flex items-center gap-2 text-base font-semibold">
            {hasCart ? $t("checkout.summary.total.title") : $t("login.page.welcome.title")}
        </h2>
    </div>
    <div>
        <Button kind="invert" onclick={toggleCollapse} class="px-2 py-1 text-sm">
            {isCollapsed ? $t("checkout.summary.show_more") : $t("checkout.summary.hide")}
            <LineIcon rotate={isCollapsed} />
        </Button>
    </div>
</div>

<div class="hidden flex-col gap-6 pt-6 pb-0 lg:flex">
    <div>
        <h2 class="text-secondary text-[56px] leading-tight font-semibold">
            {$t("login.page.welcome.title")}
        </h2>
        <p class="text-content font-light">
            {$t("login.page.welcome.subtitle")}
        </p>
    </div>
    <hr class="bg-secondary" />
</div>
