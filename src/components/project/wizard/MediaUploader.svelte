<!--
    Media Uploader Component

    Handles image uploads with preview thumbnails.

    Features:
    - File validation (type, size)
    - Preview grid
    - Remove functionality
    - Maximum file limits
-->
<script lang="ts">
    import { t } from "../../../i18n/store";
    import type { MediaImage } from "../../../stores/wizard-state";

    interface MediaUploaderProps {
        images: MediaImage[];
        onUpload: (image: MediaImage) => void;
        onRemove: (id: string) => void;
        maxFiles?: number;
        maxFileSize?: number;
        accept?: string;
    }

    let {
        images,
        onUpload,
        onRemove,
        maxFiles = 3,
        maxFileSize = 500 * 1024, // 500 KB
        accept = "image/*",
    }: MediaUploaderProps = $props();

    let fileInput: HTMLInputElement;

    async function handleFileSelect(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;

        // Check max files limit
        if (images.length >= maxFiles) {
            alert($t("wizard.validation.campaign_info.media.max_images"));
            // Reset input
            if (fileInput) fileInput.value = "";
            return;
        }

        const file = files[0];

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert($t("wizard.validation.campaign_info.media.invalid_image"));
            if (fileInput) fileInput.value = "";
            return;
        }

        // Validate file size
        if (file.size > maxFileSize) {
            alert($t("wizard.validation.campaign_info.media.image_too_large"));
            if (fileInput) fileInput.value = "";
            return;
        }

        // Read file as base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            const newImage: MediaImage = {
                id: crypto.randomUUID(),
                url: base64,
                name: file.name,
                size: file.size,
            };
            onUpload(newImage);
        };
        reader.readAsDataURL(file);

        // Reset input for next upload
        if (fileInput) fileInput.value = "";
    }

    function handleRemove(id: string, name: string) {
        if (confirm($t("wizard.campaignInfo.media.confirmDelete", { name }))) {
            onRemove(id);
        }
    }

    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
</script>

<div class="media-uploader">
    <button
        type="button"
        class="upload-button border-light-muted bg-light hover:border-primary flex items-center gap-2 rounded-md border-2 border-dashed px-6 py-3 transition-colors hover:bg-gray-50"
        onclick={() => fileInput?.click()}
        disabled={images.length >= maxFiles}
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
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        {$t("wizard.campaignInfo.media.addImage")}
    </button>

    <input
        bind:this={fileInput}
        type="file"
        {accept}
        onchange={handleFileSelect}
        class="hidden"
        aria-label="Upload image"
    />

    <!-- Preview Grid -->
    {#if images.length > 0}
        <div class="preview-grid mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {#each images as image (image.id)}
                <div class="preview-item group relative aspect-video overflow-hidden rounded-md">
                    <img src={image.url} alt={image.name} class="h-full w-full object-cover" />
                    <button
                        type="button"
                        class="remove-button absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                        onclick={() => handleRemove(image.id, image.name)}
                        aria-label="Remove {image.name}"
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
                    </button>
                    <div
                        class="file-info absolute right-0 bottom-0 left-0 bg-black/60 px-2 py-1 text-xs text-white"
                    >
                        {formatFileSize(image.size)}
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    {#if images.length >= maxFiles}
        <p class="text-tertiary mt-2 text-sm">
            {$t("wizard.campaignInfo.media.maxImagesReached", { max: maxFiles })}
        </p>
    {/if}
</div>
