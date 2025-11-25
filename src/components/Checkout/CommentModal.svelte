<script lang="ts">
    import { t } from "../../i18n/store";
    import type { Campaign } from "../../types/campaign";
    import type { ProjectSupport } from "../../openapi/client";
    import { apiProjectSupportsIdPatch } from "../../openapi/client";
    import CloseIcon from "../../svgs/CloseIcon.svelte";

    interface Props {
        open: boolean;
        project: Campaign | null;
        token: string;
        projectSupport?: ProjectSupport;
        onClose: () => void;
    }

    let { open = $bindable(), project, token, projectSupport, onClose }: Props = $props();

    let message = $state("");
    let isSubmitting = $state(false);

    $effect(() => {
        if (projectSupport?.message) {
            message = projectSupport.message;
        }
    });

    async function handleSubmit() {
        if (!projectSupport?.id) return;

        isSubmitting = true;
        try {
            await apiProjectSupportsIdPatch({
                path: { id: projectSupport.id.toString() },
                body: { message },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            onClose();
        } catch (e) {
            console.error("Error updating comment", e);
        } finally {
            isSubmitting = false;
        }
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
</script>

{#if open}
    <!-- Backdrop with transparency -->
    <div
        class="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4"
        onclick={handleBackdropClick}
        role="button"
        tabindex="-1"
    >
        <!-- Modal Content -->
        <div class="w-[800px] p-6 bg-neutral-50 rounded-3xl inline-flex flex-col justify-start items-start gap-8 shadow-xl">
            <!-- Header -->
            <div class="self-stretch inline-flex justify-between items-center">
                <div class="justify-start text-zinc-600 text-2xl font-bold font-['Karla'] leading-8 line-clamp-1">
                    Añade un comentario
                </div>
                <button
                    onclick={onClose}
                    class="w-6 h-6 relative overflow-hidden cursor-pointer hover:opacity-70 transition-opacity"
                    aria-label="Cerrar"
                >
                    <CloseIcon />
                </button>
            </div>

            <!-- Form -->
            <div class="self-stretch flex flex-col justify-start items-start gap-6">
                <!-- Textarea with floating label -->
                <div class="self-stretch h-28 p-4 relative bg-neutral-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-700 flex flex-col justify-start items-start">
                    <textarea
                        bind:value={message}
                        class="self-stretch w-full h-full bg-transparent border-none focus:ring-0 focus:outline-none p-0 text-zinc-600 text-base font-normal font-['Karla'] leading-6 resize-none placeholder:text-zinc-400"
                        placeholder="Lorem ipsum dolor sit amet consectetur adipiscing elit augue..."
                    ></textarea>
                    <div class="h-2 px-1 left-[12px] top-[-4.50px] absolute bg-neutral-50 inline-flex justify-center items-center pointer-events-none">
                        <div class="flex-1 justify-start text-neutral-700 text-sm font-normal font-['Karla'] leading-6">
                            Escribe aquí tu comentario
                        </div>
                    </div>
                </div>

                <!-- Submit button -->
                <div class="self-stretch inline-flex justify-end items-end">
                    <button
                        onclick={handleSubmit}
                        disabled={isSubmitting}
                        class="px-6 py-4 bg-teal-300 rounded-3xl flex justify-center items-center gap-2 hover:bg-teal-400 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <div class="justify-start text-zinc-700 text-base font-bold font-['Karla'] leading-6 line-clamp-1">
                            {isSubmitting ? "Guardando..." : "Añadir comentario"}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}