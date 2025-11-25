<script lang="ts">
    import ShareIcon from "../../svgs/ShareIcon.svelte";
    import WebIcon from "../../svgs/WebIcon.svelte";
    import FacebookIcon from "../../svgs/FacebookIcon.svelte";
    import XIcon from "../../svgs/XIcon.svelte";
    import CodeIcon from "../../svgs/CodeIcon.svelte";
    import { t } from "../../i18n/store";
    import { Modal } from "flowbite-svelte";
    import Tooltip from "../Admin/Tooltip.svelte";
    import type { Project } from "../../openapi/client/index";
    import { onMount } from "svelte";
    import Loader from "../../svgs/Loader.svelte";

    const appId = "184483011630708";

    /* TODO: Implement URL dynamically */
    const iframeCode = `<iframe frameborder="0" height="492px" src="https://www.goteo.org/widget/project/mostra-de-cinema-arab-i-mediterrani-de-catalunya" width="300px" scrolling="no"></iframe>`;

    let { project }: { project: Project } = $props();

    let currentUrl = $state("");
    let fbShareUrl = $state("");
    let openModal = $state(false);
    let iframeModal = $state(false);
    let iframeLoaded = $state(false);
    let copied = $state(false);

    let fbWindow: Window | null = null;

    function openFbPopup() {
        const width = 626;
        const height = 436;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        if (fbWindow && !fbWindow.closed) {
            fbWindow.close();
        }

        fbWindow = window.open(
            fbShareUrl,
            "facebook-share-dialog",
            `width=${width},height=${height},top=${top},left=${left}`,
        );
    }

    $effect(() => {
        if (iframeModal) {
            iframeLoaded = false;
        }
    });

    onMount(() => {
        currentUrl = encodeURIComponent(window.location.href);
        // currentUrl = encodeURIComponent("https://developers.facebook.com/docs/");
        fbShareUrl = `https://www.facebook.com/dialog/share?app_id=${appId}&display=popup&href=${currentUrl}&redirect_uri=${currentUrl}`;
    });
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
    class="bg-white fixed top-1/2 left-1/2 w-full max-w-[475px] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    title={$t("project.share.modal.title")}
    headerClass="py-2 text-secondary text-2xl"
>
    <p>{$t("project.share.modal.description")}</p>

    <div class="flex flex-row items-center justify-center gap-6">
        <Tooltip
            text={$t("contributions.tootip.copied")}
            tooltipClass="bg-secondary -translate-x-[50%]"
            className="cursor-copy shrink-0 w-auto h-auto"
        >
            <button
                class="flex h-23 w-23 items-center justify-center rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
                onclick={() => navigator.clipboard.writeText(window.location.href)}
            >
                <WebIcon />
            </button>
        </Tooltip>
        <!-- TODO: Implement Facebook share popup -->
        <button
            onclick={openFbPopup}
            class="flex h-23 w-23 items-center justify-center rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
        >
            <FacebookIcon />
        </button>

        <a
            href={`https://twitter.com/intent/tweet?url=${currentUrl}&text=${project.title}`}
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-23 w-23 items-center justify-center rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
        >
            <XIcon />
        </a>

        <button
            class="flex h-23 w-23 items-center justify-center rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
            onclick={() => (iframeModal = true)}
        >
            <CodeIcon />
        </button>
    </div>
</Modal>

<Modal
    bind:open={iframeModal}
    closeBtnClass="top-7 end-7 bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent cursor-pointer"
    class="!left-1/2 max-w-[600px] p-4 backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    title={$t("project.share.iframe-modal.title")}
    headerClass="py-2 text-secondary text-2xl"
>
    <p>{$t("project.share.iframe-modal.description")}</p>

    <div class="flex w-full flex-row items-stretch justify-center gap-4">
        <div class="flex w-1/2 items-center justify-center rounded-lg border p-4">
            {#if !iframeLoaded}
                <Loader />
            {/if}
            <iframe
                onload={() => (iframeLoaded = true)}
                src="https://www.goteo.org/widget/project/mostra-de-cinema-arab-i-mediterrani-de-catalunya"
                width="100%"
                height="492px"
                frameborder="0"
                scrolling="no"
                title="Project widget preview"
                class:hidden={!iframeLoaded}
                class="grayscale"
            ></iframe>
        </div>
        <div class="flex w-1/2 rounded-lg border p-4">
            <textarea
                readonly
                class="w-full resize-none border-none focus:ring-0 focus:outline-none"
                rows="4">{iframeCode}</textarea
            >
        </div>
    </div>

    <button
        class="bg-primary text-secondary h-auto w-full cursor-pointer rounded-3xl px-6 py-4 font-bold"
        class:bg-primary={!copied}
        class:bg-variant1={copied}
        onclick={() => {
            navigator.clipboard.writeText(iframeCode);
            copied = true;
            setTimeout(() => (copied = false), 1000);
        }}
    >
        {copied
            ? $t("project.share.iframe-modal.btnCopied")
            : $t("project.share.iframe-modal.btnCopy")}
    </button>
</Modal>
