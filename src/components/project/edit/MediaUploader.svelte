<!--
    MediaUploader Component

    Accessible file upload component that uploads images to S3 via the
    existing upload pipeline (preupload → PUT → postupload).

    Features:
    - File validation (type, size)
    - Upload to app storage bucket via S3 signed URLs
    - Maximum file limits (default: 3)
    - Inline error messages with visual feedback
    - Loading states with progress indicator
    - Full keyboard accessibility

    Props:
     - images: UploadedFile[] - Array of uploaded images
     - onUpload: (image: UploadedFile) => void - Callback when image uploaded successfully
     - maxFiles?: number - Maximum number of files allowed (default: 3)
     - maxFileSize?: number - Maximum file size in bytes (default: 5MB)
     - accept?: string - Accepted file types (default: "image/*")
     - error?: string - External validation error message
     - class?: ClassNameValue - Additional Tailwind classes
-->
<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { t } from "../../../i18n/store";
    import { uploadImage } from "../../../utils/imageUpload";
    import UploadIcon from "../../icons/actions/UploadIcon.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import Loader from "../../library/feedback/Loader.svelte";

    import type { UploadedFile } from "../../../stores/drafts/projectDraft";

    interface MediaUploaderProps {
        images: UploadedFile[];
        onUpload: (image: UploadedFile) => void;
        maxFiles?: number;
        maxFileSize?: number;
        accept?: string;
        error?: string;
        class?: ClassNameValue;
    }

    let {
        images,
        onUpload,
        maxFiles = 3,
        maxFileSize = 5 * 1024 * 1024,
        accept = "image/*",
        error = undefined,
        class: className = "",
    }: MediaUploaderProps = $props();

    let fileInput: HTMLInputElement;
    let validationError = $state<string | null>(null);
    let isUploading = $state(false);
    let uploadProgress = $state<string | null>(null);

    const generatedId = $props.id();
    const uploaderId = $derived(generatedId);

    async function handleFileSelect(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;

        validationError = null;

        if (images.length >= maxFiles) {
            validationError = $t("pages.project.edit.campaignInfo.media.validation.max_images");
            resetInput();
            return;
        }

        const file = files[0];

        if (!file.type.startsWith("image/")) {
            validationError = $t("pages.project.edit.campaignInfo.media.validation.invalid_image");
            resetInput();
            return;
        }

        if (file.size > maxFileSize) {
            validationError = $t(
                "pages.project.edit.campaignInfo.media.validation.image_too_large",
            );
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
                    : $t("pages.project.edit.campaignInfo.media.validation.upload_failed");
            console.error("Image upload error:", error);
        } finally {
            isUploading = false;
            uploadProgress = null;
            resetInput();
        }
    }

    function resetInput() {
        if (fileInput) fileInput.value = "";
    }

    const errorMessage = $derived(error || validationError);
</script>

<div class={twMerge("flex flex-col gap-4", className)}>
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

    <input
        bind:this={fileInput}
        type="file"
        {accept}
        onchange={handleFileSelect}
        class="hidden"
        disabled={images.length >= maxFiles || isUploading}
    />

    {#if errorMessage}
        <p id={`${uploaderId}-error`} class="mt-1 text-xs text-red-600" role="alert">
            {errorMessage}
        </p>
    {/if}

    {#if isUploading && uploadProgress}
        <div role="status" aria-live="polite" class="text-content mt-1 text-xs">
            {$t("pages.project.edit.campaignInfo.media.processing", { name: uploadProgress })}
        </div>
    {/if}

    {#if images.length >= maxFiles}
        <p class="text-content mt-1 text-xs" role="status" aria-live="polite">
            {$t("pages.project.edit.campaignInfo.media.maxImagesReached", { max: maxFiles })}
        </p>
    {/if}
</div>
