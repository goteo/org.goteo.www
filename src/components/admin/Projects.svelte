<script lang="ts">
    import FiltersTags from "./FiltersTags.svelte";
    import ProjectsExportCsv from "./ProjectsExportCsv.svelte";
    import ProjectsFilters from "./ProjectsFilters.svelte";
    import ProjectsTable from "./ProjectsTable.svelte";
    import Slider from "./Slider.svelte";
    import { t } from "../../i18n/store";

    const projectSlides = [
        { title: $t("admin.projects.totalizers.selected"), amount: "" },
        { title: $t("admin.projects.totalizers.totalEarned"), amount: "" },
        { title: $t("admin.projects.totalizers.totalPaid"), amount: "" },
        { title: $t("admin.projects.totalizers.totalUnpaid"), amount: "" },
    ];
</script>

<div class="flex flex-col gap-10">
    <ProjectsFilters />
    <div class="flex flex-col">
        <div class="mb-8 flex justify-between">
            <FiltersTags
                title={$t("admin.projects.lastProjects")}
                filters={{}}
                onCloseFilter={() => {}}
            />
            <ProjectsExportCsv />
        </div>
        <Slider slides={projectSlides} loading={false} />
    </div>
</div>
<ProjectsTable />
