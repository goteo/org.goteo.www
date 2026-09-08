<script lang="ts">
    import { t } from "../../../../i18n/store";
    import Button from "../../../library/buttons/Button.svelte";
    import DateInput from "../../../library/inputs/DateInput.svelte";
    import ImageUploadModal from "../../../library/inputs/ImageUploadModal.svelte";
    import TextArea from "../../../library/inputs/TextArea.svelte";
    import TextInput from "../../../library/inputs/TextInput.svelte";
    import Title from "../../../library/typography/Title.svelte";

    import type { UploadedObject } from "../../../../utils/media/objectStorage.types";

    let title = $state("");
    let content = $state("");
    let primaryCtaText = $state("");
    let primaryCtaLink = $state("");
    let secondaryCtaText = $state("");
    let secondaryCtaLink = $state("");
    let startsAt = $state(new Date());

    let media = $state<UploadedObject | undefined>(undefined);
    let isUploadOpen = $state(false);

    const isVideo = $derived(media?.type.startsWith("video/") ?? false);

    function handleUpload(files: UploadedObject[]) {
        media = files[0];
    }
</script>

<div class="flex items-start justify-between gap-6">
    <div class="flex max-w-167 flex-col gap-4">
        <Title level={2} variant="headline">
            {$t("pages.admin.home.hero.title")}
        </Title>
        <p class="text-content text-base font-normal">
            {$t("pages.admin.home.hero.description")}
        </p>
    </div>

    <Button class="shrink-0 px-6">
        {$t("common.save")}
    </Button>
</div>

<div class="flex flex-col gap-6">
    <Title level={3} variant="subsection">
        {$t("pages.admin.home.hero.fields.textsTitle")}
    </Title>

    <div class="max-w-167 space-y-4">
        <TextInput
            bind:value={title}
            name="title"
            placeholder={$t("pages.admin.home.hero.fields.titlePlaceholder")}
        />

        <TextArea
            bind:value={content}
            name="content"
            rows={5}
            placeholder={$t("pages.admin.home.hero.fields.contentPlaceholder")}
        />

        <div class="flex gap-6">
            <div class="flex-1">
                <TextInput
                    bind:value={primaryCtaText}
                    name="primaryCtaText"
                    placeholder={$t("pages.admin.home.hero.fields.primaryCtaPlaceholder")}
                />
            </div>

            <div class="flex-1">
                <TextInput
                    bind:value={primaryCtaLink}
                    name="primaryCtaLink"
                    placeholder={$t("pages.admin.home.hero.fields.urlPlaceholder")}
                />
            </div>
        </div>

        <div class="flex gap-6">
            <div class="flex-1">
                <TextInput
                    bind:value={secondaryCtaText}
                    name="secondaryCtaText"
                    placeholder={$t("pages.admin.home.hero.fields.secondaryCtaPlaceholder")}
                />
            </div>

            <div class="flex-1">
                <TextInput
                    bind:value={secondaryCtaLink}
                    name="secondaryCtaLink"
                    placeholder={$t("pages.admin.home.hero.fields.urlPlaceholder")}
                />
            </div>
        </div>
    </div>
</div>

<div class="flex flex-col gap-6">
    <Title level={3} variant="subsection">
        {$t("pages.admin.home.hero.fields.scheduleTitle")}
    </Title>

    <DateInput
        bind:value={startsAt}
        class="w-full max-w-80.5"
        name="startsAt"
        placeholder={$t("pages.admin.home.hero.fields.startDatePlaceholder")}
    />
</div>

<div class="flex flex-col gap-6">
    <Title level={3} variant="subsection">
        {$t("pages.admin.home.hero.fields.mediaTitle")}
    </Title>

    <div
        class="border-grey flex w-full max-w-138 flex-col gap-6 rounded-2xl border bg-white p-6 shadow-sm"
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

        <Button kind="secondary" size="sm" class="w-fit" onclick={() => (isUploadOpen = true)}>
            {$t("pages.admin.home.hero.fields.mediaAdd")}
        </Button>
    </div>
</div>

<ImageUploadModal
    bind:open={isUploadOpen}
    accept={["image/png", "image/jpeg", "video/mp4", "video/quicktime"]}
    multiple={false}
    onConfirm={handleUpload}
/>
