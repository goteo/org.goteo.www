<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import X from "./X.svelte";

    const { Story } = defineMeta({
        component: X,
        title: "Library/Share/X",
        tags: ["autodocs"],
        args: {
            url: "https://www.goteo.org/project/my-campaign",
            text: "Check out this amazing crowdfunding campaign!",
        },
    });
</script>

<Story name="Default" />
