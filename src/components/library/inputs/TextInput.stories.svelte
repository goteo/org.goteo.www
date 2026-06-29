<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import TextInput from "./TextInput.svelte";

    const { Story } = defineMeta({
        component: TextInput,
        title: "Library/TextInput",
        tags: ["autodocs"],
        args: {
            placeholder: "Enter text...",
        },
        argTypes: {
            type: {
                control: "select",
                options: ["text", "email", "password", "tel", "url", "number"],
            },
            disabled: { control: "boolean" },
            required: { control: "boolean" },
        },
    });
</script>

<Story name="Default" />

<Story name="WithLabel" args={{ labelText: "Full name", placeholder: "John Doe" }} />

<Story
    name="WithHelperText"
    args={{ labelText: "Email", helperText: "We'll never share your email", type: "email" }}
/>

<Story
    name="WithError"
    args={{ labelText: "Email", error: "Invalid email address", type: "email" }}
/>

<Story name="Disabled" args={{ labelText: "Full name", value: "John Doe", disabled: true }} />

<Story name="Email" args={{ labelText: "Email", type: "email", placeholder: "you@example.com" }} />

<Story name="Number" args={{ labelText: "Amount", type: "number", placeholder: "0" }} />
