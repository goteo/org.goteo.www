<script lang="ts">
    import { t } from "../../i18n/store";
    import Comments from "../icons/Comments.svelte";

    import type { ProjectRow } from "./ProjectsTable.svelte";

    let { project, onOpenAnnotationsModal } = $props<{
        project: ProjectRow;
        onOpenAnnotationsModal: () => void;
    }>();
</script>

<div class="flex flex-col gap-6 px-8 py-6">
    <!-- Row 1: dates -->
    <div class="grid grid-cols-4 gap-6 text-sm">
        {#each [
            { key: "datePublished", value: project.datePublished },
            { key: "dateEnd1", value: project.dateEnd1 },
            { key: "dateEnd2", value: project.dateEnd2 },
            { key: "minOptim", value: project.minOptim },
        ] as item}
            <div class="flex flex-col gap-1">
                <span class="text-content font-bold">
                    {$t(`admin.projects.table.rows.details.${item.key}`)}:
                </span>
                <span class="text-black">{item.value}</span>
            </div>
        {/each}
    </div>

    <!-- Row 2: contact -->
    <div class="grid grid-cols-4 gap-6 text-sm">
        <div class="flex flex-col gap-1">
            <span class="text-content font-bold">{$t("admin.projects.table.rows.details.email")}:</span>
            <span class="truncate text-black">{project.promoter}</span>
        </div>
        <div class="flex flex-col gap-1">
            <span class="text-content font-bold">{$t("admin.projects.table.rows.details.phone")}:</span>
            <span class="text-black">—</span>
        </div>
        <div class="flex flex-col gap-1">
            <span class="text-content font-bold">{$t("admin.projects.table.rows.details.contractExpiry")}:</span>
            <span class="text-black">{project.contractExpiry}</span>
        </div>
        <div class="flex flex-col gap-1">
            <span class="text-content font-bold">{$t("admin.projects.table.rows.details.remaining")}:</span>
            <span class={project.remaining !== "—" ? "text-tertiary font-bold" : "text-black"}>
                {project.remaining}
            </span>
        </div>
    </div>

    <!-- Row 3: action buttons -->
    <div class="flex flex-row flex-wrap gap-3">
        {#each ["changeStatus", "createContract", "promoter", "contributions", "donors", "financialReport"] as key}
            <button
                type="button"
                class="border-secondary text-secondary cursor-pointer rounded-full border bg-white px-5 py-2 text-sm"
            >
                {$t(`admin.projects.table.rows.details.btns.${key}`)}
            </button>
        {/each}
    </div>

    <!-- Row 4: footer -->
    <div class="flex flex-col gap-6 text-base leading-5 md:flex-row md:items-center md:justify-between">
        <div class="text-content min-h-5 text-sm"></div>
        <div class="flex flex-row flex-wrap items-center justify-start gap-8 md:justify-end">
            <button class="text-secondary cursor-pointer border-0 bg-transparent font-bold outline-none">
                {$t("admin.projects.table.rows.details.btns.certificates")}
            </button>
            <button class="text-secondary cursor-pointer border-0 bg-transparent font-bold outline-none">
                {$t("admin.projects.table.rows.details.btns.contractPdf")}
            </button>
            <button
                onclick={onOpenAnnotationsModal}
                class="text-secondary bg-variant1 flex min-h-10 cursor-pointer flex-row items-center gap-2 rounded-2xl px-4 py-2 font-bold"
            >
                <Comments size={20} class="shrink-0" />
                {$t("admin.projects.table.rows.details.btns.annotations")}
                {#if project.annotationsCount > 0}
                    ({project.annotationsCount})
                {/if}
            </button>
        </div>
    </div>
</div>
