<script lang="ts">
    import CreateCard from "./CreateCard.svelte";
    import { t } from "../../../i18n/store";
    import { withoutCache } from "../../../openapi/cacheInterceptor";
    import { apiProjectRewardsGetCollection } from "../../../openapi/client";
    import Button from "../../library/buttons/Button.svelte";
    import Grid from "../../library/layout/Grid.svelte";
    import Title from "../../library/typography/Title.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";

    import type { ProjectDraftStore } from "../../../stores/drafts/draftsStore";


    let { draft }: { draft: ProjectDraftStore } = $props();

    let rewards = withoutCache(() =>
        apiProjectRewardsGetCollection({
            baseUrl: "/api/relay",
            headers: { "Accept-Language": $draft.lang },
            query: { project: String($draft.actual.id) },
        }).then(({ data, error }) => {
            if (error || !data) {
                console.error(error);
                return [];
            }

            return data;
        }),
    );
</script>

<div class="w-full space-y-10">
    <div class="flex w-full flex-col gap-4">
        <Title level={2} variant="headline">
            {$t("pages.project.edit.rewards.title")}
        </Title>
        <p class="text-content text-base font-normal">
            {$t("pages.project.edit.rewards.subtitle")}
        </p>
    </div>
    {#await rewards}
        <LoadingSpinner size="lg" class="col-span-3 mx-auto my-10" />
    {:then rewards}
        <Grid>
            {#each rewards as reward, index}
                {reward.id}
            {/each}
            <CreateCard
                variant="reward"
                title={$t("pages.project.edit.rewards.add.title")}
                description={$t("pages.project.edit.rewards.add.description")}
                project={$draft.actual}
            />
        </Grid>
    {/await}

    <!-- Continue Button -->
    <div class="flex justify-start">
        <Button kind="secondary" size="md">
            {$t("pages.project.edit.rewards.continue")}
        </Button>
    </div>
</div>
