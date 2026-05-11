<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import TabNavigation from "./TabNavigation.svelte";

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "updates", label: "Updates" },
        { id: "documents", label: "Documents" },
        { id: "comments", label: "Comments" },
    ];

    const { Story } = defineMeta({
        component: TabNavigation,
        title: "Library/TabNavigation",
        tags: ["autodocs"],
        args: {
            tabs,
            currentTab: "overview",
            onTabClick: () => {},
        },
    });
</script>

<Story name="Default" />

<Story name="SecondTabActive" args={{ currentTab: "updates" }} />

<Story
    name="FewTabs"
    args={{
        tabs: [
            { id: "info", label: "Info" },
            { id: "settings", label: "Settings" },
        ],
        currentTab: "info",
    }}
/>
