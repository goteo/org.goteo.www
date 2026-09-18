<script lang="ts">
    import { actions, isInputError } from "astro:actions";

    import { locale, t } from "../../../../i18n/store";
    import { formatDate, startOfDay } from "../../../../utils/dates";
    import ActionableButton from "../../../library/buttons/ActionableButton.svelte";
    import Button from "../../../library/buttons/Button.svelte";
    import Toast from "../../../library/feedback/Toast.svelte";
    import DateInput from "../../../library/inputs/DateInput.svelte";
    import ImageUploadModal from "../../../library/inputs/ImageUploadModal.svelte";
    import RichTextEditor from "../../../library/inputs/RichTextEditor.svelte";
    import TextInput from "../../../library/inputs/TextInput.svelte";
    import Title from "../../../library/typography/Title.svelte";

    import type { HomeHeroRecord } from "../../../../repositories/homeHero";
    import type { UploadedObject } from "../../../../utils/media/objectStorage.types";

    interface Props {
        hero?: HomeHeroRecord | null;
    }

    let { hero = null }: Props = $props();

    // Only what the preview and the hidden inputs need, so the stored hero can
    // be shown without faking the rest of an upload result.
    type HeroMedia = Pick<UploadedObject, "url" | "type" | "name">;

    type FieldName =
        | "title"
        | "content"
        | "primaryCtaText"
        | "primaryCtaLink"
        | "secondaryCtaText"
        | "secondaryCtaLink"
        | "startsAt";

    type FieldErrors = Partial<Record<FieldName, string>>;

    let formElement: HTMLFormElement;

    const contentId = $props.id();
    let content = $state(hero?.content ?? "");

    let fieldErrors: FieldErrors = $state({});
    let errorMessage = $state("");
    let showError = $state(false);

    // Hero content is scheduled, so the start date may not land before today.
    const today = startOfDay(new Date());

    let startsAt = $state(new Date());

    let media = $state<HeroMedia | undefined>(storedMedia(hero));
    let isUploadOpen = $state(false);

    const isVideo = $derived(media?.type.startsWith("video/") ?? false);

    function storedMedia(record: HomeHeroRecord | null): HeroMedia | undefined {
        if (!record?.mediaUrl || !record.mediaType) {
            return undefined;
        }

        return {
            url: record.mediaUrl,
            type: record.mediaType,
            name: record.mediaUrl.split("/").pop() ?? record.mediaUrl,
        };
    }

    function handleUpload(files: UploadedObject[]) {
        media = files[0];
    }

    function validate(data: FormData): boolean {
        const errors: FieldErrors = {};

        if (!String(data.get("title") ?? "").trim()) {
            errors.title = "system.constraint.text.notEmpty";
        }

        if (!String(data.get("content") ?? "").trim()) {
            errors.content = "system.constraint.text.notEmpty";
        }

        fieldErrors = errors;

        return Object.keys(errors).length === 0;
    }

    async function submit() {
        fieldErrors = {};

        const data = new FormData(formElement);

        if (!validate(data)) {
            return;
        }

        const { error } = await actions.createHomeHero(data);

        if (error) {
            if (!isInputError(error)) {
                errorMessage = error.message;
                showError = true;

                return;
            }

            fieldErrors = Object.fromEntries(
                Object.entries(error.fields).map(([field, issues]) => [field, issues?.[0]]),
            ) as FieldErrors;
        }
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        await submit();
    }
</script>

<form bind:this={formElement} onsubmit={handleSubmit} class="flex max-w-167 flex-col gap-10">
    <div class="flex flex-col gap-6">
        <Title level={3} variant="subsection">
            {$t("pages.admin.home.hero.fields.textsTitle")}
        </Title>

        <div class="space-y-4">
            <TextInput
                name="title"
                value={hero?.title ?? ""}
                required={true}
                placeholder={$t("pages.admin.home.hero.fields.titlePlaceholder")}
                error={fieldErrors.title && $t(fieldErrors.title)}
            />

            <RichTextEditor
                id={contentId}
                value={content}
                onChange={(value) => (content = value)}
                format="markdown"
                showFontSize={false}
                showAlignment={false}
                placeholder={$t("pages.admin.home.hero.fields.contentPlaceholder")}
                error={fieldErrors.content && $t(fieldErrors.content)}
            />
            <input type="hidden" name="content" value={content.trim()} />

            <div class="flex flex-col gap-6 sm:flex-row">
                <div class="flex-1">
                    <TextInput
                        name="primaryCtaText"
                        value={hero?.primaryCtaText ?? ""}
                        placeholder={$t("pages.admin.home.hero.fields.primaryCtaPlaceholder")}
                        error={fieldErrors.primaryCtaText && $t(fieldErrors.primaryCtaText)}
                    />
                </div>

                <div class="flex-1">
                    <TextInput
                        name="primaryCtaLink"
                        value={hero?.primaryCtaLink ?? ""}
                        placeholder={$t("pages.admin.home.hero.fields.urlPlaceholder")}
                        error={fieldErrors.primaryCtaLink && $t(fieldErrors.primaryCtaLink)}
                    />
                </div>
            </div>

            <div class="flex flex-col gap-6 sm:flex-row">
                <div class="flex-1">
                    <TextInput
                        name="secondaryCtaText"
                        value={hero?.secondaryCtaText ?? ""}
                        placeholder={$t("pages.admin.home.hero.fields.secondaryCtaPlaceholder")}
                        error={fieldErrors.secondaryCtaText && $t(fieldErrors.secondaryCtaText)}
                    />
                </div>

                <div class="flex-1">
                    <TextInput
                        name="secondaryCtaLink"
                        value={hero?.secondaryCtaLink ?? ""}
                        placeholder={$t("pages.admin.home.hero.fields.urlPlaceholder")}
                        error={fieldErrors.secondaryCtaLink && $t(fieldErrors.secondaryCtaLink)}
                    />
                </div>
            </div>
        </div>
    </div>

    <div class="flex flex-col gap-6">
        <Title level={3} variant="subsection">
            {$t("pages.admin.home.hero.fields.mediaTitle")}
        </Title>

        <div
            class="border-grey flex w-full flex-col gap-6 rounded-2xl border bg-white p-6 shadow-sm sm:max-w-138"
        >
            <div class="flex flex-col">
                <p class="text-secondary text-base font-bold">
                    {$t("pages.admin.home.hero.fields.mediaLabel")}
                </p>

                {#if media}
                    <p class="text-content truncate text-base font-normal">{media.name}</p>
                {:else}
                    <p class="text-content text-base font-normal">
                        {$t("pages.admin.home.hero.fields.mediaHint")}
                    </p>
                {/if}
            </div>

            {#if media}
                {#if isVideo}
                    <!-- svelte-ignore a11y_media_has_caption -->
                    <video src={media.url} controls class="w-full rounded-lg"></video>
                {:else}
                    <img src={media.url} alt={media.name} class="w-full rounded-lg" />
                {/if}
            {/if}

            <div class="flex flex-wrap gap-4">
                <Button
                    kind="secondary"
                    size="sm"
                    class="w-fit"
                    onclick={() => (isUploadOpen = true)}
                >
                    {$t("pages.admin.home.hero.fields.mediaAdd")}
                </Button>

                {#if media}
                    <Button
                        kind="ghost"
                        size="sm"
                        class="w-fit"
                        onclick={() => (media = undefined)}
                    >
                        {$t("common.remove")}
                    </Button>
                {/if}
            </div>
        </div>

        <input type="hidden" name="mediaUrl" value={media?.url ?? ""} />
        <input type="hidden" name="mediaType" value={media?.type ?? ""} />
    </div>

    <div class="flex flex-col gap-6">
        <Title level={3} variant="subsection">
            {$t("pages.admin.home.hero.fields.scheduleTitle")}
        </Title>

        <DateInput
            bind:value={startsAt}
            class="sm:max-w-80"
            name="startsAt"
            min={today}
            placeholder={$t("pages.admin.home.hero.fields.startDatePlaceholder")}
            error={fieldErrors.startsAt &&
                $t(fieldErrors.startsAt, { date: formatDate(today, $locale) })}
        />
    </div>

    <ActionableButton action={submit} autoreset={2000} class="w-fit px-6">
        {$t("common.save")}
    </ActionableButton>
</form>

<Toast variant="error" bind:showToast={showError}>{errorMessage}</Toast>

<ImageUploadModal
    bind:open={isUploadOpen}
    accept={["image/png", "image/jpeg", "video/mp4", "video/quicktime"]}
    multiple={false}
    onConfirm={handleUpload}
/>
