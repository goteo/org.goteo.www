<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import PasswordInput from "./PasswordInput.svelte";

    const { Story } = defineMeta({
        component: PasswordInput,
        title: "Library/PasswordInput",
        tags: ["autodocs"],
        args: {
            value: "",
            placeholder: "Password",
            name: "password",
            id: "password",
        },
    });
</script>

<Story name="Default" />

<Story name="WithLabel" args={{ label: "Password", id: "password-label" }} />

<Story name="WithValue" args={{ value: "mysecretpassword" }} />

<Story name="CustomPlaceholder" args={{ placeholder: "Enter your password..." }} />
