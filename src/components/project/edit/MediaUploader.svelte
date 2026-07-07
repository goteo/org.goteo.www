<!--
    MediaUploader Component

    Accessible file upload component that uploads images to S3 via the
    existing upload pipeline (preupload → PUT → postupload).

    Features:
    - File validation (type, size)
    - Upload to app storage bucket via S3 signed URLs
    - Preview grid with remove functionality
    - Maximum file limits (default: 3)
    - Inline error messages with visual feedback
    - Loading states with progress indicator
    - Full keyboard accessibility
    - Responsive layout (1/2/3 columns)

    Design System Compliance:
    - Colors: bg-light-surface, border-secondary, text-tertiary
    - Border radius: rounded-lg (8px) for previews, rounded-3xl (24px) for button
    - Spacing: gap-4 for layout, mt-1 for errors
    - Typography: text-xs for file info and errors
    - Icons: Uses icon components from /src/svgs/
    - Components: Uses Button component from library (kind="secondary" for upload, kind="invert" for remove)

    Props:
     - images: UploadedFile[] - Array of uploaded images
     - onUpload: (image: UploadedFile) => void - Callback when image uploaded successfully
    - onRemove: (id: string) => void - Callback when image removed
    - maxFiles?: number - Maximum number of files allowed (default: 3)
    - maxFileSize?: number - Maximum file size in bytes (default: 5MB)
    - accept?: string - Accepted file types (default: "image/*")
    - error?: string - External validation error message
    - class?: ClassNameValue - Additional Tailwind classes

    Usage:
    ```svelte
    <MediaUploader
        bind:images={campaignImages}
        onUpload={(img) => addImage(img)}
        onRemove={(id) => removeImage(id)}
        maxFiles={5}
        maxFileSize={1024 * 1024}
        error={validationError}
        class="mt-6"
    />
    ```

    Accessibility:
    - ARIA labels for all interactive elements
    - aria-busy for upload progress
    - role="alert" for error messages
    - role="status" for progress updates
    - role="list" and role="listitem" for preview grid
    - Keyboard navigation support (focusable remove buttons)
    - Screen reader friendly messages
-->
<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import CloseIcon from "../../../components/icons/navigation/Close.svelte";
    import { t } from "../../../i18n/store";
    import UploadIcon from "../../icons/actions/UploadIcon.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import Loader from "../../library/feedback/Loader.svelte";
    import { uploadImage } from "../../../utils/imageUpload";

    import type { UploadedFile } from "../../../stores/drafts/projectDraft";

    interface MediaUploaderProps {
        images: UploadedFile[];
        onUpload: (image: UploadedFile) => void;
        onRemove: (id: string) => void;
        maxFiles?: number;
        maxFileSize?: number;
        accept?: string;
        error?: string; // External validation error
        class?: ClassNameValue; // Additional Tailwind classes
    }

    let {
        images,
        onUpload,
        onRemove,
        maxFiles = 3,
        maxFileSize = 5 * 1024 * 1024, // 5 MB
        accept = "image/*",
        error = undefined,
        class: className = "",
    }: MediaUploaderProps = $props();

    let fileInput: HTMLInputElement;
    let validationError = $state<string | null>(null);
    let isUploading = $state(false);
    let uploadProgress = $state<string | null>(null);

    // Generate unique ID for ARIA associations
    const generatedId = $props.id();
    const uploaderId = $derived(generatedId);

    /**
     * Handles file selection from input.
     * Validates the file and uploads to S3 via the existing upload pipeline.
     */
    async function handleFileSelect(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;

        validationError = null;

        if (images.length >= maxFiles) {
            validationError = $t("wizard.validation.campaign_info.media.max_images");
            resetInput();
            return;
        }

        const file = files[0];

        if (!file.type.startsWith("image/")) {
            validationError = $t("wizard.validation.campaign_info.media.invalid_image");
            resetInput();
            return;
        }

        if (file.size > maxFileSize) {
            validationError = $t("wizard.validation.campaign_info.media.image_too_large");
            resetInput();
            return;
        }

        isUploading = true;
        uploadProgress = file.name;

        try {
            const { url, key } = await uploadImage(file);

            const newImage: UploadedFile = {
                id: crypto.randomUUID(),
                url,
                key,
                name: file.name,
                size: file.size,
                type: file.type,
            };

            onUpload(newImage);
            validationError = null;
        } catch (error) {
            validationError =
                error instanceof Error
                    ? error.message
                    : $t("wizard.validation.campaign_info.media.upload_failed");
            console.error("Image upload error:", error);
        } finally {
            isUploading = false;
            uploadProgress = null;
            resetInput();
        }
    }

    /**
     * Handles image removal
     * Clears validation errors and calls parent callback
     */
    function handleRemove(id: string) {
        validationError = null;
        onRemove(id);
    }

    /**
     * Resets file input value to allow re-selection of same file
     */
    function resetInput() {
        if (fileInput) fileInput.value = "";
    }

    /**
     * Formats byte size to human-readable string
     */
    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    // Compute final error message (external or validation)
    const errorMessage = $derived(error || validationError);
</script>

<div class={twMerge("flex flex-col gap-4", className)}>
    <!-- Upload Button -->
    <Button
        type="button"
        kind="secondary"
        size="md"
        disabled={images.length >= maxFiles || isUploading}
        onclick={() => fileInput?.click()}
        aria-label={isUploading
            ? $t("pages.project.edit.campaignInfo.media.uploading")
            : images.length >= maxFiles
              ? $t("pages.project.edit.campaignInfo.media.maxImagesReached", { max: maxFiles })
              : $t("pages.project.edit.campaignInfo.media.addImage")}
        aria-busy={isUploading}
    >
        {#if isUploading}
            <Loader />
        {:else}
            <UploadIcon />
        {/if}
        {isUploading
            ? $t("pages.project.edit.campaignInfo.media.uploading")
            : $t("pages.project.edit.campaignInfo.media.addImage")}
    </Button>

    <!-- Hidden File Input -->
    <input
        bind:this={fileInput}
        type="file"
        {accept}
        onchange={handleFileSelect}
        class="hidden"
        disabled={images.length >= maxFiles || isUploading}
    />

    <!-- Error Message -->
    {#if errorMessage}
        <p id={`${uploaderId}-error`} class="mt-1 text-xs text-red-600" role="alert">
            {errorMessage}
        </p>
    {/if}

    <!-- Upload Progress -->
    {#if isUploading && uploadProgress}
        <div role="status" aria-live="polite" class="text-content mt-1 text-xs">
            {$t("pages.project.edit.campaignInfo.media.processing", { name: uploadProgress })}
        </div>
    {/if}

    <!-- Preview Grid -->
    {#if images.length > 0}
        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {#each images as image (image.id)}
                <div class="group relative aspect-video overflow-hidden rounded-lg" role="listitem">
                    <img src={image.url} alt={image.name} class="h-full w-full object-cover" />

                    <!-- Remove Button -->
                    <Button
                        type="button"
                        kind="invert"
                        size="sm"
                        onclick={() => handleRemove(image.id)}
                        aria-label={$t("common.remove", {
                            name: image.name,
                        })}
                        class={twMerge(
                            "absolute top-2 right-2",
                            "rounded-full p-1.5",
                            "bg-secondary/80 text-primary",
                            "transition-all",
                            "hover:bg-secondary focus:bg-secondary",
                            "focus:ring-primary focus:ring-offset-secondary/80 focus:ring-2 focus:ring-offset-2",
                            "focus:outline-none",
                            "group-hover:opacity-100 sm:opacity-0",
                        )}
                    >
                        <CloseIcon />
                    </Button>

                    <!-- File Info -->
                    <div
                        class="bg-secondary/80 text-primary absolute right-0 bottom-0 left-0 px-2 py-1 text-xs"
                    >
                        {formatFileSize(image.size)}
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Max Files Reached Message -->
    {#if images.length >= maxFiles}
        <p class="text-content mt-1 text-xs" role="status" aria-live="polite">
            {$t("pages.project.edit.campaignInfo.media.maxImagesReached", { max: maxFiles })}
        </p>
    {/if}
</div>
