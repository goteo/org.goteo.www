<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../i18n/store";
    import { apiProjectsGetCollection, apiProjectSupportsGetCollection, type GatewayCharge, type ProjectSupport } from "../../openapi/client";
    import RadioButton from "../library/RadioButton.svelte";

    interface Props {
        paymentMethod?: string;
        charges: GatewayCharge[];
    }

    let { paymentMethod = undefined, charges }: Props = $props();

    let messageType = $state("anonymous"); // 'anonymous' o 'public'
    let type = $state("organization");
    let targetsArr: any[] = [];
    let projectsSupports: ProjectSupport[] = [];

    async function getProjectsSupports(targets: any[]): Promise<ProjectSupport[] | undefined> {
        const projectsResponse = await apiProjectsGetCollection({
            query: { "accounting[]": targets },
            headers: { Accept: "application/ld+json" },
        });

        if (projectsResponse.error) return;

        const projects = projectsResponse.data;

        const projectsSupportsResponse = await apiProjectSupportsGetCollection({
            query: { "project[]": projects },
            headers: { Accept: "application/ld+json" },
        });

        return projectsSupportsResponse.data;
    }

    onMount(async () => {
        if (!charges) return;

        charges.forEach((charge) => {
            targetsArr.push(charge.target);
        });

        projectsSupports = await getProjectsSupports(targetsArr);
    });
</script>

<div>
    <div class=" sm:w-full sm:max-w-md">
        <form id="feedback" method="POST" class="flex flex-col gap-4">
            <div class="flex flex-col gap-4">
                <div class="flex flex-row items-center gap-2">
                    <h2 class="text-2xl font-bold text-black">
                        {$t("payment.page-approved.form-goal.title")}
                    </h2>
                </div>
            </div>
            <fieldset class="flex flex-col gap-6">
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

            <div class="mt-6 flex flex-col gap-4">
                <div class="flex flex-row items-center gap-2">
                    <h2 class="text-2xl font-bold text-black">
                        {$t("payment.page-approved.form-review.title")}
                    </h2>
                </div>
                <p class="text-content">{$t("payment.page-approved.form-review.description")}</p>
            </div>

            <div class="flex flex-col">
                {#each charges as charge}
                    {console.log(charge)}
                    <article>
                        <div>
                            <img src="" alt="" />
                            <div></div>
                        </div>
                    </article>
                {/each}
            </div>

            <!-- <fieldset class="flex flex-col gap-6">
                <RadioButton
                    name="messageType"
                    value="anonymous"
                    bind:group={messageType}
                    label={$t("payment.page-approved.form-review.labels.anonymous")}
                />

                <RadioButton
                    name="messageType"
                    value="public"
                    bind:group={messageType}
                    label={$t("payment.page-approved.form-review.labels.leave-a-message")}
                />
            </fieldset>

            <div class="flex w-full flex-col gap-2">
                <label for="review-message" class="text-sm font-medium text-gray-700">
                    Mensaje al impulsor (opcional):
                </label>
                <textarea
                    id="review-message"
                    class="border-secondary focus:ring-secondary w-full appearance-none rounded-md border bg-white p-3 text-base text-gray-700 placeholder-gray-400 focus:ring-1 focus:outline-none"
                    name="review"
                    placeholder={$t("payment.page-approved.form-review.placeholder")}
                    rows="4"
                ></textarea>
            </div> -->

            <!-- TODO: Add Btn "Continuar" -->
        </form>
        <div id="feedback-error-content" class="mt-4 text-center text-red-500"></div>
    </div>
</div>
