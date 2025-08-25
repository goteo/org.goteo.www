<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import ActiveFilterIcon from "../../svgs/ActiveFilterIcon.svelte";
    import AlertIcon from "../../svgs/AlertIcon.svelte";
    import ShareIcon from "../../svgs/ShareIcon.svelte";
    import { Modal } from "flowbite-svelte";

    import type { Project, ProjectUpdate } from "../../openapi/client/index";
    import { apiProjectUpdatesGetCollection } from "../../openapi/client/index";
    import Carousel from "../Carousel.svelte";

    const { project } = $props<{ project: Project }>();
    let projectsUpdates: ProjectUpdate[] = $state([]);
    let openModal = $state(false);
    let selectedProject: ProjectUpdate | null = $state(null);

    function formatDate(date: string): string {
        const options: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "short",
            year: "numeric",
        };
        return new Date(date).toLocaleDateString(undefined, options);
    }

    function cleanCloseButton() {
        const closeBtn = document.querySelector('button[aria-label="Close"]');
        if (!closeBtn) return;

        closeBtn.removeAttribute("aria-label");
        closeBtn.classList.remove("sr-only");

        closeBtn.querySelectorAll("span").forEach((el) => {
            if (el.textContent?.trim() === "Close") {
                el.remove();
            }
        });
    }

    function shouldShowHeader(dateStr?: string): boolean {
        if (!dateStr) return false;
        const now = new Date();
        const date = new Date(dateStr);
        const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        return diffHours <= 72;
    }

    onMount(async () => {
        try {
            const { data } = await apiProjectUpdatesGetCollection({
                query: {
                    project: `/v4/projects/${project.id}`,
                    'order[date]': 'asc',
                },
            });

            projectsUpdates = data || [];
        } catch (error) {
            console.error("Error fetching project updates:", error);
        }
    });

    $effect(() => {
        if (openModal) cleanCloseButton();
        if (!openModal) selectedProject = null;
    });
</script>

<div class="flex flex-col gap-10">
    <h2 class="text-tertiary line-clamp-2 flex max-w-2xl text-[40px] leading-tight font-bold">
        {$t("project.tabs.updates.content.title")}
    </h2>
    <Carousel gap={16} showDots={true} itemsPerGroup={2}>
        {#if projectsUpdates.length === 0}
            <div
                class="flex h-[140px] w-full items-center justify-center rounded bg-indigo-100 font-bold"
            >
                {$t("project.tabs.updates.content.empty")}
            </div>
        {/if}

        {#each projectsUpdates as project}
            <div
                class="flex w-full flex-col justify-between gap-6 rounded-4xl bg-white p-6 font-bold"
            >
                <div class="flex flex-col gap-4">
                    <div class="text-tertiary flex flex-row items-center gap-2">
                        {formatDate(project.date ?? "")}
                        <ActiveFilterIcon />
                    </div>
                    <img
                        src="/imgs/placeholder-project-update.jpg"
                        alt="Imagen de project update"
                        class="no-select rounded-3xl"
                        draggable="false"
                    />
                </div>
                <div class="flex flex-col gap-4">
                    <h2 class="text-tertiary text-lg font-semibold">{project.title}</h2>
                    <div class="flex flex-col gap-2">
                        <p class="text-secondary text-sm">{project.subtitle}</p>
                        <p class="line-clamp-2 text-sm text-[#575757]">{project.body}</p>
                    </div>
                </div>
                <div class="flex w-full items-center justify-end">
                    <button
                        class="text-tertiary border-tertiary flex cursor-pointer items-start truncate rounded-3xl border px-6 py-4 whitespace-nowrap"
                        onclick={() => {
                            selectedProject = project;
                            openModal = true;
                        }}
                    >
                        {$t("project.tabs.updates.content.btn.read-more")}
                    </button>
                </div>
            </div>
        {/each}
    </Carousel>

    <Modal
        bind:open={openModal}
        closeBtnClass="top-7 end-7 bg-transparent text-[#462949] hover:bg-transparent hover:text-[#462949] hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-[#462949] dark:hover:text-[#462949] dark:hover:bg-transparent"
        class="fixed top-1/2 left-1/2 w-full max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    >
        {#if selectedProject}
            {#if shouldShowHeader(selectedProject.date)}
                <div class="flex items-center gap-2 text-base font-bold text-[#462949]">
                    <AlertIcon />
                    {$t("project.tabs.updates.modal-title")}
                </div>
            {/if}
            <h3 class="text-[32px] text-[#462949]">
                {selectedProject?.title}
            </h3>
            <div class="flex flex-col gap-4">
                <p class="text-sm text-[#575757]">{selectedProject.body}</p>
            </div>

            <div class="flex w-full justify-end">
                <button
                    class="bg-primary flex cursor-pointer flex-row gap-2 rounded-3xl px-6 py-4 font-bold text-[#462949]
"
                >
                    <ShareIcon />
                    {$t("project.tabs.updates.content.btn.share")}
                </button>
            </div>
        {/if}
    </Modal>
</div>
