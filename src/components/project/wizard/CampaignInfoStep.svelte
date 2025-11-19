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
    import { t } from "../../../i18n/store";
    import Button from "../../library/Button.svelte";
    import RichTextEditor from "./RichTextEditor.svelte";
    import MediaUploader from "./MediaUploader.svelte";
    import VideoUrlInput from "./VideoUrlInput.svelte";
    import {
        wizardState,
        updateCampaignInfo,
        navigateToStep,
        validateCampaignInfo,
        type MediaImage,
        type VideoEmbed,
    } from "../../../stores/wizard-state";

    interface CampaignInfoStepProps {
        onContinue?: () => void;
    }

    let { onContinue }: CampaignInfoStepProps = $props();

    // Reactive values from store
    const campaignInfo = $derived($wizardState.campaignInfo);

    /**
     * Handle Continue button
     * Simple navigation to next step - validation happens on save/submit
     */
    function handleContinue() {
        const errors = validateCampaignInfo();

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

    /**
     * Handle image upload
     */
    function handleImageUpload(image: MediaImage) {
        updateCampaignInfo({
            images: [...campaignInfo.images, image],
        });
    }

    /**
     * Handle image removal
     */
    function handleImageRemove(id: string) {
        updateCampaignInfo({
            images: campaignInfo.images.filter((img) => img.id !== id),
        });
    }

    /**
     * Handle video change
     */
    function handleVideoChange(video: VideoEmbed | null) {
        updateCampaignInfo({ video });
    }

    /**
     * Handle objectives change
     */
    function handleObjectivesChange(html: string) {
        updateCampaignInfo({ objectives: html });
    }

    /**
     * Handle legacy change
     */
    function handleLegacyChange(html: string) {
        updateCampaignInfo({ legacy: html });
    }

    /**
     * Handle target audience change
     */
    function handleTargetAudienceChange(html: string) {
        updateCampaignInfo({ targetAudience: html });
    }

    /**
     * Handle team change
     */
    function handleTeamChange(html: string) {
        updateCampaignInfo({ team: html });
    }
</script>

<div class="space-y-8">
    <!-- Page Header -->
    <div>
        <h1 class="text-secondary mb-2 text-3xl leading-tight font-bold lg:text-4xl">
            {$t("wizard.campaignInfo.title")}
        </h1>
        <p class="text-secondary text-base">{$t("wizard.campaignInfo.subtitle")}</p>
    </div>

    <!-- Media Section -->
    <section data-field="media" class="space-y-4">
        <div>
            <h2 class="text-secondary mb-1 text-xl font-semibold">
                {$t("wizard.campaignInfo.media.title")}
                <span class="text-secondary" aria-label="required">*</span>
            </h2>
            <p class="text-secondary text-sm">
                {$t("wizard.campaignInfo.media.help")}
            </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
            <MediaUploader
                images={campaignInfo.images}
                onUpload={handleImageUpload}
                onRemove={handleImageRemove}
            />

            <VideoUrlInput video={campaignInfo.video} onChange={handleVideoChange} />
        </div>
    </section>

    <!-- Objectives Section -->
    <section data-field="objectives" class="space-y-4">
        <div>
            <label for="objectives" class="text-secondary mb-1 block text-xl font-semibold">
                {$t("wizard.campaignInfo.objectives.label")}
                <span class="text-secondary" aria-label="required">*</span>
            </label>
            <p class="text-secondary text-sm" id="objectives-help">
                {$t("wizard.campaignInfo.objectives.help")}
            </p>
        </div>

        <RichTextEditor
            id="objectives"
            value={campaignInfo.objectives}
            onChange={handleObjectivesChange}
            placeholder={$t("wizard.campaignInfo.objectives.placeholder")}
            minLength={50}
            maxLength={5000}
            ariaDescribedBy="objectives-help"
        />
    </section>

    <!-- Legacy Section -->
    <section data-field="legacy" class="space-y-4">
        <div>
            <label for="legacy" class="text-secondary mb-1 block text-xl font-semibold">
                {$t("wizard.campaignInfo.legacy.label")}
                <span class="text-secondary" aria-label="required">*</span>
            </label>
            <p class="text-secondary text-sm" id="legacy-help">
                {$t("wizard.campaignInfo.legacy.help")}
            </p>
        </div>

        <RichTextEditor
            id="legacy"
            value={campaignInfo.legacy}
            onChange={handleLegacyChange}
            placeholder={$t("wizard.campaignInfo.legacy.placeholder")}
            minLength={50}
            maxLength={5000}
            ariaDescribedBy="legacy-help"
        />
    </section>

    <!-- Target Audience Section -->
    <section data-field="targetAudience" class="space-y-4">
        <div>
            <label for="target-audience" class="text-secondary mb-1 block text-xl font-semibold">
                {$t("wizard.campaignInfo.target.label")}
                <span class="text-secondary" aria-label="required">*</span>
            </label>
            <p class="text-secondary text-sm" id="target-help">
                {$t("wizard.campaignInfo.target.help")}
            </p>
        </div>

        <RichTextEditor
            id="target-audience"
            value={campaignInfo.targetAudience}
            onChange={handleTargetAudienceChange}
            placeholder={$t("wizard.campaignInfo.target.placeholder")}
            minLength={30}
            maxLength={5000}
            ariaDescribedBy="target-help"
        />
    </section>

    <!-- Team Section -->
    <section data-field="team" class="space-y-4">
        <div>
            <label for="team" class="text-secondary mb-1 block text-xl font-semibold">
                {$t("wizard.campaignInfo.team.label")}
                <span class="text-secondary" aria-label="required">*</span>
            </label>
            <p class="text-secondary text-sm" id="team-help">
                {$t("wizard.campaignInfo.team.help")}
            </p>
        </div>

        <RichTextEditor
            id="team"
            value={campaignInfo.team}
            onChange={handleTeamChange}
            placeholder={$t("wizard.campaignInfo.team.placeholder")}
            minLength={50}
            maxLength={5000}
            ariaDescribedBy="team-help"
        />
    </section>

    <!-- Continue Button -->
    <div class="flex justify-end pt-4">
        <Button kind="primary" size="md" onclick={handleContinue} class="min-w-[200px]">
            {#snippet children()}
                {$t("wizard.campaignInfo.continue")}
            {/snippet}
        </Button>
    </div>
</div>
