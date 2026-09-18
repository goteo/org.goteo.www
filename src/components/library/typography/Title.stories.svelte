<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import Title from "./Title.svelte";

    const { Story } = defineMeta({
        component: Title,
        title: "Library/Title",
        tags: ["autodocs"],
    });
</script>

<Story name="Display">
    <Title level={1} variant="display">Display 56px</Title>
</Story>

<Story name="DisplayBold">
    <Title level={1} variant="display" weight="bold">Display 56px Bold</Title>
</Story>

<Story name="Headline">
    <Title level={2} variant="headline">Headline 40px</Title>
</Story>

<Story name="HeadlineBold">
    <Title level={2} variant="headline" weight="bold">Headline 40px Bold</Title>
</Story>

<Story name="Section">
    <Title level={2} variant="section">Section 32px</Title>
</Story>

<Story name="Subsection">
    <Title level={3} variant="subsection">Subsection 24px</Title>
</Story>

<Story name="Field">
    <Title level={3} variant="field">Field 16px</Title>
</Story>

<Story name="SecondaryColor">
    <Title level={2} variant="headline" color="secondary">Headline purple</Title>
</Story>

<Story name="WhiteColorOnDark">
    <div class="bg-secondary rounded p-6">
        <Title level={3} variant="section" color="white">White on dark</Title>
    </div>
</Story>

<Story name="PurpleSoft">
    <Title level={4} variant="field" color="purple-soft">Footer column header</Title>
</Story>

<Story name="Truncate1">
    <div class="w-64">
        <Title level={3} variant="subsection" color="secondary" truncate={1}>
            A very long card title that will be cut off after one line
        </Title>
    </div>
</Story>

<Story name="Truncate2">
    <div class="w-64">
        <Title level={3} variant="subsection" color="secondary" truncate={2}>
            A very long card title that will be cut off after two lines so we can see how the
            line-clamp utility works inside a constrained width container
        </Title>
    </div>
</Story>

<Story name="Uppercase">
    <Title level={3} variant="subsection" uppercase>Uppercased section</Title>
</Story>

<Story name="Centered">
    <Title level={2} variant="section" color="secondary" align="center">Centered title</Title>
</Story>

<Story name="CustomClass">
    <Title level={1} variant="section" class="underline decoration-wavy">Custom override</Title>
</Story>
