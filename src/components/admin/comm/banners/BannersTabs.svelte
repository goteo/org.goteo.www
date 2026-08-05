<script lang="ts">
    import { t } from "../../../../i18n/store";
    import Calendar from "../../../icons/Calendar.svelte";
    import Clock from "../../../icons/Clock.svelte";

    interface Props {
        currentTab: string;
        onTabChange: (tabId: string) => void;
    }

    let { currentTab, onTabChange }: Props = $props();

    function tabClass(tabId: string): string {
        return currentTab === tabId
            ? "border-primary text-secondary"
            : "border-variant1 text-content";
    }
</script>

<div class="flex gap-0">
    <button
        class="hover:bg-primary-dark flex w-fit cursor-pointer items-center gap-2 rounded-t-lg border-b-2 px-6 py-2 font-bold text-base {tabClass("fields")}"
        onclick={() => onTabChange("fields")}
    >
        <Calendar class="size-4 text-secondary" />
        {$t("pages.admin.comm.banners.tabs.fields")}
    </button>
    <button
        class="hover:bg-primary-dark flex w-fit cursor-pointer items-center gap-2 rounded-t-lg border-b-2 px-6 py-2 font-bold text-base {tabClass("history")}"
        onclick={() => onTabChange("history")}
    >
        <Clock class="size-4 text-secondary" />
        {$t("pages.admin.comm.banners.tabs.history")}
    </button>
</div>
