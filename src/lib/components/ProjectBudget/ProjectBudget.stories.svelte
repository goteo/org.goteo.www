<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import ProjectBudget from "./ProjectBudget.svelte";

    const { Story } = defineMeta({
        title: "Components/ProjectBudget",
        component: ProjectBudget,
        argTypes: {
            header: { control: "text" },
            content: { control: "text" },
            optimum: { control: "number" },
            minimum: { control: "number" },
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
        header: "Coste de la campaña",
        content:
            "La campaña de crowdfunding está diseñada para que ayude a dar a conocer Climática y las informaciones que publica. Esta partida incluye la coordinación, el diseño y producción de materiales gráficos y el porcentaje de Goteo.",
        minimum: 17000,
        optimum: 20000,
    }}
/>

<!-- Default state with all values -->
<Story
    name="No Target"
    args={{
        header: "Coste de la campaña",
        content:
            "La campaña de crowdfunding está diseñada para que ayude a dar a conocer Climática y las informaciones que publica. Esta partida incluye la coordinación, el diseño y producción de materiales gráficos y el porcentaje de Goteo.",
        minimum: 17000,
    }}
/>
