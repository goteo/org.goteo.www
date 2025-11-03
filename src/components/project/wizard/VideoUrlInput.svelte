<!--
    Video URL Input Component

    Handles YouTube and Vimeo video URL input with embed preview.

    Features:
    - URL validation for YouTube and Vimeo
    - Embed preview
    - Remove functionality
-->
<script lang="ts">
    import { t } from "../../../i18n/store";
    import type { VideoEmbed } from "../../../stores/wizard-state";

    interface VideoUrlInputProps {
        video: VideoEmbed | null;
        onChange: (video: VideoEmbed | null) => void;
    }

    let { video, onChange }: VideoUrlInputProps = $props();

    let videoUrl = $state(video?.url || "");
    let validationError = $state("");
    let showInput = $state(false);

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

    function getEmbedUrl(embedInfo: VideoEmbed): string {
        if (embedInfo.type === "youtube") {
            return `https://www.youtube.com/embed/${embedInfo.embedId}`;
        } else if (embedInfo.type === "vimeo") {
            return `https://player.vimeo.com/video/${embedInfo.embedId}`;
        }
        return "";
    }

    function handleUrlChange(e: Event) {
        const url = (e.target as HTMLInputElement).value;
        videoUrl = url;

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

    function handleRemove() {
        videoUrl = "";
        validationError = "";
        onChange(null);
    }

    const embedPreview = $derived(video ? extractEmbedInfo(video.url) : null);
</script>

<div class="video-url-input">
    {#if !video}
        <div class="space-y-2">
            <button
                type="button"
                class="upload-button border-light-muted bg-light hover:border-primary flex items-center gap-2 rounded-md border-2 border-dashed px-6 py-3 transition-colors hover:bg-gray-50"
                onclick={() => {
                    showInput = true;
                    setTimeout(() => document.getElementById("video-url-input")?.focus(), 0);
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                {$t("wizard.campaignInfo.media.addVideo")}
            </button>

            {#if showInput}
                <input
                    id="video-url-input"
                    type="url"
                    placeholder={$t("wizard.campaignInfo.media.videoPlaceholder")}
                    value={videoUrl}
                    oninput={handleUrlChange}
                    class="video-input border-light-muted focus:border-primary focus:ring-primary/20 w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none"
                />

                {#if validationError}
                    <p role="alert" class="text-sm text-red-500">{validationError}</p>
                {/if}
            {/if}
        </div>
    {:else if embedPreview}
        <div class="video-display space-y-2">
            <div class="embed-preview relative aspect-video overflow-hidden rounded-md bg-black">
                <iframe
                    src={getEmbedUrl(embedPreview)}
                    frameborder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                    title="Video preview"
                    class="absolute inset-0 h-full w-full"
                ></iframe>
            </div>
            <button
                type="button"
                class="border-light-muted flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                onclick={handleRemove}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                {$t("wizard.campaignInfo.media.removeVideo")}
            </button>
        </div>
    {/if}
</div>
