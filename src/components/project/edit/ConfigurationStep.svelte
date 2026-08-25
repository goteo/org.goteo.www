<!--
    Configuration Step Component

    First step of the project setup wizard.
    Handles:
    - Campaign content languages
    - Categories (up to 2)
    - Campaign release date
    - Funding rounds (1 or 2)

    Validation:
    - Funding rounds defaults to 1
-->
<script lang="ts">
    import LanguageSelector from "./LanguageSelector.svelte";
    import RoundSelector from "./RoundSelector.svelte";
    import CategorySelect from "../../../components/library/inputs/CategorySelect.svelte";
    import DateInput from "../../../components/library/inputs/DateInput.svelte";
    import { locale, t } from "../../../i18n/store";
    import { withoutCache } from "../../../openapi/cacheInterceptor";
    import {
        apiCategoriesGetCollection,
        apiProjectsIdDelete,
        apiProjectsIdOrSlugGet,
        apiProjectsIdPatch,
    } from "../../../openapi/client";
    import { client } from "../../../openapi/client/client.gen";
    import { apiCategoriesIdOrSlugGetUrl } from "../../../openapi/client/operation-paths.gen";
    import { zProjectProjectUpdationDto } from "../../../openapi/client/zod.gen";
    import { extractId } from "../../../utils/extractId";
    import { toCollectionItems } from "../../../utils/hydra";
    import { validate } from "../../../utils/validation";
    import Button from "../../library/buttons/Button.svelte";
    import Title from "../../library/typography/Title.svelte";

    import type { Category, Project } from "../../../openapi/client";
    import type { ProjectDraftStore } from "../../../stores/drafts/draftsStore";

    interface ConfigurationStepProps {
        draft: ProjectDraftStore;
        onContinue?: () => void;
    }

    let { draft, onContinue }: ConfigurationStepProps = $props();

    /**
     * Handle Continue button
     * Simple navigation to next step (2) - validation happens on save/submit
     */
    function handleContinue() {
        // navigateToStep(2);
        if (onContinue) {
            onContinue();
        }
    }

    // Fields the API stores per locale, and so the ones a new localization
    // starts from. `locales` itself is read-only: a language exists as long as
    // there is content submitted under it.
    // TODO(api): derive this from the spec once localizable fields are marked
    // in the schema — a field added API-side is silently missed here.
    const LOCALIZED_FIELDS = [
        "title",
        "subtitle",
        "descBrief",
        "descAbout",
        "descGoal",
        "descTeam",
    ] as const;

    let languages = $derived($draft.latest.locales ?? [$draft.lang]);
    let languagesError = $state<string | undefined>();

    const projectId = $derived(String($draft.actual.id));

    /**
     * Pull the Project back from the API so `locales` reflects the change
     *
     * TODO(api): drop this round-trip once mutations return the Project with
     * `locales` already up to date.
     */
    async function refreshProject() {
        const { data } = await withoutCache(() =>
            apiProjectsIdOrSlugGet({
                baseUrl: "/api/relay",
                path: { idOrSlug: projectId },
                headers: { "Accept-Language": $draft.lang },
            }),
        );

        if (data) {
            draft.update({ actual: data });
        }
    }

    /**
     * Content to seed a localization with, skipping values the API would reject
     * (half-written descriptions) so registering a language cannot fail on them
     */
    function localizedContent(source: Project) {
        return Object.fromEntries(
            LOCALIZED_FIELDS.map((field) => [field, source[field]] as const).filter(
                ([field, value]) =>
                    typeof value === "string" &&
                    validate(value, zProjectProjectUpdationDto.shape[field]).length === 0,
            ),
        );
    }

    /**
     * Read the Project as written in one specific locale
     */
    async function readProjectIn(language: string) {
        const { data } = await withoutCache(() =>
            apiProjectsIdOrSlugGet({
                baseUrl: "/api/relay",
                path: { idOrSlug: projectId },
                headers: { "Accept-Language": language },
            }),
        );

        return data;
    }

    /**
     * Register a language by submitting content under it.
     *
     * Seeds it with what the current locale already has, so the user starts
     * from the source text instead of an empty form.
     *
     * TODO(api): replace with `POST /v4/projects/{id}/locales { locale }` once
     * it exists. Copying the source text stops being forced and becomes a
     * product decision.
     */
    async function handleLanguageAdd(language: string) {
        languagesError = undefined;

        const { error } = await apiProjectsIdPatch({
            baseUrl: "/api/relay",
            path: { id: projectId },
            headers: { "Content-Language": language },
            body: localizedContent($draft.latest),
        });

        if (error) {
            languagesError = $t("pages.project.edit.configuration.languages.error");
            return;
        }

        await refreshProject();
    }

    /**
     * Move a language's content over to another one.
     *
     * The API has no "change language" operation, so this is a registration of
     * the new locale carrying the old one's content, then a removal of the old.
     *
     * TODO(api): these three calls are not atomic — a failing DELETE leaves the
     * same content under two locales. Collapses into
     * `PATCH /v4/projects/{id}/locales/{from} { locale }` once available.
     */
    async function handleLanguageReplace(from: string, to: string) {
        languagesError = undefined;

        if (!from || !to || from === to) return;

        // The content to carry over is the one written in `from`, which is not
        // necessarily the locale the editor is currently showing
        const source = await readProjectIn(from);
        if (!source) {
            languagesError = $t("pages.project.edit.configuration.languages.error");
            return;
        }

        const { error: patchError } = await apiProjectsIdPatch({
            baseUrl: "/api/relay",
            path: { id: projectId },
            headers: { "Content-Language": to },
            body: localizedContent(source),
        });

        if (patchError) {
            languagesError = $t("pages.project.edit.configuration.languages.error");
            return;
        }

        const { error: deleteError } = await apiProjectsIdDelete({
            baseUrl: "/api/relay",
            path: { id: projectId },
            headers: { "Content-Language": from },
        });

        if (deleteError) {
            languagesError = $t("pages.project.edit.configuration.languages.error");
            return;
        }

        // The editor was working on a locale that no longer exists
        if ($draft.lang === from) {
            draft.update({ lang: to });
        }

        await refreshProject();
    }

    /**
     * Remove a language and every piece of content written in it
     */
    async function handleLanguageRemove(language: string) {
        languagesError = undefined;

        // Without a Content-Language the API deletes the whole Project.
        // TODO(api): move to `DELETE /v4/projects/{id}/locales/{locale}` so a
        // missing locale is a 404 instead of wiping the Project, and drop this
        // guard.
        if (!language || language === $draft.lang) return;

        const { error } = await apiProjectsIdDelete({
            baseUrl: "/api/relay",
            path: { id: projectId },
            headers: { "Content-Language": language },
        });

        if (error) {
            languagesError = $t("pages.project.edit.configuration.languages.error");
            return;
        }

        await refreshProject();
    }

    let allCategories = $derived.by(async () => {
        const { data } = await withoutCache(() =>
            apiCategoriesGetCollection({
                baseUrl: "/api/relay",
                headers: { "Accept-Language": $locale },
            }),
        );

        return toCollectionItems<Category>(data);
    });

    let categories = $derived($draft.latest.categories.map((c) => extractId(c)!));

    function handleCategoryChange(selected: Category[]) {
        draft.patch({
            categories: selected.map((s) => {
                return client.buildUrl({
                    url: apiCategoriesIdOrSlugGetUrl,
                    path: { idOrSlug: s.id },
                });
            }),
        });
    }

    let release = $derived(new Date($draft.latest.calendar?.release || new Date()));

    const releaseDisabled = $derived.by(() => {
        return !["in_draft", "in_campaign_review.to_change"].includes($draft.latest.status!);
    });

    const releaseMinimum = $derived.by(() => {
        if (releaseDisabled) {
            return;
        }

        const dateMin = new Date();
        dateMin.setDate(dateMin.getDate() + 14);

        return dateMin;
    });

    /**
     * Handle release date change
     */
    function handleReleaseChange(date: Date) {
        draft.patch({ calendar: { release: date.toISOString() } });
    }

    let deadline = $derived($draft.latest.deadline || "minimum");

    /**
     * Handle funding rounds change
     */
    function handleRoundsChange(deadline: Project["deadline"]) {
        draft.patch({ deadline });
    }
</script>

<div class="space-y-8">
    <!-- Page Header -->
    <div class="space-y-4">
        <Title level={1} variant="headline">
            {$t("pages.project.edit.configuration.title")}
        </Title>
        <p class="text-content text-base font-normal">
            {$t("pages.project.edit.configuration.subtitle")}
        </p>
    </div>

    <!-- Languages Section -->
    <div class="space-y-4">
        <div class="space-y-4">
            <Title level={2} variant="subsection">
                {$t("pages.project.edit.configuration.languages.title")}
            </Title>
            <p class="text-content text-base font-normal">
                {$t("pages.project.edit.configuration.languages.description")}
            </p>
        </div>
        <div class="max-w-167">
            <LanguageSelector
                {languages}
                current={$draft.lang}
                onAdd={handleLanguageAdd}
                onRemove={handleLanguageRemove}
                onReplace={handleLanguageReplace}
            />
            {#if languagesError}
                <p class="text-semantic-error mt-2">{languagesError}</p>
            {/if}
        </div>
    </div>

    <!-- Categories Section -->
    {#await allCategories then options}
        {#if options.length > 0}
            <div class="space-y-4">
                <div class="space-y-4">
                    <Title level={2} variant="subsection">
                        {$t("pages.project.create.categories.title")}
                    </Title>
                    <p class="text-black transition-all duration-300 ease-in-out">
                        {$t("pages.project.create.categories.subtitle")}
                    </p>
                </div>
                <CategorySelect
                    max={2}
                    {options}
                    bind:selectedIds={categories}
                    onchange={handleCategoryChange}
                />
            </div>
        {/if}
    {/await}

    <!-- Release Date Section -->
    <div class="space-y-4">
        <div class="space-y-4">
            <Title level={2} variant="subsection">
                {$t("pages.project.edit.configuration.release.title")}
            </Title>
            <p class="text-content text-base font-normal">
                {#if releaseDisabled}
                    {$t("pages.project.edit.configuration.release.passed")}
                {:else}
                    {$t("pages.project.edit.configuration.release.subtitle")}
                {/if}
            </p>
        </div>
        <DateInput
            name="release"
            class="max-w-167"
            bind:value={release}
            min={releaseMinimum}
            disabled={releaseDisabled}
            onInput={handleReleaseChange}
        />
    </div>

    <!-- Funding Rounds Section -->
    <div class="space-y-6">
        <div class="space-y-4">
            <Title level={2} variant="subsection">
                {$t("pages.project.edit.configuration.rounds.title")}
            </Title>
            <p class="text-content text-base font-normal">
                {$t("pages.project.edit.configuration.rounds.description")}
            </p>
        </div>
        <RoundSelector bind:deadline onChange={handleRoundsChange} />
    </div>

    <!-- Continue Button -->
    <div class="mb- flex justify-start">
        <Button kind="secondary" size="md" onclick={handleContinue}>
            {$t("pages.project.edit.configuration.continue")}
        </Button>
    </div>
</div>
