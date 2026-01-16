<script lang="ts">
    import { t } from "../../i18n/store";
    import ActionsBtn from "./ActionsBtn.svelte";
    import CopyIcon from "../../svgs/CopyIcon.svelte";
    import ContentFooter from "./ContentFooter.svelte";
    import Tooltip from "./Tooltip.svelte";
    import type { Tracking, Link } from "../../../src/openapi/client/index.ts";

    import {
        Modal,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";

    const { id, trackingCodes, dataTimeCreated, dataTimeUpdated, platformLinks, refundToWallet, concept } =
        $props<{
            id: string;
            trackingCodes: Tracking[];
            dataTimeCreated: {
                date: string;
                time: string;
                fulltime: string;
            };
            dataTimeUpdated: {
                date: string;
                time: string;
                fulltime: string;
            };
            platformLinks: Link[];
            refundToWallet: string;
            concept: string;
        }>();

    let trackingModal = $state(false);
    let linksModal = $state(false);

    function cleanCloseButton() {
        const closeBtn = document.querySelector('button[aria-label="Close"]');
        if (closeBtn) {
            closeBtn.removeAttribute("aria-label");
            closeBtn.querySelectorAll("span").forEach((el) => {
                if (el.textContent?.trim() === "Close") el.remove();
            });
        }
    }

    $effect(() => {
        if (trackingModal || linksModal) {
            document.body.classList.add("no-scroll");
            cleanCloseButton();
        } else {
            document.body.classList.remove("no-scroll");
        }
    });
</script>

<section class="flex flex-col gap-10">
    <div
        class="text-content grid grid-cols-4 gap-x-8 gap-y-8 rounded-md bg-[#fbfafe] p-6 text-[16px]"
    >
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.operationTime")}</p>
            <span title={dataTimeCreated.fulltime}>{dataTimeCreated.time}</span>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.trackingCodes.title")}</p>
            <button
                class="text-secondary flex cursor-pointer items-start truncate whitespace-nowrap underline"
                title={trackingCodes.map((tc: Tracking) => tc.value).join(", ")}
                onclick={() => (trackingModal = true)}
            >
                <span class="truncate">{trackingCodes[0]?.value ?? "—"}</span>
                <span> ({trackingCodes.length})</span>
            </button>

            <Modal
                bind:open={trackingModal}
                closeBtnClass="top-7 end-7 bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
                class="!left-1/2 max-w-[800px] p-4 backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
                title={$t("contributions.grid.details.trackingCodes.title")}
                headerClass="py-2"
            >
                <Table class="w-full table-fixed border-separate border-spacing-y-2">
                    <TableHead>
                        <TableHeadCell
                            class="bg-tertiary rounded-tl-lg rounded-bl-lg py-4 text-base whitespace-nowrap text-white"
                        >
                            {$t("contributions.grid.details.trackingCodes.headers.title")}
                        </TableHeadCell>
                        <TableHeadCell
                            class="bg-tertiary rounded-tr-lg rounded-br-lg py-4 text-base whitespace-nowrap text-white"
                        >
                            {$t("contributions.grid.details.trackingCodes.headers.trackingCode")}
                        </TableHeadCell>
                    </TableHead>
                    <TableBody class="text-base">
                        {#each trackingCodes as item}
                            <TableBodyRow class=" bg-white">
                                <TableBodyCell
                                    class="border-variant1  rounded-l-md border-t border-b border-l"
                                    >{item.title}</TableBodyCell
                                >
                                <TableBodyCell
                                    class="border-variant1 rounded-r-md border-t border-r border-b align-top"
                                >
                                    <div class="flex w-full items-center gap-4">
                                        <div
                                            class="w-full leading-snug break-all whitespace-normal"
                                            style="word-break: break-word;"
                                        >
                                            {item.value}
                                        </div>
                                        <Tooltip
                                            text={$t("contributions.tootip.copied")}
                                            tooltipClass="bg-secondary -translate-x-[90%]"
                                            className="h-[20px] w-[20px] cursor-copy shrink-0"
                                        >
                                            <button
                                                id={`copy-${item.value}`}
                                                type="button"
                                                onclick={() =>
                                                    navigator.clipboard.writeText(item.value)}
                                            >
                                                <CopyIcon />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            </Modal>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.toWallet")}</p>
            <p>{refundToWallet}</p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold"></p>
            <p></p>
        </div>

        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.platformLinks.title")}</p>

            <button
                class="text-secondary flex cursor-pointer items-start truncate whitespace-nowrap underline"
                title={platformLinks
                    .map((pl: Link) => pl.href ?? "")
                    .filter(Boolean)
                    .join(", ")}
                onclick={() => (linksModal = true)}
            >
                <span class="truncate">
                    {platformLinks.find((pl: Link) => pl.type === "payment")?.href ??
                        platformLinks[0]?.href ??
                        "—"}
                </span>
                <span> ({platformLinks.length})</span>
            </button>

            <Modal
                bind:open={linksModal}
                closeBtnClass="top-7 end-7 bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
                class="!left-1/2 max-w-[800px] p-4 backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
                title={$t("contributions.grid.details.platformLinks.title")}
                headerClass="py-2"
            >
                <Table class="w-full table-fixed border-separate border-spacing-y-2">
                    <TableHead>
                        <TableHeadCell
                            class="bg-tertiary rounded-tl-lg rounded-bl-lg py-4 text-base whitespace-nowrap text-white"
                        >
                            {$t("contributions.grid.details.platformLinks.headers.type")}
                        </TableHeadCell>
                        <TableHeadCell
                            class="bg-tertiary border-t-lg border-b-lg py-4 text-base whitespace-nowrap text-white"
                        >
                            {$t("contributions.grid.details.platformLinks.headers.rel")}
                        </TableHeadCell>
                        <TableHeadCell
                            class="bg-tertiary rounded-tr-lg rounded-br-lg py-4 text-base whitespace-nowrap text-white"
                        >
                            {$t("contributions.grid.details.platformLinks.headers.href")}
                        </TableHeadCell>
                    </TableHead>
                    <TableBody class="text-base">
                        {#each platformLinks as item}
                            <TableBodyRow class=" bg-white">
                                <TableBodyCell
                                    class="border-variant1  rounded-l-md border-t border-b border-l"
                                >
                                    {item.type}
                                </TableBodyCell>
                                <TableBodyCell
                                    class="border-variant1  rounded-l-md border-t  border-b"
                                >
                                    {item.rel}
                                </TableBodyCell>
                                <TableBodyCell
                                    class="border-variant1 rounded-r-md border-t border-r border-b align-top"
                                >
                                    <div class="flex w-full items-center gap-4">
                                        <div
                                            class=" w-full cursor-pointer leading-snug break-all whitespace-normal"
                                            style="word-break: break-word; text-decoration-line: underline;"
                                        >
                                            <a
                                                href={item.href}
                                                class=" text-secondary"
                                                target="_blank"
                                                >{item.href}
                                            </a>
                                        </div>
                                        <Tooltip
                                            text={$t("contributions.tootip.copied")}
                                            tooltipClass="bg-secondary"
                                            className="h-[20px] w-[20px] cursor-copy shrink-0"
                                        >
                                            <button
                                                id={`copy-${item.href}`}
                                                type="button"
                                                onclick={() =>
                                                    navigator.clipboard.writeText(item.href)}
                                            >
                                                <CopyIcon />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            </Modal>
        </div>

        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.estimatedFee")}</p>
            <p>—</p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.concept")}</p>
            <p>{concept !== "" ? concept : "—"}</p>
        </div>
    </div>
    <ActionsBtn />
    <ContentFooter {id} />
</section>
