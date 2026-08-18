<!--
    Campaign Information Step Component

    Second step of the project setup wizard.
    Handles:
    - Presentation media (images and video)
    - Campaign objectives (rich text)
    - Project legacy (rich text)
    - Target audience (rich text)
    - Team information (rich text)

    Validation:
    - At least 1 image or 1 video required
    - All rich text fields have minimum character requirements
-->
<script lang="ts">
    import VideoUrlInput from "./VideoUrlInput.svelte";
    import { t } from "../../../i18n/store";
    import { validateCampaignInfo } from "../../../stores/drafts/draftValidation";
    import {
        currentDraft,
        navigateToStep,
        updateCampaignInfo,
    } from "../../../stores/drafts/projectDraft";
    import { emptyRichText } from "../../../utils/richText";
    import CloseIcon from "../../icons/navigation/Close.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import RichTextEditor from "../../library/inputs/RichTextEditor.svelte";
    import Title from "../../library/typography/Title.svelte";

    import type { JSONContent } from "@tiptap/core";
    import MediaUploader from "./MediaUploader.svelte";
    import type { UploadedObject } from "../../../utils/media/objectStorage.types";

    interface CampaignInfoStepProps {
        onContinue?: () => void;
    }

    let { onContinue }: CampaignInfoStepProps = $props();

    const campaignInfo = $derived(
        $currentDraft?.wizardForm.campaignInfo ?? {
            cover: undefined,
            video: undefined,
            brief: emptyRichText(),
            about: emptyRichText(),
            goal: emptyRichText(),
            team: emptyRichText(),
            strategy: emptyRichText(),
        },
    );

    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    function handleContinue() {
        if (!$currentDraft) return;
        const errors = validateCampaignInfo($currentDraft.wizardForm);

        if (Object.keys(errors).length === 0) {
            navigateToStep(3);
            if (onContinue) {
                onContinue();
            }
        } else {
            const firstErrorField = Object.keys(errors)[0];
            const element = document.querySelector(`[data-field="${firstErrorField}"]`);
            element?.scrollIntoView({ behavior: "smooth", block: "center" });

            console.warn("Validation errors:", errors);
        }
    }

    function handleImageUpload(image: UploadedObject) {
        if (!campaignInfo) return;
        updateCampaignInfo({ cover: image });
    }

    async function handleImageRemove(image: UploadedObject) {
        try {
            await fetch("/api/upload/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: image.key }),
            });
        } catch (err) {
            console.error("Failed to delete image from bucket:", err);
        }

        updateCampaignInfo({ cover: undefined });
    }

    function handleVideoChange(video: string | null) {
        updateCampaignInfo({
            video: video ?? "",
        });
    }

    function handleBriefChange(doc: JSONContent) {
        updateCampaignInfo({
            brief: doc,
        });
    }

    function handleAboutChange(doc: JSONContent) {
        updateCampaignInfo({
            about: doc,
        });
    }

    function handleGoalChange(doc: JSONContent) {
        updateCampaignInfo({
            goal: doc,
        });
    }

    function handleTeamChange(doc: JSONContent) {
        updateCampaignInfo({ team: doc });
    }

    function handleCommunicationStrategyChange(doc: JSONContent) {
        updateCampaignInfo({ strategy: doc });
    }
</script>

<div class="w-auto max-w-167 space-y-10">
    <!-- Page Header -->
    <div class="space-y-4">
        <Title level={1} variant="section">
            {$t("pages.project.edit.campaignInfo.title")}
        </Title>
        <p class="text-content text-base">{$t("pages.project.edit.campaignInfo.subtitle")}</p>
    </div>

    <div class="space-y-10">
        <!-- Media Section -->
        <section data-field="media" class="space-y-4">
            <div>
                <Title level={2} variant="subsection" class="mb-1">
                    {$t("pages.project.edit.campaignInfo.media.title")}
                    <span aria-label="required">*</span>
                </Title>
                <p class="text-content text-base">
                    {$t("pages.project.edit.campaignInfo.media.description")}
                </p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MediaUploader onUpload={handleImageUpload} />

                <VideoUrlInput video={campaignInfo.video} onChange={handleVideoChange} />
            </div>

            {#if campaignInfo.cover}
                {@const image = campaignInfo.cover}
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2" role="list">
                    <div
                        class="group relative aspect-4/3 overflow-hidden rounded-lg"
                        role="listitem"
                    >
                        <img src={image.url} alt={image.name} class="h-full w-full object-cover" />

                        <button
                            type="button"
                            onclick={() => handleImageRemove(image)}
                            aria-label={$t("common.remove", { name: image.name })}
                            class="bg-variant1/90 hover:ring-secondary absolute top-2 right-2 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:ring-1 hover:ring-offset-2 hover:outline-none"
                        >
                            <CloseIcon width="16" height="16" class="text-secondary" />
                        </button>

                        <div
                            class="bg-variant1/90 text-secondary absolute right-0 bottom-0 left-0 px-2 py-1 text-xs"
                        >
                            {formatFileSize(image.size)}
                        </div>
                    </div>
                </div>
            {/if}
        </section>

        <!-- Objectives Section -->
        <section data-field="objectives" class="space-y-4">
            <div>
                <label for="objectives" class="mb-1 block text-2xl font-bold text-black">
                    {$t("pages.project.edit.campaignInfo.goals.title")}
                    <span aria-label="required">*</span>
                </label>
                <p class="text-content text-base" id="objectives-help">
                    {$t("pages.project.edit.campaignInfo.goals.description")}
                </p>
            </div>

            <RichTextEditor
                id="objectives"
                value={campaignInfo.brief}
                onChange={handleBriefChange}
                placeholder={$t("common.textPlaceholder")}
                ariaDescribedBy="objectives-help"
                minLength={20}
            />
        </section>

        <!-- Legacy Section -->
        <section data-field="legacy" class="space-y-4">
            <div>
                <label for="legacy" class="mb-1 block text-2xl font-bold text-black">
                    {$t("pages.project.edit.campaignInfo.legacy.title")}
                    <span aria-label="required">*</span>
                </label>
                <p class="text-content text-base" id="legacy-help">
                    {$t("pages.project.edit.campaignInfo.legacy.description")}
                </p>
            </div>

            <RichTextEditor
                id="legacy"
                value={campaignInfo.about}
                onChange={handleAboutChange}
                placeholder={$t("common.textPlaceholder")}
                ariaDescribedBy="legacy-help"
                minLength={20}
            />
        </section>

        <!-- Target Audience Section -->
        <section data-field="targetAudience" class="space-y-4">
            <div>
                <label for="target-audience" class="mb-1 block text-2xl font-bold text-black">
                    {$t("pages.project.edit.campaignInfo.target.title")}
                    <span aria-label="required">*</span>
                </label>
                <p class="text-content text-base" id="target-help">
                    {$t("pages.project.edit.campaignInfo.target.description")}
                </p>
            </div>

            <RichTextEditor
                id="target-audience"
                value={campaignInfo.goal}
                onChange={handleGoalChange}
                placeholder={$t("common.textPlaceholder")}
                ariaDescribedBy="target-help"
                minLength={20}
            />
        </section>

        <!-- Team Section -->
        <section data-field="team" class="space-y-4">
            <div>
                <label for="team" class="mb-1 block text-2xl font-bold text-black">
                    {$t("pages.project.edit.campaignInfo.team.title")}
                    <span aria-label="required">*</span>
                </label>
                <p class="text-content text-base" id="team-help">
                    {$t("pages.project.edit.campaignInfo.team.description")}
                </p>
            </div>

            <RichTextEditor
                id="team"
                value={campaignInfo.team}
                onChange={handleTeamChange}
                placeholder={$t("common.textPlaceholder")}
                ariaDescribedBy="team-help"
                minLength={20}
            />
        </section>

        <!-- Communication Strategy Section -->
        <section data-field="communicationStrategy" class="space-y-4">
            <div>
                <label
                    for="communication-strategy"
                    class="mb-1 block text-2xl font-bold text-black"
                >
                    {$t("pages.project.edit.campaignInfo.communicationStrategy.title")}
                </label>
                <p class="text-content text-base" id="communication-strategy-help">
                    {$t("pages.project.edit.campaignInfo.communicationStrategy.description")}
                </p>
            </div>

            <RichTextEditor
                id="communication-strategy"
                value={campaignInfo.strategy}
                onChange={handleCommunicationStrategyChange}
                placeholder={$t("common.textPlaceholder")}
                ariaDescribedBy="communication-strategy-help"
                minLength={20}
            />
        </section>
    </div>

    <!-- Continue Button -->
    <div class="flex justify-start pt-4">
        <Button kind="secondary" size="md" onclick={handleContinue}>
            {$t("pages.project.edit.campaignInfo.continue")}
        </Button>
    </div>
</div>
