<script lang="ts">
    import { t } from "../../i18n/store";
    import RadioButton from "../library/RadioButton.svelte";

    interface Props {
        paymentMethod?: string;
    }

    let { paymentMethod = undefined }: Props = $props();

    let messageType = $state("anonymous"); // 'anonymous' o 'public'
    let type = $state("organization");
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
                    {$t("payment.page-approved.form-goal.options.2")}
                    <span class="capitalize">{paymentMethod}</span>
                </RadioButton>

                <RadioButton name="type" value="individual" bind:group={type}>
                    {$t("payment.page-approved.form-goal.options.1")}
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

            <fieldset class="flex flex-col gap-6">
                <RadioButton
                    name="messageType"
                    value="anonymous"
                    bind:group={messageType}
                    label="Dejar un mensaje de forma anónima"
                />

                <RadioButton
                    name="messageType"
                    value="public"
                    bind:group={messageType}
                    label="Dejar un mensaje de forma pública"
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
                    placeholder="Escribe tu mensaje de apoyo al impulsor..."
                    rows="4"
                ></textarea>
            </div>

            <!-- TODO: Add Btn "Continuar" -->
        </form>
        <div id="feedback-error-content" class="mt-4 text-center text-red-500"></div>
    </div>
</div>
