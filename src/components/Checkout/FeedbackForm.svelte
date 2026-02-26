<script lang="ts">
    import { t } from "../../i18n/store";
    import { type Project, type ProjectSupport } from "../../openapi/client";
    import RadioButton from "../library/RadioButton.svelte";
    import CommentCard from "./CommentCard.svelte";

    interface Props {
        paymentMethod?: string;
        projects: Project[];
        projectSupports: ProjectSupport[];
        token: string;
    }

    let { paymentMethod = undefined, projects, projectSupports, token }: Props = $props();

    let type = $state<"organization" | "individual">("organization");

    let supports = $state<ProjectSupport[]>(projectSupports);

    let feedbackItems = $derived(() =>
        projects.map((project) => {
            const iri = `/v4/projects/${project.id}`;
            const support = supports?.find((ps) => ps.project === iri);

            return { project, support };
        }),
    );
</script>

<div>
    <div class=" md:w-full md:max-w-[668px]">
        <form id="feedback" method="POST" class="flex flex-col gap-4">
            <div class="flex w-full max-w-md flex-col gap-4">
                <div class="flex flex-row items-center gap-2">
                    <h2 class="text-2xl font-bold text-black">
                        {$t("payment.page-approved.form-goal.title")}
                    </h2>
                </div>
            </div>
            <fieldset class="flex w-full max-w-md flex-col gap-6">
                <RadioButton name="type" value="organization" bind:group={type}>
                    <div class="text-content text-base/6 font-normal">
                        {$t("payment.page-approved.form-goal.options.2")}
                        <span class="capitalize">{paymentMethod}</span>
                    </div>
                </RadioButton>

                <RadioButton name="type" value="individual" bind:group={type}>
                    <div class="text-content flex flex-col text-base/6 font-normal">
                        {$t("payment.page-approved.form-goal.options.1")}
                        <a href="/wallet" class="text-secondary font-bold underline"
                            >{$t("payment.page-approved.form-goal.learnMore")}</a
                        >
                    </div>
                </RadioButton>
            </fieldset>

            <div class="mt-6 flex w-full max-w-[668px] flex-col gap-6">
                <div class="flex w-full max-w-md flex-col gap-4">
                    <h2 class="text-2xl font-bold text-black">
                        {$t("payment.page-approved.form-review.title")}
                    </h2>
                    <p class="text-content">
                        {$t("payment.page-approved.form-review.description")}
                    </p>
                </div>

                <div class="flex flex-col gap-7">
                    {#each feedbackItems() as { project, support }, index}
                        <div class="flex flex-col gap-3">
                            <h1 class="text-lg font-bold text-black">
                                {$t("payment.page-approved.form-review.project")} <a
                                    href={`/project/${project.slug}`}
                                    class="text-secondary underline underline-offset-1"
                                    >{project.title}</a
                                >
                            </h1>
                            <CommentCard
                                {project}
                                {support}
                                {index}
                                {token}
                                onUpdate={(updatedSupport) => {
                                    supports = supports.map((s) =>
                                        s.id === updatedSupport.id ? updatedSupport : s,
                                    );
                                }}
                            />
                        </div>
                    {/each}
                </div>
            </div>
        </form>
        <div id="feedback-error-content" class="mt-4 text-center text-red-500"></div>
    </div>
</div>
