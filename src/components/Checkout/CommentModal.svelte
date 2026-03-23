<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import { t } from "../../i18n/store";
    import Button from "../library/Button.svelte";
    import { apiProjectSupportsIdPatch, type ProjectSupport } from "../../openapi/client";

    interface Props {
        open: boolean;
        isAnonymous: boolean;
        support: ProjectSupport | undefined;
        token: string;
        onSubmit?: (message: string, anonymous: boolean) => void;
    }
    let {
        open = $bindable(false),
        isAnonymous = $bindable(false),
        support,
        token,
        onSubmit,
    }: Props = $props();
    let message = $state("");

    async function handleSubmit() {
        const trimmed = message.trim();
        if (!trimmed || trimmed === support?.message) return;

        const projectSupportPath = String(support?.id ?? "");

        try {
            await apiProjectSupportsIdPatch({
                path: { id: projectSupportPath },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/merge-patch+json",
                },
                body: {
                    anonymous: isAnonymous,
                    message: trimmed,
                },
            });
        } catch (e) {
            console.error("PATCH FAILED", e);
        } finally {
            onSubmit?.(trimmed, isAnonymous);
            open = false;
        }
    }

    $effect(() => {
        if (open) {
            message = support?.message ?? "";
        }
    });
</script>

<Modal
    bind:open
    title={$t("payment.page-approved.form-review.comment-modal.title")}
    closeBtnClass="top-7 end-7 bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 w-full max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    headerClass="self-start p-0 mb-8 text-2xl font-bold text-content text-ellipsis"
    bodyClass="p-0 flex flex-col gap-6"
>
    <div class="mb-0 h-fit p-0">
        <label
            class="relative top-3 left-4 bg-white px-1 text-sm/6 font-normal text-black"
            for="comment">{$t("payment.page-approved.form-review.comment-modal.label")}</label
        >
        <textarea
            class="border-secondary text-content h-[120px] w-full resize-none rounded-lg border bg-white p-4 text-base/6 font-normal"
            id="comment"
            bind:value={message}
            placeholder={$t("payment.page-approved.form-review.comment-modal.label")}
        ></textarea>
    </div>
    <Button onclick={handleSubmit} type={"submit"} class="w-full self-center md:w-fit md:self-end"
        >{$t("payment.page-approved.form-review.comment-modal.btn")}</Button
    >
</Modal>
