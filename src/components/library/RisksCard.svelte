<script lang="ts">
    import { t } from "../../i18n/store";
    import Button from "./Button.svelte";
    import Tag from "./Tag.svelte";

    let {
        riskType,
        riskTier,
        newMessage = false,
    } = $props<{
        riskType: "config" | "info" | "rewards" | "collabs" | "budget" | "about";
        riskTier: "low" | "medium" | "high";
        newMessage?: boolean;
    }>();

    let newMsgCardShadow =
        "0 35px 10px 0 rgba(0, 0, 0, 0.00), 0 22px 9px 0 rgba(0, 0, 0, 0.01), 0 13px 8px 0 rgba(0, 0, 0, 0.05), 0 6px 6px 0 rgba(0, 0, 0, 0.09), 0 1px 3px 0 rgba(0, 0, 0, 0.10)";
    let tagVariant: "success" | "error" | "warning" | "bold" | undefined = $state();

    $effect(() => {
        if (riskTier === "low") tagVariant = "success";
        else if (riskTier === "medium") tagVariant = "warning";
        else if (riskTier === "high") tagVariant = "error";
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
                <h2 class="text-secondary text-2xl font-bold">{$t(`reviews.risks-cards.types.${riskType}.title`)}</h2>
                <!-- TODO: Messages reactivity functionality (new messages + future chatbox logic) -->
                <span class="text-content text-sm/4">32 chats. Última actividad 12/11/2025</span>
            </div>
            <Tag variant={tagVariant}>{$t(`reviews.risks-cards.tags.${riskTier}`)}</Tag>
        </div>
        <p
            class="text-content max-h-24 min-h-24 w-full overflow-hidden text-base overflow-ellipsis"
        >
            {$t(`reviews.risks-cards.types.${riskType}.description.${riskTier}`)}
        </p>
    </div>
    <div class="flex justify-between">
        <!-- TODO: Add functionality to both buttons -->
        <Button kind="ghost">{$t("reviews.btns.seeChat")}</Button>
        <Button kind="secondary">{$t("reviews.btns.changeRisk")}</Button>
    </div>
</article>
