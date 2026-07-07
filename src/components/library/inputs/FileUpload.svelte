<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import CloseIcon from "../../icons/navigation/Close.svelte";
    import UploadFileIcon from "../../icons/actions/UploadFile.svelte";
    import WarningIcon from "../../icons/status/Warning.svelte";
    import { t } from "../../../i18n/store";
    import { uploadImage } from "../../../utils/imageUpload";
    import Button from "../buttons/Button.svelte";
    import Loader from "../feedback/Loader.svelte";
    import type { UploadedFile } from "../../../stores/drafts/projectDraft";

    let {
        maxSizeMB = 20,
        accept = ["image/png", "image/jpeg", "video/mp4", "video/quicktime"],
        files = $bindable<UploadedFile[]>([]),
        ariaLabel = "Upload files",
        class: className = "",
    } = $props<{
        maxSizeMB?: number;
        accept?: string[];
        files?: UploadedFile[];
        ariaLabel?: string;
        class?: ClassNameValue;
    }>();

    let isDragging = $state(false);
    let error = $state<string | null>(null);
    let uploadingFiles = $state<Set<string>>(new Set());

    const maxSizeBytes = $derived(maxSizeMB * 1024 * 1024);

    const mimeExtensions: Record<string, string> = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "application/pdf": ".pdf",
        "video/mp4": ".mp4",
        "video/quicktime": ".mov",
    };

    let supportedTypes = $derived(
        accept.map((mime: string) => mimeExtensions[mime] ?? `.${mime.split("/")[1]}`).join(", "),
    );

    function validate(file: File) {
        if (file.size > maxSizeBytes) {
            error = `${$t("system.error.file.sizeTooLarge", { file: file.name, max: maxSizeMB })}`;
            return false;
        }

        if (!accept.includes(file.type)) {
            error = `${$t("system.error.file.unsupportedType", { file: file.name })}`;
            return false;
        }

        return true;
    }

    async function uploadFile(file: File) {
        uploadingFiles = new Set([...uploadingFiles, file.name]);

        try {
            const { url, key } = await uploadImage(file);

            const uploaded: UploadedFile = {
                id: crypto.randomUUID(),
                url,
                key,
                name: file.name,
                size: file.size,
                type: file.type,
            };

            files = [...files, uploaded];
            error = null;
        } catch (err) {
            error = err instanceof Error ? err.message : "Upload failed";
            console.error("File upload error:", err);
        } finally {
            const next = new Set(uploadingFiles);
            next.delete(file.name);
            uploadingFiles = next;
        }
    }

    async function handleFiles(fileList: FileList | null) {
        if (!fileList) return;

        error = null;

        const validFiles = Array.from(fileList).filter(validate);

        for (const file of validFiles) {
            await uploadFile(file);
        }
    }

    function onInputChange(e: Event) {
        const input = e.currentTarget as HTMLInputElement;
        handleFiles(input.files);
        input.value = "";
    }

    function onDrop(e: DragEvent) {
        e.preventDefault();
        isDragging = false;
        handleFiles(e.dataTransfer?.files ?? null);
    }

    function onDragOver(e: DragEvent) {
        e.preventDefault();
        isDragging = true;
    }

    function onDragLeave() {
        isDragging = false;
    }

    async function handleRemove(id: string) {
        const file = files.find((f: UploadedFile) => f.id === id);
        if (file?.key) {
            try {
                await fetch("/api/upload/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: file.key }),
                });
            } catch (err) {
                console.error("Failed to delete file from bucket:", err);
            }
        }

        files = files.filter((f: UploadedFile) => f.id !== id);
    }

    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    function isImage(mime: string): boolean {
        return mime.startsWith("image/");
    }
</script>

<div class={twMerge("flex flex-col gap-4", className)}>
    <!-- Drop Zone -->
    <div
        role="button"
        tabindex="0"
        class={twMerge(
            "w-full rounded-lg border border-dashed p-4 text-center transition",
            isDragging ? "border-secondary/60" : "border-secondary",
        )}
        ondragover={onDragOver}
        ondragleave={onDragLeave}
        ondrop={onDrop}
    >
        <input
            type="file"
            multiple
            class="hidden"
            id="fileInput"
            accept={accept.join(",")}
            onchange={onInputChange}
        />

        <label for="fileInput" class="flex h-32 cursor-pointer flex-col justify-center gap-2">
            <UploadFileIcon class="size-10 self-center" />
            <p class="text-content overflow-hidden text-base font-normal text-ellipsis">
                {$t("pages.project.edit.rewards.modal.placeholders.files")}
            </p>
        </label>
    </div>

    <!-- Constraints -->
    <div class="text-content flex justify-between text-sm/4 font-medium">
        <div class="flex items-center gap-2">
            <WarningIcon width="16" height="16" />
            <span>{$t("system.constraint.file.supportedTypes", { types: supportedTypes })}</span>
        </div>
        <span>{$t("system.constraint.file.maxAllowedSize", { maxSizeMB })}</span>
    </div>

    {#if error}
        <p class="mt-2 text-sm text-red-500">{error}</p>
    {/if}

    <!-- Uploaded Files -->
    {#if files.length > 0}
        <div class="mt-2 flex flex-col gap-2" role="list">
            {#each files as file (file.id)}
                <div
                    class="bg-light-surface border-secondary flex items-center gap-3 rounded-lg border p-3"
                    role="listitem"
                >
                    <!-- Preview -->
                    {#if isImage(file.type)}
                        <img
                            src={file.url}
                            alt={file.name}
                            class="h-12 w-12 shrink-0 rounded object-cover"
                        />
                    {:else if file.type.startsWith("video/")}
                        <div
                            class="bg-secondary/20 flex h-12 w-12 shrink-0 items-center justify-center rounded"
                        >
                            <span class="text-xs font-bold">VIDEO</span>
                        </div>
                    {:else}
                        <div
                            class="bg-secondary/20 flex h-12 w-12 shrink-0 items-center justify-center rounded"
                        >
                            <span class="text-xs font-bold">PDF</span>
                        </div>
                    {/if}

                    <!-- File Info -->
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium">{file.name}</p>
                        <p class="text-content text-xs">{formatFileSize(file.size)}</p>
                    </div>

                    <!-- Remove Button -->
                    <Button
                        type="button"
                        kind="invert"
                        size="sm"
                        onclick={() => handleRemove(file.id)}
                        aria-label={$t("common.remove", { name: file.name })}
                        class="shrink-0 rounded-full p-1.5"
                    >
                        <CloseIcon />
                    </Button>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Uploading Indicator -->
    {#if uploadingFiles.size > 0}
        <div
            role="status"
            aria-live="polite"
            class="text-content mt-1 flex items-center gap-2 text-xs"
        >
            <Loader />
            <span>{$t("pages.project.edit.campaignInfo.media.uploading")}</span>
        </div>
    {/if}
</div>
