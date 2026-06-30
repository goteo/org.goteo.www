<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import ShareButton from "./ShareButton.svelte";

    const { Story } = defineMeta({
        component: ShareButton,
        title: "Library/Share/ShareButton",
        tags: ["autodocs"],
        args: {
            url: "https://www.goteo.org/project/my-campaign",
            shareText: "Check out this amazing crowdfunding campaign!",
            projectSlug: "my-campaign",
            variant: "project",
        },
        argTypes: {
            variant: { control: "select", options: ["project", "blog"] },
        },
    });
</script>

<Story name="Project" args={{ variant: "project" }} />

<Story name="Blog" args={{ variant: "blog", projectSlug: "" }} />
