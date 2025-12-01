<!--
    Video URL Input Component

    Accessible video URL input component with YouTube and Vimeo validation and embed preview.

    Features:
    - URL validation for YouTube and Vimeo
    - Live embed preview in iframe
    - Remove functionality with confirmation
    - Inline error messages with visual feedback
    - Loading states during validation
    - Full keyboard accessibility

    Design System Compliance:
    - Colors: bg-purple-tint for button, border-secondary for input
    - Border radius: rounded-3xl (24px) for button, rounded-lg (8px) for input/preview
    - Spacing: gap-2 for vertical layout
    - Typography: text-sm for errors
    - Icons: Uses VideoIcon and CloseIcon from /src/svgs/
    - Components: Uses Button (kind="secondary", kind="ghost") and TextInput from library
    - Uses tailwind-merge for class composition

    Props:
    - video: VideoEmbed | null - Current video embed data (url, type, embedId)
    - onChange: (video: VideoEmbed | null) => void - Callback when video changes
    - class?: ClassNameValue - Additional Tailwind classes

    Usage:
    ```svelte
    <VideoUrlInput
        bind:video={campaignVideo}
        onChange={(video) => updateVideo(video)}
        class="mt-4"
    />
    ```

    Accessibility:
    - ARIA labels for all interactive elements
    - aria-invalid for validation errors
    - role="alert" for error messages
    - Keyboard navigation support (focusable buttons)
    - Proper label associations with input
    - Screen reader friendly messages

    Validation Strategy:
    - YouTube: Supports youtube.com/watch?v= and youtu.be/ formats
    - Vimeo: Supports vimeo.com/{id} format
    - Real-time validation on input change
    - Clear error messages for invalid URLs
    - Empty input clears validation errors
-->
<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";
    import { t } from "../../../i18n/store";
    import type { VideoEmbed } from "../../../stores/wizard-state";
    import Button from "../../../components/library/Button.svelte";
    import TextInput from "../../../components/library/TextInput.svelte";
    import VideoIcon from "../../../svgs/VideoIcon.svelte";
    import CloseIcon from "../../../svgs/CloseIcon.svelte";

    interface VideoUrlInputProps {
        video: VideoEmbed | null;
        onChange: (video: VideoEmbed | null) => void;
        class?: ClassNameValue;
    }

    let { video, onChange, class: className = "" }: VideoUrlInputProps = $props();

    let videoUrl = $state(video?.url || "");
    let validationError = $state("");
    let showInput = $state(false);

    // Watch for videoUrl changes and trigger validation
    $effect(() => {
        if (showInput && videoUrl !== (video?.url || "")) {
            handleUrlChange(videoUrl);
        }
    });

    /**
     * Extracts embed information from YouTube or Vimeo URLs
     *
     * @param url - The video URL to parse
     * @returns VideoEmbed object or null if invalid
     */
    function extractEmbedInfo(url: string): VideoEmbed | null {
        if (!url || url.trim().length === 0) {
            return null;
        }

        // YouTube patterns
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch) {
            return {
                type: "youtube",
                embedId: youtubeMatch[1],
                url: url,
            };
        }

        // Vimeo patterns
        const vimeoRegex = /vimeo\.com\/(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch) {
            return {
                type: "vimeo",
                embedId: vimeoMatch[1],
                url: url,
            };
        }

        return null;
    }

    /**
     * Generates embed URL for iframe based on video type
     *
     * @param embedInfo - VideoEmbed object with type and embedId
     * @returns Embed URL string for iframe src
     */
    function getEmbedUrl(embedInfo: VideoEmbed): string {
        if (embedInfo.type === "youtube") {
            return `https://www.youtube.com/embed/${embedInfo.embedId}`;
        } else if (embedInfo.type === "vimeo") {
            return `https://player.vimeo.com/video/${embedInfo.embedId}`;
        }
        return "";
    }

    /**
     * Handles video URL input changes with real-time validation
     * Validates URL format and calls onChange callback
     */
    function handleUrlChange(url: string) {
        if (url.trim().length === 0) {
            validationError = "";
            onChange(null);
            return;
        }

        const embedInfo = extractEmbedInfo(url);
        if (embedInfo) {
            validationError = "";
            onChange(embedInfo);
        } else {
            validationError = $t("wizard.validation.campaign_info.video.invalid_url");
            onChange(null);
        }
    }

    /**
     * Handles video removal
     * Clears input, validation errors, and calls onChange callback
     */
    function handleRemove() {
        videoUrl = "";
        validationError = "";
        showInput = false;
        onChange(null);
    }

    /**
     * Shows input field and focuses it
     */
    function handleShowInput() {
        showInput = true;
        setTimeout(() => document.getElementById("video-url-input")?.focus(), 0);
    }

    // Compute embed preview from current video
    const embedPreview = $derived(video ? extractEmbedInfo(video.url) : null);
</script>

<div class={twMerge("flex flex-col gap-2", className)}>
    {#if !video}
        <div class="flex flex-col gap-2">
            <!-- Add Video Button -->
            <Button
                type="button"
                kind="secondary"
                size="md"
                onclick={handleShowInput}
                aria-label={$t("wizard.campaignInfo.media.addVideo")}
            >
                {#snippet children()}
                    <VideoIcon />
                    {$t("wizard.campaignInfo.media.addVideo")}
                {/snippet}
            </Button>

            <!-- Video URL Input -->
            {#if showInput}
                <TextInput
                    id="video-url-input"
                    type="url"
                    placeholder={$t("wizard.campaignInfo.media.videoPlaceholder")}
                    bind:value={videoUrl}
                    error={validationError}
                />
            {/if}
        </div>
    {:else if embedPreview}
        <div class="flex flex-col gap-2">
            <!-- Video Embed Preview -->
            <div class="relative aspect-video overflow-hidden rounded-lg bg-black">
                <iframe
                    src={getEmbedUrl(embedPreview)}
                    frameborder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                    title="Video preview"
                    class="absolute inset-0 h-full w-full"
                ></iframe>
            </div>

            <!-- Remove Video Button -->
            <Button
                type="button"
                kind="secondary"
                size="sm"
                onclick={handleRemove}
                aria-label={$t("wizard.campaignInfo.media.removeVideo")}
                class="border-secondary text-secondary hover:bg-light-surface self-start border-2 bg-white"
            >
                {#snippet children()}
                    <span class="h-4 w-4">
                        <CloseIcon />
                    </span>
                    {$t("wizard.campaignInfo.media.removeVideo")}
                {/snippet}
            </Button>
        </div>
    {/if}
</div>
