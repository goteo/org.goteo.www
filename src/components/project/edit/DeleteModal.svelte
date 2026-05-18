<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import { t } from "../../../i18n/store";
    import Button from "../../library/Button.svelte";

    let {
        open = $bindable(false),
        variant,
        onclick,
    }: {
        open: boolean;
        variant: "rewards" | "collaborations" | "budget";
        onclick: () => void;
    } = $props();
</script>

<Modal
    bind:open
    closeBtnClass="top-3 end-3 cursor-pointer bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 mx-2 flex w-full max-w-178 -translate-x-1/2 -translate-y-1/2 flex-col gap-6 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px] sm:mx-4 lg:mx-0"
    headerClass="md:p-0 p-0"
    bodyClass="md:p-0 p-0"
    footerClass="md:p-0 p-0 flex items-center justify-end gap-4"
>
    {#snippet header()}
        <h2 class="text-xl font-bold text-black">
            {$t(`pages.project.edit.${variant}.deleteModal.title`)}
        </h2>
    {/snippet}
    <p class="text-content text-base font-normal">
        {$t(`pages.project.edit.${variant}.deleteModal.description`)}
    </p>
    {#snippet footer()}
        <Button kind="ghost" onclick={() => (open = false)} class="w-fit"
            >{$t("common.cancel")}</Button
        >
        <Button kind="secondary" onclick={() => onclick()} class="w-fit"
            >{$t("common.delete")}</Button
        >
    {/snippet}
</Modal>
