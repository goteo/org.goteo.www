<script lang="ts">
    import { t } from "../../i18n/store";
    import AnnotationIcon from "../../svgs/AnnotationIcon.svelte";
    import EditIcon from "../../svgs/EditIcon.svelte";
    import Button from "../library/Button.svelte";
    import CommentModal from "./CommentModal.svelte";

    let { project, support } = $props();

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
                    >{$t("payment.page-approved.form-review.donatedTo")}</span
                >
                <h3 class="text-secondary text-2xl/8 font-bold">
                    {project.title}
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

<CommentModal bind:open {isAnonymous} {support} />
