<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import { t } from "../../i18n/store";
    import Button from "../library/buttons/Button.svelte";
    import { apiProjectSupportsIdPatch, type ProjectSupport } from "../../openapi/client";
    import TextArea from "../library/inputs/TextArea.svelte";

    interface Props {
        open: boolean;
        isAnonymous: boolean;
        support: ProjectSupport | undefined;
        onSubmit?: (message: string, anonymous: boolean) => void;
    }

    let {
        open = $bindable(false),
        isAnonymous = $bindable(false),
        support,
        onSubmit,
    }: Props = $props();

    let message = $state("");

    async function handleSubmit() {
        const trimmed = message.trim();
        if (!trimmed || trimmed === support?.message) return;

        const projectSupportPath = String(support?.id ?? "");

        try {
            await apiProjectSupportsIdPatch({
                baseUrl: "/api/relay",
                path: { id: projectSupportPath },
                headers: {
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
    title={$t("pages.checkout.verify.approved.formReview.commentModal.title")}
    closeBtnClass="top-7 end-7 bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 w-full max-w-225 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    headerClass="self-start md:px-0 p-0 text-2xl font-bold text-content text-ellipsis border-none"
    bodyClass="p-0 md:p-0 md:pt-1 flex flex-col gap-6 border-none"
>
    <TextArea
        labelText={$t("pages.checkout.verify.approved.formReview.commentModal.label")}
        bind:value={message}
    />
    <Button onclick={handleSubmit} type={"submit"} class="w-full self-center md:w-fit md:self-end">
        {$t("common.save")}
    </Button>
</Modal>
