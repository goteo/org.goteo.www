<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import Facebook from "./Facebook.svelte";

    const { Story } = defineMeta({
        component: Facebook,
        title: "Library/Share/Facebook",
        tags: ["autodocs"],
        args: {
            url: "https://www.goteo.org/project/my-campaign",
            appId: "123456789",
        },
    });
</script>

<Story name="Default" />
