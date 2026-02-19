<script lang="ts">
    import { t } from "../i18n/store";
    import UploadFileIcon from "../svgs/UploadFileIcon.svelte";
    import WarningIcon from "../svgs/WarningIcon.svelte";

    let {
        maxSizeMB = 20,
        accept = ["image/png", "image/jpeg", "video/mp4", "video/quicktime"],
        files = $bindable<File[]>([]),
        ariaLabel = "Upload files",
    } = $props<{
        maxSizeMB?: number;
        accept?: string[];
        files?: File[];
        ariaLabel?: string;
    }>();

    let isDragging = $state(false);
    let error = $state<string | null>(null);

    function validate(file: File) {
        const validSize = file.size <= maxSizeMB * 1024 * 1024;
        const validType = accept.includes(file.type);

        if (!validSize) {
            // For example: El archivo ${file.name} supera el tamaño máximo (${maxSizeMB}MB).
            error = `${$t("wizard.steps.rewards.modal.filesError.size", { fileName: file.name, maxSize: maxSizeMB })}`;
            return false;
        }

        if (!validType) {
            // For example: Tipo de archivo no permitido: ${file.name}
            error = `${$t("wizard.steps.rewards.modal.filesError.type", { fileName: file.name })}`;
            return false;
        }

        return true;
    }

    function handleFiles(fileList: FileList | null) {
        if (!fileList) return;

        error = null;

        const newFiles = Array.from(fileList).filter(validate);
        files = [...files, ...newFiles];
    }

    function onInputChange(e: Event) {
        const input = e.currentTarget as HTMLInputElement;
        handleFiles(input.files);
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
</script>

<div class="flex flex-col gap-4">
    <div
        role="button"
        tabindex="0"
        aria-label={ariaLabel}
        class="w-full rounded-lg border border-dashed p-4 text-center transition
    {isDragging ? 'border-secondary/60' : 'border-secondary'}"
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
            <UploadFileIcon width="40" height="40" class="self-center" />
            <p class="text-content overflow-hidden text-base font-normal text-ellipsis">
                {$t("wizard.steps.rewards.modal.uploadFiles.dragAndDrop")}
                <span class="text-secondary underline">
                    {$t("wizard.steps.rewards.modal.uploadFiles.clickHere")}
                </span>.
            </p>
        </label>
    </div>

    <div class="text-content flex justify-between text-sm/4 font-medium">
        <div class="flex items-center gap-2">
            <WarningIcon width={"16"} height={"16"} />
            <span>{$t("wizard.steps.rewards.modal.compatibleFiles")}</span>
        </div>
        <span>{$t("wizard.steps.rewards.modal.maxSize", { maxSizeMB })}</span>
    </div>
</div>

{#if error}
    <p class="mt-2 text-sm text-red-500">{error}</p>
{/if}

{#if files.length}
    <ul class="mt-4 space-y-1 text-sm">
        {#each files as file}
            <li>{file.name}</li>
        {/each}
    </ul>
{/if}
