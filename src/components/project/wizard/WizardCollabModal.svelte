<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import Button from "../../library/Button.svelte";

    let { open = $bindable(false) } = $props<{
        open: boolean;
    }>();
</script>

<Modal
    bind:open
    closeBtnClass="top-7 end-7 cursor-pointer bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 flex w-full max-w-225 -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    headerClass="md:p-0 p-0 flex-col gap-4 justify-start items-start"
    bodyClass="md:p-0 p-0"
    footerClass="md:p-0 p-0 flex items-center justify-end gap-4"
>
    {#snippet header()}
        <h2>Añade colaboraciones</h2>
        <p>Indica el tipo de colaboración que necesitas</p>
    {/snippet}
    <input type="text" />
    <textarea name="" id="" placeholder=""></textarea>
    {#snippet footer()}
        <Button kind="primary">Añadir</Button>
    {/snippet}
</Modal>
