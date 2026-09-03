<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import HomeBanner from "./HomeBanner.svelte";

    const { Story } = defineMeta({
        component: HomeBanner,
        title: "Library/HomeBanner",
        tags: ["autodocs"],
        args: {
            title: "Discover the best campaigns",
            description:
                "Join thousands of investors and find the perfect opportunity for your portfolio.",
            ctaText: "Get started",
            ctaLink: "/campaigns",
            closeAriaLabel: "Close banner",
        },
    });
</script>

<Story name="Default" />

<Story
    name="LongContent"
    args={{
        title: "Invest in the future: find the campaigns that match your goals and values",
        description:
            "Our platform connects you with vetted investment opportunities across multiple sectors. Start with as little as €100 and build a diversified portfolio tailored to your financial goals.",
        ctaText: "Explore campaigns",
        ctaLink: "/campaigns",
        closeAriaLabel: "Close banner",
    }}
/>
