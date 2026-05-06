<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import ActionableButton from "./ActionableButton.svelte";

    const { Story } = defineMeta({
        component: ActionableButton,
        title: "Library/ActionableButton",
        tags: ["autodocs"],
        args: {
            action: () => new Promise((resolve) => setTimeout(resolve, 1500)),
            size: "md",
            kind: "primary",
        },
        argTypes: {
            size: { control: "select", options: ["md", "sm"] },
            kind: { control: "select", options: ["primary", "secondary", "ghost", "invert"] },
            state: { control: "select", options: ["actionable", "loading", "actioned"] },
            autoreset: { control: "number" },
        },
    });
</script>

<Story name="Default">Submit</Story>

<Story name="WithAutoreset" args={{ autoreset: 2000 }}>Submit</Story>

<Story name="Secondary" args={{ kind: "secondary" }}>Submit</Story>

<Story name="Ghost" args={{ kind: "ghost" }}>Submit</Story>

<Story name="Small" args={{ size: "sm" }}>Submit</Story>

<Story name="Loading" args={{ state: "loading" }}>Submit</Story>

<Story name="Actioned" args={{ state: "actioned" }}>Submit</Story>
