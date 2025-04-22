<script lang="ts">
    import { t } from "../../i18n/store";
    let campaign = "anonymous";
</script>

<div>
    <div class=" sm:w-full sm:max-w-md">
        <form id="register" method="POST" class="flex flex-col gap-4">
            <div class="flex flex-col gap-4">
                <div class="flex flex-row items-center gap-2">
                    <h2 class="text-secondary text-2xl font-bold">
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
                            class="relative h-6 w-6 appearance-none rounded-full border border-[#855a96] after:absolute after:top-1/2 after:left-1/2 after:hidden after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:transform after:rounded-full after:bg-purple-900 after:content-[''] checked:border-teal-400 checked:bg-teal-400 checked:after:block"
                        />
                    </div>
                    <span class="text-gray-700"
                        >{$t("payment.page-aproved.form-goal.options.2")}</span
                    >
                </label>
            </fieldset>

            <div class="flex flex-col gap-4">
                <div class="flex flex-row items-center gap-2">
                    <h2 class="text-secondary text-2xl font-bold">
                        {$t("payment.page-aproved.form-review.title")}
                    </h2>
                </div>
                <p class="text-[#575757]">{$t("payment.page-aproved.form-review.description")}</p>
            </div>

            <div class="relative flex w-full flex-col gap-4">
                <select
                    id="campaign"
                    name="campaign"
                    bind:value={campaign}
                    class="peer w-full appearance-none rounded-md border border-[#855a96] bg-white px-4 pt-6 pb-2 text-base text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-[#855a96] focus:outline-none"
                    required
                >
                    <option value="anonymous">
                        {$t("payment.page-aproved.form-review.labels.anonymous")}
                    </option>
                    <option value="msg">
                        {$t("payment.page-aproved.form-review.labels.leave-a-message")}
                    </option>
                </select>

                <label
                    for="campaign"
                    class="pointer-events-none absolute top-1 left-4 text-[10px] font-medium text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-gray-500"
                >
                    {$t("payment.page-aproved.form-review.labels.name")}:
                </label>

                {#if campaign === "msg"}
                    <textarea
                        id="review-message"
                        class="peer w-full appearance-none rounded-md border border-[#855a96] bg-white p-2 text-base text-gray-700 placeholder-gray-400 focus:ring-[#855a96] focus:outline-none"
                        name="review"
                    ></textarea>
                {/if}
            </div>

            <!-- TODO: Merge with Btn "Continuar" -->
            <button
                class="bg-primary cursor-pointer rounded-3xl px-6 py-4 font-bold text-[#462949]"
                type="submit"
            >
                {$t("register.form.btnSubmit")}</button
            >
        </form>
        <div id="register-error-content" class="mt-4 text-center text-red-500"></div>
    </div>
</div>
