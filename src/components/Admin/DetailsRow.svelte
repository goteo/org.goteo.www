<script lang="ts">
    import { t } from "../../i18n/store";
    import ActionsBtn from "./ActionsBtn.svelte";
    import CopyIcon from "../../svgs/CopyIcon.svelte";
    import ContentFooter from "./ContentFooter.svelte";
    import Tooltip from "./Tooltip.svelte";
    import type { Tracking } from "../../../src/openapi/client/index.ts";

    import {
        Modal,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";

    const { id, trackingCodes, dataTime, platformLink, refundToWallet } = $props<{
        id: string;
        trackingCodes: Tracking[];
        dataTime: {
            date: string;
            time: string;
            fulltime: string;
        };
        platformLink: string;
        refundToWallet: string;
    }>();

    let defaultModal = $state(false);

    $effect(() => {
        if (defaultModal) {
            document.body.classList.add("no-scroll");

            const closeBtn = document.querySelector('button[aria-label="Close"]');
            if (closeBtn) {
                closeBtn.removeAttribute("aria-label");

                const span = Array.from(closeBtn.querySelectorAll("span")).find(
                    (el) => el.textContent?.trim() === "Close",
                );
                if (span) span.remove();
            }
        } else {
            document.body.classList.remove("no-scroll");
        }
    });
</script>

<section class="flex flex-col gap-10">
    <div
        class="grid grid-cols-4 gap-x-8 gap-y-8 rounded-md bg-[#fbfafe] p-6 text-[16px] text-[#575757]"
    >
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.operationTime")}</p>
            <span title={dataTime.fulltime}>{dataTime.time}</span>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.trackingCodes.title")}</p>
            <button
                class="text-tertiary flex cursor-pointer items-start truncate whitespace-nowrap underline"
                title={trackingCodes
                    .map((tc: { title: string; value: string }) => tc.value)
                    .join(", ")}
                onclick={() => (defaultModal = true)}
            >
                <span class="truncate">{trackingCodes[0]?.value ?? "—"}</span>
                <span> ({trackingCodes.length})</span>
            </button>

            <Modal
                bind:open={defaultModal}
                closeBtnClass="top-7 end-7 bg-transparent text-[#462949] hover:bg-transparent hover:text-[#462949] hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-[#462949] dark:hover:text-[#462949] dark:hover:bg-transparent"
                class="!left-1/2 max-w-[800px] p-4 backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
                title={$t("contributions.grid.details.trackingCodes.title")}
                headerClass="py-2"
            >
                <Table class="w-full table-fixed border-separate border-spacing-y-2">
                    <TableHead>
                        <TableHeadCell
                            class="bg-secondary rounded-tl-lg rounded-bl-lg py-4 text-base whitespace-nowrap text-white"
                        >
                            {$t("contributions.grid.details.trackingCodes.headers.title")}
                        </TableHeadCell>
                        <TableHeadCell
                            class="bg-secondary rounded-tr-lg rounded-br-lg py-4 text-base whitespace-nowrap text-white"
                        >
                            {$t("contributions.grid.details.trackingCodes.headers.trackingCode")}
                        </TableHeadCell>
                    </TableHead>
                    <TableBody class="text-base">
                        {#each trackingCodes as item}
                            <TableBodyRow class=" bg-[#FBFBFB]">
                                <TableBodyCell
                                    class="rounded-l-md  border-t border-b border-l border-[#E6E5F7]"
                                    >{item.title}</TableBodyCell
                                >
                                <TableBodyCell
                                    class="border-t border-r border-b border-[#E6E5F7] align-top"
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
                                            tooltipClass="bg-[#462949]"
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
            <p class="font-semibold">{$t("contributions.grid.details.platformLink")}</p>
            <p
                class="text-tertiary cursor-pointer truncate overflow-hidden whitespace-nowrap underline"
                title={platformLink}
            >
                {platformLink}
            </p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold">{$t("contributions.grid.details.estimatedFee")}</p>
            <p>-</p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold"></p>
            <p></p>
        </div>
        <div class="flex flex-col gap-1">
            <p class="font-semibold"></p>
            <p></p>
        </div>
    </div>
    <ActionsBtn />
    <ContentFooter {id} />
</section>
