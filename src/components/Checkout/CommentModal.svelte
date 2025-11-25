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
        onCommentUpdated?: (message: string) => void;
    }

    let {
        open = $bindable(),
        project,
        token,
        projectSupport,
        onClose,
        onCommentUpdated,
    }: Props = $props();

    let message = $state("");
    let isSubmitting = $state(false);
    let error = $state<string | null>(null);

    $effect(() => {
        if (projectSupport?.message) {
            message = projectSupport.message;
        } else {
            message = "";
        }
    });

    $effect(() => {
        if (open) {
            error = null;
        }
    });

    async function handleSubmit() {
        if (!projectSupport?.id) {
            error = $t("payment.verify.comment-modal.error.no-support");
            return;
        }

        if (!message.trim()) {
            error = $t("payment.verify.comment-modal.error.empty-message");
            return;
        }

        isSubmitting = true;
        error = null;

        try {
            await apiProjectSupportsIdPatch({
                path: { id: projectSupport.id.toString() },
                body: { message: message.trim() },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (onCommentUpdated) {
                onCommentUpdated(message.trim());
            } else {
                onClose();
            }
        } catch (e) {
            console.error("Error updating comment:", e);
            error = $t("payment.verify.comment-modal.error.update-failed");
        } finally {
            isSubmitting = false;
        }
    }

    function handleBackdropClick(e: MouseEvent | KeyboardEvent) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            onClose();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <!-- Backdrop with transparency -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onclick={handleBackdropClick}
        onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                handleBackdropClick(e);
            }
        }}
        role="button"
        tabindex="-1"
        aria-label={$t("payment.verify.comment-modal.backdrop-label")}
    >
        <!-- Modal Content -->
        <div
            class="bg-background inline-flex w-full max-w-[800px] flex-col items-start justify-start gap-8 rounded-3xl p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            tabindex="0"
            aria-labelledby="modal-title"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
        >
            <!-- Header -->
            <div class="inline-flex items-center justify-between self-stretch">
                <h2
                    id="modal-title"
                    class="text-secondary line-clamp-1 justify-start font-['Karla'] text-2xl leading-8 font-bold"
                >
                    {projectSupport?.message
                        ? $t("payment.verify.comment-modal.title.edit")
                        : $t("payment.verify.comment-modal.title.add")}
                </h2>
                <button
                    type="button"
                    onclick={onClose}
                    class="relative h-6 w-6 cursor-pointer overflow-hidden transition-opacity hover:opacity-70"
                    aria-label={$t("payment.verify.comment-modal.close")}
                >
                    <CloseIcon />
                </button>
            </div>

            <!-- Form -->
            <form
                class="flex flex-col items-start justify-start gap-6 self-stretch"
                onsubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <!-- Textarea with floating label -->
                <div
                    class="bg-background outline-secondary relative flex min-h-28 flex-col items-start justify-start self-stretch rounded-lg p-4 outline outline-1 outline-offset-[-1px]"
                >
                    <textarea
                        id="comment-message"
                        bind:value={message}
                        disabled={isSubmitting}
                        autofocus
                        class="text-content placeholder:text-content/50 h-full min-h-20 w-full resize-none self-stretch border-none bg-transparent p-0 font-['Karla'] text-base leading-6 font-normal focus:ring-0 focus:outline-none disabled:opacity-50"
                        placeholder={$t("payment.verify.comment-modal.placeholder")}
                        aria-label={$t("payment.verify.comment-modal.textarea-label")}
                        aria-describedby={error ? "comment-error" : undefined}
                    ></textarea>

                    <div
                        class="bg-background pointer-events-none absolute top-[-4.50px] left-[12px] inline-flex h-2 items-center justify-center px-1"
                    >
                        <label
                            for="comment-message"
                            class="text-content flex-1 justify-start font-['Karla'] text-sm leading-6 font-normal"
                        >
                            {$t("payment.verify.comment-modal.label")}
                        </label>
                    </div>
                </div>

                <!-- Error message -->
                {#if error}
                    <div
                        id="comment-error"
                        class="border-tertiary/30 bg-tertiary/10 self-stretch rounded-lg border p-4"
                        role="alert"
                        aria-live="polite"
                    >
                        <p class="text-tertiary font-['Karla'] text-sm font-normal">{error}</p>
                    </div>
                {/if}

                <!-- Submit button -->
                <div class="inline-flex items-end justify-end self-stretch">
                    <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        class="bg-primary hover:bg-primary-hover flex cursor-pointer items-center justify-center gap-2 rounded-3xl px-6 py-4 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <span
                            class="text-secondary line-clamp-1 justify-start font-['Karla'] text-base leading-6 font-bold"
                        >
                            {#if isSubmitting}
                                {$t("payment.verify.comment-modal.button.submitting")}
                            {:else if projectSupport?.message}
                                {$t("payment.verify.comment-modal.button.update")}
                            {:else}
                                {$t("payment.verify.comment-modal.button.add")}
                            {/if}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
