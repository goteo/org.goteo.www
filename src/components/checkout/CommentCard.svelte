<script lang="ts">
    import { t } from "../../i18n/store";
    import type { Project, ProjectSupport } from "../../openapi/client";
    import AnnotationIcon from "../icons/status/AnnotationIcon.svelte";
    import EditIcon from "../icons/actions/Edit.svelte";
    import { formatCurrency } from "../../utils/currencies";
    import Button from "../library/buttons/Button.svelte";
    import Checkbox from "../library/inputs/Checkbox.svelte";
    import CommentModal from "./CommentModal.svelte";

    interface Props {
        project: Project;
        support: ProjectSupport | undefined;
        index: number;
        token: string;
        onUpdate?: (support: ProjectSupport) => void;
    }

    let { project, support, index, token, onUpdate }: Props = $props();
    let open = $state(false);
    let isAnonymous = $state(false);
</script>

<article class="border-grey w-full items-center rounded-4xl border bg-white p-6 shadow/10">
    <div class="grid w-full grid-cols-2 gap-6">
        <div class="border-grey overflow-hidden rounded-3xl border">
            <img
                src={project.video?.thumbnail}
                alt={project.title}
                class="h-full w-full object-cover"
            />
        </div>
        <div class="flex flex-col justify-between">
            <div class="flex flex-col gap-1">
                <span class="text-base/6 font-bold text-black"
                    >{$t("pages.checkout.verify.approved.formReview.donated")}</span
                >
                <h3 class="text-secondary text-2xl/8 font-bold">
                    {formatCurrency(support?.money?.amount)}
                </h3>
            </div>
            <Button onclick={() => (open = true)} size={"md"} kind={"secondary"}>
                {#if support?.message}
                    <EditIcon class="size-3.75" />
                    {$t("pages.checkout.verify.approved.formReview.commentBtn.editComment")}
                {:else}
                    <AnnotationIcon class="size-3.75" />
                    {$t("pages.checkout.verify.approved.formReview.commentBtn.leaveComment")}
                {/if}
            </Button>
        </div>
    </div>
</article>
<div class="flex items-center gap-2">
    <Checkbox
        bind:checked={isAnonymous}
        id={`anonymous-toggle-${index}`}
        label={$t("pages.checkout.verify.approved.formReview.anonymous")}
        class="gap-2"
    />
</div>
<CommentModal
    bind:open
    bind:isAnonymous
    {support}
    {token}
    onSubmit={(message, anonymous) => {
        onUpdate?.({
            ...support,
            message,
            anonymous,
        });
    }}
/>