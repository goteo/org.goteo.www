<script lang="ts">
    import { t } from "../../i18n/store";
    import type { Project, ProjectSupport } from "../../openapi/client";
    import AnnotationIcon from "../../svgs/AnnotationIcon.svelte";
    import EditIcon from "../../svgs/EditIcon.svelte";
    import { formatCurrency } from "../../utils/currencies";
    import Button from "../library/Button.svelte";
    import Checkbox from "../library/Checkbox.svelte";
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
                    >{$t("payment.page-approved.form-review.donated")}</span
                >
                <h3 class="text-secondary text-2xl/8 font-bold">
                    {formatCurrency(support?.money?.amount)}
                </h3>
            </div>
            <Button onclick={() => (open = true)} size={"md"} kind={"secondary"}>
                {#if support?.message}
                    <EditIcon class="size-[15px]" />
                    {$t("payment.page-approved.form-review.btn-comment.editComment")}
                {:else}
                    <AnnotationIcon class="size-[16.5px]" />
                    {$t("payment.page-approved.form-review.btn-comment.leaveComment")}
                {/if}
            </Button>
        </div>
    </div>
</article>
<div class="flex items-center gap-2">
    <Checkbox
        bind:checked={isAnonymous}
        id={`anonymous-toggle-${index}`}
        label={"payment.page-approved.form-review.anonymous"}
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
