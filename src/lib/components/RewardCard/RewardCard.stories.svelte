<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import RewardCard from "./RewardCard.svelte";

    const { Story } = defineMeta({
        title: "Components/RewardCard",
        component: RewardCard,
        argTypes: {
            image: { control: "text" },
            header: { control: "text" },
            content: { control: "text" },
            donate: { control: "number" },
            donors: { control: "number" },
            units: { control: "number" },
        },
    });
</script>

<script>
    import { waitLocale } from "svelte-i18n";
    import { onMount } from "svelte";

    onMount(async () => {
        await waitLocale();
    });
</script>

<!-- Default state with all values -->
<Story
    name="Default"
    args={{
        image: "https://placehold.co/320x160",
        header: "¡Gracias por coperar!",
        content:
            "La cooperativa de información Climática existe gracias a todas las personas que la apoyan. Ahora tú eres una de ellas. ¡Gracias! Incluiremos tu nombre en la lista de mecenas de nuestra web.",
        donate: 50,
        donors: 999999,
        units: 999000,
    }}
/>

<Story
    name="No units available"
    args={{
        image: "https://placehold.co/320x160",
        header: "¡Gracias por coperar!",
        content:
            "La cooperativa de información Climática existe gracias a todas las personas que la apoyan. Ahora tú eres una de ellas. ¡Gracias! Incluiremos tu nombre en la lista de mecenas de nuestra web.",
        donate: 50,
        donors: 999999,
        units: 0,
    }}
/>

<Story
    name="No units"
    args={{
        image: "https://placehold.co/320x160",
        header: "¡Gracias por coperar!",
        content:
            "La cooperativa de información Climática existe gracias a todas las personas que la apoyan. Ahora tú eres una de ellas. ¡Gracias! Incluiremos tu nombre en la lista de mecenas de nuestra web.",
        donate: 50,
        donors: 999999,
    }}
/>
