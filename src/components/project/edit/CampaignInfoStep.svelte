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
    import MediaUploader from "./MediaUploader.svelte";
    import RichTextEditor from "./RichTextEditor.svelte";
    import VideoUrlInput from "./VideoUrlInput.svelte";
    import { t } from "../../../i18n/store";
    import { validateCampaignInfo } from "../../../stores/drafts/draftValidation";
    import {
        currentDraft,
        navigateToStep,
        updateCampaignInfo,
        type UploadedFile,
    } from "../../../stores/drafts/projectDraft";
    import CloseIcon from "../../icons/navigation/Close.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import Title from "../../library/typography/Title.svelte";

    interface CampaignInfoStepProps {
        onContinue?: () => void;
    }

    let { onContinue }: CampaignInfoStepProps = $props();

    const campaignInfo = $derived(
        $currentDraft?.wizardForm.campaignInfo ?? {
            images: [],
            video: undefined,
            objectives: "",
            legacy: "",
            targetAudience: "",
            team: "",
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

    function handleImageUpload(image: UploadedFile) {
        if (!campaignInfo) return;
        updateCampaignInfo({
            images: [...campaignInfo.images, image],
        });
    }

    async function handleImageRemove(id: string) {
        const image = campaignInfo.images.find((img) => img.id === id);
        if (image?.key) {
            try {
                await fetch("/api/upload/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: image.key }),
                });
            } catch (err) {
                console.error("Failed to delete image from bucket:", err);
            }
        }

        updateCampaignInfo({
            images: campaignInfo.images.filter((img) => img.id !== id),
        });
    }

    function handleVideoChange(video: string | null) {
        updateCampaignInfo({
            video: video ?? "",
        });
    }

    function handleObjectivesChange(html: string) {
        updateCampaignInfo({
            objectives: html,
        });
    }

    function handleLegacyChange(html: string) {
        updateCampaignInfo({
            legacy: html,
        });
    }

    function handleTargetAudienceChange(html: string) {
        updateCampaignInfo({
            targetAudience: html,
        });
    }

    function handleTeamChange(html: string) {
        updateCampaignInfo({ team: html });
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
                <MediaUploader images={campaignInfo.images} onUpload={handleImageUpload} />

                <VideoUrlInput video={campaignInfo.video} onChange={handleVideoChange} />
            </div>

            {#if campaignInfo.images.length > 0}
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2" role="list">
                    {#each campaignInfo.images as image (image.id)}
                        <div
                            class="group relative aspect-4/3 overflow-hidden rounded-lg"
                            role="listitem"
                        >
                            <img
                                src={image.url}
                                alt={image.name}
                                class="h-full w-full object-cover"
                            />

                            <button
                                type="button"
                                onclick={() => handleImageRemove(image.id)}
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
                    {/each}
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
                value={campaignInfo.objectives}
                onChange={handleObjectivesChange}
                placeholder={$t("common.textPlaceholder")}
                minLength={50}
                maxLength={5000}
                ariaDescribedBy="objectives-help"
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
                value={campaignInfo.legacy}
                onChange={handleLegacyChange}
                placeholder={$t("common.textPlaceholder")}
                minLength={50}
                maxLength={5000}
                ariaDescribedBy="legacy-help"
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
                value={campaignInfo.targetAudience}
                onChange={handleTargetAudienceChange}
                placeholder={$t("common.textPlaceholder")}
                minLength={30}
                maxLength={5000}
                ariaDescribedBy="target-help"
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
                minLength={50}
                maxLength={5000}
                ariaDescribedBy="team-help"
            />
        </section>
    </div>

    <!-- Continue Button -->
    <div class="flex justify-start pt-4">
        <Button kind="secondary" size="md" onclick={handleContinue}>
            {#snippet children()}
                {$t("pages.project.edit.campaignInfo.continue")}
            {/snippet}
        </Button>
    </div>
</div>
