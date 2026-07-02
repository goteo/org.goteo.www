<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import DropdownItem from "./DropdownItem.svelte";

    const { Story } = defineMeta({
        component: DropdownItem,
        title: "Library/Dropdown/DropdownItem",
        tags: ["autodocs"],
        args: {
            id: "option-1",
            label: "Option A",
            variant: "basic",
            selectedIds: [],
        },
        argTypes: {
            variant: { control: "select", options: ["basic", "multiselect"] },
        },
    });
</script>

<Story name="Basic" args={{ variant: "basic" }} />

<Story name="Multiselect" args={{ variant: "multiselect" }} />

<Story name="MultiselectChecked" args={{ variant: "multiselect", selectedIds: ["option-1"] }} />
