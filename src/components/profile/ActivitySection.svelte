<script lang="ts">
    import DonationsCard from "./DonationsCard.svelte";
    import MatchfundingCard from "./MatchfundingCard.svelte";
    import ProjectsCard from "./ProjectsCard.svelte";
    import Grid from "../library/layout/Grid.svelte";

    import type { User } from "../../openapi/client/types.gen.ts";

    interface Props {
        lang: string;
        period?: string;
        user: User;
    }

    let { lang, period = new Date().getFullYear().toString(), user }: Props = $props();

    let hasMatchfunding = $state(false);

    function onMatchfundingDataChange(hasData: boolean) {
        hasMatchfunding = hasData;
    }
</script>

<Grid
    class={hasMatchfunding
        ? "grid-cols-1 gap-6 lg:grid-cols-3"
        : "grid-cols-1 gap-6 lg:grid-cols-2"}
>
    <DonationsCard {lang} {period} {user} />
    <ProjectsCard {lang} {period} {user} />
    <MatchfundingCard {lang} {user} onHasData={onMatchfundingDataChange} />
</Grid>
