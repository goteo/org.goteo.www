<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import DropdownMenu from "./DropdownMenu.svelte";

    const items = [
        { id: "tech", label: "Technology" },
        { id: "health", label: "Health" },
        { id: "energy", label: "Energy" },
        { id: "finance", label: "Finance" },
        { id: "real-estate", label: "Real Estate" },
    ];

    const { Story } = defineMeta({
        component: DropdownMenu,
        title: "Library/Dropdown/DropdownMenu",
        tags: ["autodocs"],
        args: {
            items,
            variant: "basic",
            hasSearch: false,
            selectedIds: [],
        },
        argTypes: {
            variant: { control: "select", options: ["basic", "multiselect"] },
            hasSearch: { control: "boolean" },
        },
    });
</script>

<Story name="Basic" args={{ variant: "basic" }} />

<Story name="Multiselect" args={{ variant: "multiselect" }} />

<Story name="MultiselectWithPreselected" args={{ variant: "multiselect", selectedIds: ["tech", "energy"] }} />

<Story name="WithSearch" args={{ variant: "basic", hasSearch: true }} />

<Story name="MultiselectWithSearch" args={{ variant: "multiselect", hasSearch: true }} />
