<script lang="ts">
    import { t } from "../../i18n/store";
    import Button from "../library/buttons/Button.svelte";
    import Tag from "../library/tags/Tag.svelte";
    import Title from "../library/typography/Title.svelte";

    import type { ProjectReviewArea } from "../../openapi/client";

    let {
        review,
        risk,
        newMessage = false,
    }: {
        review: ProjectReviewArea;
        risk: "low" | "mid" | "high";
        newMessage?: boolean;
    } = $props();

    let newMsgCardShadow =
        "0 35px 10px 0 rgba(0, 0, 0, 0.00), 0 22px 9px 0 rgba(0, 0, 0, 0.01), 0 13px 8px 0 rgba(0, 0, 0, 0.05), 0 6px 6px 0 rgba(0, 0, 0, 0.09), 0 1px 3px 0 rgba(0, 0, 0, 0.10)";

    const riskStyles: { [key in "low" | "mid" | "high"]: "success" | "warning" | "error" } = {
        low: "success",
        mid: "warning",
        high: "error",
    };
    let tagVariant: "success" | "warning" | "error" = $state(
        risk ? riskStyles[risk] : review.risk ? riskStyles[review.risk] : "success",
    );

    $effect(() => {
        if (risk) {
            tagVariant = riskStyles[risk];
            return;
        }

        if (review.risk) {
            tagVariant = riskStyles[review.risk];
        }
    });
</script>

<article
    class="border-variant1 bg-purple-soft flex w-full max-w-109.25 flex-col gap-8 rounded-2xl border p-6 {newMessage
        ? `shadow-[${newMsgCardShadow}]`
        : ''}"
>
    <div class="flex flex-col gap-4">
        <div class="flex justify-between">
            <div class="flex flex-col gap-1">
                <!-- TODO: Messages reactivity functionality (new messages styling and handling + future chatbox logic) -->
                {#if newMessage}
                    <Title level={2} variant="subsection" color="secondary">
                        {review.title}
                    </Title>
                    <span class="text-content text-sm/4">32 chats. Última actividad 12/11/2025</span
                    >
                {:else}
                    <Title level={2} variant="subsection" color="secondary">
                        {review.title}
                    </Title>
                    <span class="text-content text-sm/4">32 chats. Última actividad 12/11/2025</span
                    >
                {/if}
            </div>
            <Tag variant={tagVariant}>{$t(`domain.review.risks.${risk ?? review.risk}`)}</Tag>
        </div>
        <p class="text-content line-clamp-4 w-full text-base">
            {review.summary}
        </p>
    </div>
    <div class="flex justify-between">
        <!-- TODO: Add functionality to both buttons -->
        <Button kind="ghost">
            {$t("pages.review.btns.seeChat")}
        </Button>
        <Button kind="secondary">
            {$t("pages.review.btns.changeRisk")}
        </Button>
    </div>
</article>
