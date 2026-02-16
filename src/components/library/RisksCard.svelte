<script lang="ts">
    import { t } from "../../i18n/store";
    import Button from "./Button.svelte";
    import Tag from "./Tag.svelte";
    import type { ProjectReviewArea } from "../../openapi/client";

    let { review, newMessage = false } = $props<{
        review: ProjectReviewArea;
        newMessage?: boolean;
    }>();

    let newMsgCardShadow =
        "0 35px 10px 0 rgba(0, 0, 0, 0.00), 0 22px 9px 0 rgba(0, 0, 0, 0.01), 0 13px 8px 0 rgba(0, 0, 0, 0.05), 0 6px 6px 0 rgba(0, 0, 0, 0.09), 0 1px 3px 0 rgba(0, 0, 0, 0.10)";
    let tagVariant: any = $state();

    $effect(() => {
        if (review.risk === "low") tagVariant = "success";
        else if (review.risk === "medium") tagVariant = "warning";
        else if (review.risk === "high") tagVariant = "error";
    });
</script>

<article
    class="border-variant1 bg-soft-purple flex w-full max-w-[437px] flex-col gap-8 rounded-2xl border p-6 {newMessage
        ? `shadow-[${newMsgCardShadow}]`
        : ''}"
>
    <div class="flex flex-col gap-4">
        <div class="flex justify-between">
            <div class="flex flex-col gap-1">
                <!-- TODO: Messages reactivity functionality (new messages styling and handling + future chatbox logic) -->
                {#if newMessage}
                    <h2 class="text-secondary text-2xl font-bold">
                        {review.title}
                    </h2>
                    <span class="text-content text-sm/4">32 chats. Última actividad 12/11/2025</span
                    >
                {:else}
                    <h2 class="text-secondary text-2xl font-bold">
                        {review.title}
                    </h2>
                    <span class="text-content text-sm/4">32 chats. Última actividad 12/11/2025</span
                    >
                {/if}
            </div>
            <Tag variant={tagVariant}>{$t(`reviews.risks-cards.tags.${review.risk}`)}</Tag>
        </div>
        <p class="text-content line-clamp-4 w-full text-base">
            {review.summary}
        </p>
    </div>
    <div class="flex justify-between">
        <!-- TODO: Add functionality to both buttons -->
        <Button kind="ghost">{$t("reviews.risks-cards.btns.seeChat")}</Button>
        <Button kind="secondary">{$t("reviews.risks-cards.btns.changeRisk")}</Button>
    </div>
</article>
