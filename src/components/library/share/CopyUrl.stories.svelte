<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import CopyUrl from "./CopyUrl.svelte";

    const { Story } = defineMeta({
        component: CopyUrl,
        title: "Library/Share/CopyUrl",
        tags: ["autodocs"],
        args: {
            url: "https://www.goteo.org/project/my-campaign",
        },
    });
</script>

<Story name="Default" />
