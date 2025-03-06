<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import LocaleSwitcher from "./LocaleSwitcher.svelte";

    const mockLocales = [
        { code: "en", label: "English" },
        { code: "es", label: "Español" },
        { code: "ca", label: "Català" },
    ];

    const { Story } = defineMeta({
        title: "Components/LocaleSwitcher",
        component: LocaleSwitcher,
        argTypes: {
            loading: { control: "boolean" },
            locales: { control: "object" },
        },
    });
</script>

<!-- Basic usage -->
<Story
    name="Default"
    args={{
        locales: mockLocales,
    }}
/>

<!-- Loading state -->
<Story
    name="Loading State"
    args={{
        loading: true,
        locales: [],
    }}
/>

<!-- Empty state -->
<Story
    name="No Locales"
    args={{
        locales: [],
        loading: false,
    }}
/>

<!-- Single locale -->
<Story
    name="Single Locale"
    args={{
        locales: [{ code: "en", label: "English" }],
    }}
/>

<!-- Many locales -->
<Story
    name="Many Locales"
    args={{
        locales: [
            ...mockLocales,
            { code: "fr", label: "Français" },
            { code: "de", label: "Deutsch" },
            { code: "it", label: "Italiano" },
        ],
    }}
/>

<!-- Disabled state -->
<Story
    name="Disabled"
    args={{
        locales: mockLocales,
        loading: true,
    }}
/>
