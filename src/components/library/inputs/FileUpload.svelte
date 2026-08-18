<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { t } from "../../../i18n/store";
    import { uploadImage } from "../../../utils/media/imageUpload";
    import UploadFileIcon from "../../icons/actions/UploadFile.svelte";
    import CloseIcon from "../../icons/navigation/Close.svelte";
    import WarningIcon from "../../icons/status/Warning.svelte";
    import Button from "../buttons/Button.svelte";

    import type { UploadedObject } from "../../../utils/media/objectStorage.types";

    let {
        accept = ["image/png", "image/jpeg", "video/mp4", "video/quicktime"],
        files = $bindable<UploadedObject[]>([]),
        onUpload,
        ariaLabel = "Upload files",
        class: className = "",
    } = $props<{
        accept?: string[];
        files?: UploadedObject[];
        onUpload: (file: UploadedObject) => void;
        ariaLabel?: string;
        class?: ClassNameValue;
    }>();

    let isDragging = $state(false);
    let error = $state<string | null>(null);
    let uploading = $state<Map<string, number>>(new Map());
    let deleting = $state<Set<string>>(new Set());

    const maxSize = import.meta.env.PUBLIC_DEFAULT_MAXSIZE;

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

    const hasUploading = $derived(uploading.size > 0);

    function validate(file: File) {
        if (file.size > maxSize) {
            error = `${$t("system.error.file.sizeTooLarge", { file: file.name, max: maxSize })}`;
            return false;
        }

        if (!accept.includes(file.type)) {
            error = `${$t("system.error.file.unsupportedType", { file: file.name })}`;
            return false;
        }

        return true;
    }

    async function uploadFile(file: File) {
        uploading = new Map(uploading).set(file.name, 0);

        try {
            const { url, key } = await uploadImage(file, {
                onBytesProgress: (loaded, total) => {
                    uploading = new Map(uploading).set(
                        file.name,
                        Math.round((loaded / total) * 100),
                    );
                },
            });

            const uploaded: UploadedObject = {
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
            const next = new Map(uploading);
            next.delete(file.name);
            uploading = next;
        }
    }

    async function handleFiles(fileList: FileList | null) {
        if (!fileList) return;

        error = null;

        const validFiles = Array.from(fileList).filter(validate);

        for (const file of validFiles) {
            await uploadFile(file);
            onUpload?.(file);
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
        deleting = new Set(deleting).add(id);

        const file = files.find((f: UploadedObject) => f.id === id);
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

        await new Promise((r) => setTimeout(r, 300));

        const next = new Set(deleting);
        next.delete(id);
        deleting = next;

        files = files.filter((f: UploadedObject) => f.id !== id);
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
            aria-label={ariaLabel}
            onchange={onInputChange}
        />

        <label for="fileInput" class="flex h-32 cursor-pointer flex-col justify-center gap-2">
            <UploadFileIcon class="size-10 self-center" />
            <p class="text-content overflow-hidden text-base font-normal text-ellipsis">
                {$t("pages.project.edit.rewards.modal.placeholders.files")}
            </p>
        </label>

        <!-- Uploading files -->
        {#if hasUploading}
            <div class="mt-4 flex flex-col gap-3 text-left">
                {#each [...uploading.entries()] as [name, pct]}
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center justify-between text-xs">
                            <span class="text-content truncate">{name}</span>
                            <span class="shrink-0 font-medium">{pct}%</span>
                        </div>
                        <div class="bg-secondary/20 h-2 w-full overflow-hidden rounded-full">
                            <div
                                class="bg-secondary h-full rounded-full transition-all duration-300"
                                style="width: {pct}%"
                            ></div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}

        {#if files.length > 0}
            <div class="mt-4 flex flex-col gap-2 text-left" role="list">
                {#each files as file (file.id)}
                    <div
                        class={twMerge(
                            "bg-light-surface border-secondary flex items-center gap-3 rounded-lg border p-3 transition-all duration-300",
                            deleting.has(file.id) && "scale-95 opacity-50",
                        )}
                        role="listitem"
                    >
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

                        <div class="min-w-0 flex-1 text-left">
                            <p class="truncate text-sm font-medium">{file.name}</p>
                            <p class="text-content text-xs">{formatFileSize(file.size)}</p>
                        </div>

                        <Button
                            type="button"
                            kind="invert"
                            size="sm"
                            onclick={() => handleRemove(file.id)}
                            disabled={deleting.has(file.id)}
                            aria-label={$t("common.remove", { name: file.name })}
                            class="group shrink-0 rounded-full p-1.5 transition-all duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <CloseIcon
                                class="transition-colors duration-200 group-hover:text-red-600"
                            />
                        </Button>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Constraints -->
    <div class="text-content flex justify-between text-sm/4 font-medium">
        <div class="flex items-center gap-2">
            <WarningIcon width="16" height="16" />
            <span>{$t("system.constraint.file.supportedTypes", { types: supportedTypes })}</span>
        </div>
        <span>
            {$t("system.constraint.file.maxAllowedSize", { size: formatFileSize(maxSize) })}
        </span>
    </div>

    {#if error}
        <p class="mt-2 text-sm text-red-500">{error}</p>
    {/if}
</div>
