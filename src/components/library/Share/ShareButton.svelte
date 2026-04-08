<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import CopyUrl from "./CopyUrl.svelte";
    import Facebook from "./Facebook.svelte";
    import Iframe from "./Iframe.svelte";
    import X from "./X.svelte";
    import { t } from "../../../i18n/store";
    import ShareIcon from "../../../svgs/ShareIcon.svelte";

    interface Props {
        shareText?: string;
        variant?: "blog" | "project";
        projectSlug?: string;
        url?: string;
    }

    let { shareText = "", variant = "project", projectSlug = "", url = "" }: Props = $props();

    const widgetUrl = $derived(`https://www.goteo.org/widget/project/${projectSlug}`);

    let openModal = $state(false);

    const modalTitle = $derived(
        variant === "blog" ? $t("blog.share.modal.title") : $t("project.share.modal.title"),
    );

    const modalDescription = $derived(
        variant === "blog"
            ? $t("blog.share.modal.description")
            : $t("project.share.modal.description"),
    );
</script>

<button
    onclick={() => (openModal = true)}
    class="text-secondary flex cursor-pointer flex-row items-center gap-2 p-2 font-bold"
>
    <ShareIcon />
    {$t("project.actions.share")}
</button>

<Modal
    bind:open={openModal}
    closeBtnClass="top-7 end-7 bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent cursor-pointer"
    class="fixed top-1/2 left-1/2 w-full max-w-[475px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    title={modalTitle}
    headerClass="py-2 text-secondary text-2xl"
>
    <p>{modalDescription}</p>

    <div class="flex flex-row items-center justify-center gap-6">
        <CopyUrl {url} />
        <Facebook {url} />
        <X text={shareText} {url} />
        {#if variant === "project"}
            <Iframe url={widgetUrl} />
        {/if}
    </div>
</Modal>
