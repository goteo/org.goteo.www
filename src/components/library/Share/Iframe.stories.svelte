<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import Iframe from "./Iframe.svelte";

    const { Story } = defineMeta({
        component: Iframe,
        title: "Library/Share/Iframe",
        tags: ["autodocs"],
        args: {
            url: "https://www.goteo.org/widget/project/my-campaign",
        },
    });
</script>

<Story name="Default" />
