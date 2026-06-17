<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import CloseIcon from "../../../components/icons/navigation/Close.svelte";
    import { t } from "../../../i18n/store";
    import VideoIcon from "../../icons/media/VideoIcon.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import TextInput from "../../library/inputs/TextInput.svelte";

    interface VideoUrlInputProps {
        video?: string;
        onChange: (video: string | null) => void;
        class?: ClassNameValue;
    }

    let { video, onChange, class: className = "" }: VideoUrlInputProps = $props();

    let videoUrl = $state(video || "");
    let validationError = $state("");
    let showInput = $state(!!video);

    function isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    function handleUrlChange(url: string) {
        videoUrl = url;

        if (!url.trim()) {
            validationError = "";
            onChange(null);
            return;
        }

        if (!isValidUrl(url)) {
            validationError = $t("wizard.validation.campaign_info.video.invalid_url");
            return;
        }

        validationError = "";
        onChange(url);
    }

    function handleRemove() {
        videoUrl = "";
        validationError = "";
        showInput = false;
        onChange(null);
    }

    function handleShowInput() {
        showInput = true;

        setTimeout(() => {
            document.getElementById("video-url-input")?.focus();
        }, 0);
    }
</script>

<div class={twMerge("flex flex-col gap-2", className)}>
    {#if !video}
        <div class="flex flex-col gap-2">
            <Button
                type="button"
                kind="secondary"
                size="md"
                onclick={handleShowInput}
                aria-label={$t("pages.project.edit.campaignInfo.media.addVideo")}
            >
                {#snippet children()}
                    <VideoIcon />
                    {$t("pages.project.edit.campaignInfo.media.addVideo")}
                {/snippet}
            </Button>

            {#if showInput}
                <TextInput
                    id="video-url-input"
                    type="url"
                    placeholder={$t("pages.project.edit.campaignInfo.media.videoPlaceholder")}
                    bind:value={videoUrl}
                    error={validationError}
                    onInput={(e) => handleUrlChange((e.target as HTMLInputElement).value)}
                />
            {/if}
        </div>
    {:else}
        <div class="flex flex-col gap-2">
            <div class="border-secondary bg-light-surface rounded-lg border p-3 text-sm break-all">
                {video}
            </div>

            <Button
                type="button"
                kind="secondary"
                size="sm"
                onclick={handleRemove}
                aria-label={$t("pages.project.edit.campaignInfo.media.removeVideo")}
                class="border-secondary text-secondary hover:bg-light-surface self-start border-2 bg-white"
            >
                {#snippet children()}
                    <span class="h-4 w-4">
                        <CloseIcon />
                    </span>

                    {$t("pages.project.edit.campaignInfo.media.removeVideo")}
                {/snippet}
            </Button>
        </div>
    {/if}
</div>
