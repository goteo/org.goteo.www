<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import { t } from "../../../i18n/store";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";
    import Button from "../../library/Button.svelte";

    import type { Project, ProjectCollaboration } from "../../../openapi/client";
    import type { ClassNameValue } from "tailwind-merge";

    type CollabPayload = {
        project: string;
        title: string;
        description: string;
    };

    let {
        open = $bindable(false),
        collab,
        project,
        onSave,
        onDelete,
    }: {
        open: boolean;
        collab: ProjectCollaboration | null;
        project: Project;
        onSave?: (data: any) => Promise<void>;
        onDelete?: (id: number | undefined, type?: "minimum" | "optimum") => Promise<void>;
    } = $props();

    let title = $state(collab?.title ?? "");
    let description = $state(collab?.description ?? "");

    const INPUTS_CLASSES: ClassNameValue =
        "border-secondary text-content items-center rounded-lg border bg-white p-4 text-base font-normal placeholder:opacity-48 focus:ring-0";

    async function handleSaveOrCreate() {
        if (!collab) return;
        let payload: CollabPayload = {
            project: apiProjectsGetCollectionUrl + "/" + (project.slug ?? project.id),
            title,
            description,
        };

        await onSave?.(payload);
    }

    async function handleDeleteClick() {
        if (collab) await onDelete?.(collab.id);
    }
</script>

<Modal
    bind:open
    closeBtnClass="top-7 end-7 cursor-pointer bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 mx-2 flex w-full max-w-225 -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px] sm:mx-4 lg:mx-0"
    headerClass="md:p-0 p-0 flex-col gap-4 justify-start items-start"
    bodyClass="md:p-0 p-0"
    footerClass="md:p-0 p-0 flex items-center justify-end gap-4"
>
    {#snippet header()}
        <h2 class="text-xl font-bold text-black">
            {$t(`wizard.collaborations.modal.title`)}
        </h2>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t(`wizard.collaborations.modal.description`)}
        </p>
    {/snippet}
    <div class="flex flex-col gap-4">
        <input
            type="text"
            placeholder={$t("wizard.collaborations.modal.placeholders.title")}
            class={INPUTS_CLASSES}
            value={collab?.title ?? ""}
        />
        <textarea
            placeholder={$t("wizard.collaborations.modal.placeholders.description")}
            class={`h-32 resize-none ${INPUTS_CLASSES}`}>{collab?.description ?? ""}</textarea
        >
    </div>

    {#snippet footer()}
        {#if collab !== null}
            <Button kind="secondary" onclick={() => handleDeleteClick()} class="w-fit">
                {$t(`wizard.collaborations.modal.btns.delete`)}
            </Button>
        {/if}
        <Button onclick={() => handleSaveOrCreate()} class="w-fit">
            {$t(`wizard.collaborations.modal.btns.continue`)}
        </Button>
    {/snippet}
</Modal>
