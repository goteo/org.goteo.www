<script lang="ts">
    import type { Campaign } from "../../types/campaign";
    import { t } from "../../i18n/store";
    import CommentModal from "./CommentModal.svelte";
    import { apiProjectSupportsGetCollection } from "../../openapi/client";

    interface Props {
        project: Campaign;
        token: string;
    }

    let { project, token }: Props = $props();

    let showModal = $state(false);
    let isLoadingSupport = $state(false);
    let loadError = $state<string | null>(null);

    async function openModal() {
        if (!project.projectSupport) {
            isLoadingSupport = true;
            loadError = null;

            try {
                const projectIri =
                    (project as { "@id"?: string })["@id"] || `/v4/projects/${project.id}`;

                const { data: supports } = await apiProjectSupportsGetCollection({
                    query: {
                        project: projectIri,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (supports && supports.length > 0) {
                    project.projectSupport = supports[0];
                    showModal = true;
                } else {
                    console.error("ProjectSupport not found for project:", projectIri);
                    loadError = $t("payment.verify.project-card.error.support-not-found");
                }
            } catch (e) {
                console.error("Error fetching ProjectSupport:", e);
                loadError = $t("payment.verify.project-card.error.load-failed");
            } finally {
                isLoadingSupport = false;
            }
        } else {
            showModal = true;
        }
    }

    function closeModal() {
        showModal = false;
    }

    function handleCommentUpdated(updatedMessage: string) {
        if (project.projectSupport) {
            project.projectSupport.message = updatedMessage;
        }
        closeModal();
    }
</script>

<div
    data-breakpoint="Desktop"
    data-type="Leave comments"
    class="border-grey bg-background flex w-full max-w-[668px] flex-col items-center gap-2 rounded-[32px] border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
>
    <div class="flex flex-col items-center justify-start gap-6 self-stretch">
        <div class="flex flex-col items-end justify-end gap-6 self-stretch">
            <div class="flex flex-col items-start justify-start gap-6 self-stretch md:flex-row">
                <img
                    class="border-grey h-[172px] w-full rounded-3xl border object-cover shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] shadow-[0px_6px_6px_0px_rgba(0,0,0,0.09)] shadow-[0px_13px_8px_0px_rgba(0,0,0,0.05)] shadow-[0px_22px_9px_0px_rgba(0,0,0,0.01)] shadow-[0px_35px_10px_0px_rgba(0,0,0,0.00)] md:w-[298px]"
                    src={project.image}
                    alt={project.title}
                />
                <div class="flex w-full flex-col items-start justify-start gap-6 md:w-72">
                    <div class="flex flex-col items-start justify-start gap-1 self-stretch">
                        <p
                            class="text-content justify-start self-stretch font-['Karla'] text-base leading-6 font-bold"
                        >
                            {$t("payment.verify.project-card.donated-to")}
                        </p>
                        <h3
                            class="text-secondary line-clamp-2 min-h-16 justify-start self-stretch font-['Karla'] text-2xl leading-8 font-bold"
                        >
                            {project.title}
                        </h3>
                    </div>

                    {#if loadError}
                        <div
                            class="border-tertiary/30 bg-tertiary/10 self-stretch rounded-lg border p-4"
                            role="alert"
                            aria-live="polite"
                        >
                            <p class="text-tertiary font-['Karla'] text-sm font-normal">
                                {loadError}
                            </p>
                        </div>
                    {/if}

                    <button
                        type="button"
                        onclick={openModal}
                        disabled={isLoadingSupport}
                        class="bg-light-accent hover:bg-variant1 inline-flex cursor-pointer items-center justify-center gap-2 self-stretch rounded-3xl px-6 py-4 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={project.projectSupport?.message
                            ? $t("payment.verify.project-card.button.edit-aria")
                            : $t("payment.verify.project-card.button.add-aria")}
                    >
                        <div
                            class="relative flex h-6 w-6 items-center justify-center"
                            aria-hidden="true"
                        >
                            {#if !isLoadingSupport && project.projectSupport?.message}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="17"
                                    height="17"
                                    viewBox="0 0 17 17"
                                    fill="none"
                                >
                                    <path
                                        d="M2.25 10.5L6 14.25M9.75 3L13.5 6.75M12 0.75L15.75 4.5L4.5 15.75H0.75L0.75 12L12 0.75Z"
                                        class="stroke-secondary"
                                        stroke-width="1.5"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            {:else}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 18 18"
                                    fill="none"
                                >
                                    <path
                                        d="M5.25 9H8.25M5.25 6H12.75M0.75 2.25V17.25L4.5 14.25H15.75C16.5784 14.25 17.25 13.5784 17.25 12.75V2.25C17.25 1.42157 16.5784 0.75 15.75 0.75H2.25C1.42157 0.75 0.75 1.42157 0.75 2.25Z"
                                        class="stroke-secondary"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            {/if}
                        </div>
                        <span
                            class="text-secondary line-clamp-1 justify-start font-['Karla'] text-base leading-6 font-bold"
                        >
                            {#if isLoadingSupport}
                                {$t("payment.verify.project-card.button.loading")}
                            {:else if project.projectSupport?.message}
                                {$t("payment.verify.project-card.button.edit")}
                            {:else}
                                {$t("payment.verify.project-card.button.add")}
                            {/if}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<CommentModal
    bind:open={showModal}
    {project}
    {token}
    projectSupport={project.projectSupport}
    onClose={closeModal}
    onCommentUpdated={handleCommentUpdated}
/>
