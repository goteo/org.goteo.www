<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import CategorySelect from "./CategorySelect.svelte";

    const { Story } = defineMeta({
        component: CategorySelect,
        title: "Library/CategorySelect",
        tags: ["autodocs"],
        args: {
            options: [
                { id: 1, text: "Technology" },
                { id: 2, text: "Design" },
                { id: 3, text: "Marketing" },
                { id: 4, text: "Finance" },
                { id: 5, text: "Health" },
            ],
        },
    });
</script>

<Story name="Default" />

<Story name="WithPreselected" args={{ selectedIds: [1, 3] }} />

<Story name="WithMax" args={{ max: 2 }} />

<Story name="WithError" args={{ error: "Select at least one category" }} />
