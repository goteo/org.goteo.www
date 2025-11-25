<script lang="ts">
    import { t } from "../../i18n/store";
</script>

<div>
    <div class=" sm:w-full sm:max-w-md">
        <form id="goal-feedback" method="POST" class="flex flex-col gap-4">
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
        </form>
    </div>
</div>
