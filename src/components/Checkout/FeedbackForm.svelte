<script lang="ts">
    import { t } from "../../i18n/store";
    let messageType = "anonymous"; // 'anonymous' o 'public'
</script>

<div>
    <div class=" sm:w-full sm:max-w-md">
        <form id="feedback" method="POST" class="flex flex-col gap-4">
            <div class="flex flex-col gap-4">
                <div class="flex flex-row items-center gap-2">
                    <h2 class="text-2xl font-bold text-black">
                        {$t("payment.page-aproved.form-goal.title")}
                    </h2>
                </div>
            </div>
            <fieldset class="flex flex-col gap-6">
                <label class="flex cursor-pointer items-center gap-2">
                    <div class="w-6">
                        <input
                            type="radio"
                            name="type"
                            value="individual"
                            checked
                            class="relative h-6 w-6 appearance-none rounded-full border border-purple-600 after:absolute after:top-1/2 after:left-1/2 after:hidden after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:transform after:rounded-full after:bg-purple-900 after:content-[''] checked:border-teal-400 checked:bg-teal-400 checked:after:block"
                        />
                    </div>
                    <span class="text-gray-700">
                        {$t("payment.page-aproved.form-goal.options.1")}
                    </span>
                </label>

                <label class="flex cursor-pointer items-center gap-2">
                    <div class="w-6">
                        <input
                            type="radio"
                            name="type"
                            value="organization"
                            class="border-secondary relative h-6 w-6 appearance-none rounded-full border after:absolute after:top-1/2 after:left-1/2 after:hidden after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:transform after:rounded-full after:bg-purple-900 after:content-[''] checked:border-teal-400 checked:bg-teal-400 checked:after:block"
                        />
                    </div>
                    <span class="text-gray-700"
                        >{$t("payment.page-aproved.form-goal.options.2")}</span
                    >
                </label>
            </fieldset>

            <div class="flex flex-col gap-4">
                <div class="flex flex-row items-center gap-2">
                    <h2 class="text-2xl font-bold text-black">
                        {$t("payment.page-aproved.form-review.title")}
                    </h2>
                </div>
                <p class="text-content">{$t("payment.page-aproved.form-review.description")}</p>
            </div>

            <fieldset class="flex flex-col gap-6">
                <label class="flex cursor-pointer items-center gap-2">
                    <div class="w-6">
                        <input
                            type="radio"
                            name="messageType"
                            value="anonymous"
                            bind:group={messageType}
                            class="relative h-6 w-6 appearance-none rounded-full border border-purple-600 after:absolute after:top-1/2 after:left-1/2 after:hidden after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:transform after:rounded-full after:bg-purple-900 after:content-[''] checked:border-teal-400 checked:bg-teal-400 checked:after:block"
                        />
                    </div>
                    <span class="text-gray-700"> Dejar un mensaje de forma anónima </span>
                </label>

                <label class="flex cursor-pointer items-center gap-2">
                    <div class="w-6">
                        <input
                            type="radio"
                            name="messageType"
                            value="public"
                            bind:group={messageType}
                            class="border-secondary relative h-6 w-6 appearance-none rounded-full border after:absolute after:top-1/2 after:left-1/2 after:hidden after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:transform after:rounded-full after:bg-purple-900 after:content-[''] checked:border-teal-400 checked:bg-teal-400 checked:after:block"
                        />
                    </div>
                    <span class="text-gray-700"> Dejar un mensaje de forma pública </span>
                </label>
            </fieldset>

            <div class="flex w-full flex-col gap-2">
                <label for="review-message" class="text-sm font-medium text-gray-700">
                    Mensaje al impulsor (opcional):
                </label>
                <textarea
                    id="review-message"
                    class="border-secondary focus:ring-secondary bg-background w-full appearance-none rounded-md border p-3 text-base text-gray-700 placeholder-gray-400 focus:ring-1 focus:outline-none"
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
