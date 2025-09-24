<!--- @runes -->
<script lang="ts">
    import BaseCard from "../../../components/BaseCard.svelte";
    import { t } from "../../../i18n/store";
    import { categories } from "../../../utils/categories";
    import { formatCurrency, parseCurrency } from "../../../utils/currencies";
    import TagSelect from "../../../components/TagSelect.svelte";

    let title: string = $state("");
    let description: string = $state("");

    let categoriesSelected: string[] = $state([]);
    const categoriesOptions = categories.map((category) => {
        return { id: category.id, text: $t(category.translationKey) };
    });

    let budget: number = $state(0);
</script>

<section class="wrapper md:flex md:flex-row">
    <div class="flex max-w-[668px] flex-col gap-10">
        <div class="flex flex-col gap-4">
            <h1 class="text-3xl font-bold text-[#3D3D3D] lg:text-4xl">
                {$t("create.project.title")}
            </h1>
            <p class="text-[#3D3D3D] transition-all duration-300 ease-in-out">
                {$t("create.project.subtitle")}
            </p>
        </div>
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-[#3D3D3D]">
                {$t("create.project.description.title")}
            </h2>
            <p class="text-[#3D3D3D] transition-all duration-300 ease-in-out">
                {$t("create.project.description.subtitle")}
            </p>
            <input
                type="text"
                placeholder={$t("create.project.description.titlePrompt")}
                class="w-full rounded-md border border-[#855a96] p-[16px]"
                bind:value={title}
            />
            <textarea
                placeholder={$t("create.project.description.subtitlePrompt")}
                class="h-[240px] w-full resize-none rounded-md border border-[#855a96] p-[16px]"
                bind:value={description}
            ></textarea>
        </div>
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-[#3D3D3D]">
                {$t("create.project.category.title")}
            </h2>
            <p class="text-[#3D3D3D] transition-all duration-300 ease-in-out">
                {$t("create.project.category.subtitle")}
            </p>
            <TagSelect
                max={2}
                options={categoriesOptions}
                onchange={(selected) => (categoriesSelected = selected.map((s) => s.id.toString()))}
            />
        </div>
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-[#3D3D3D]">
                {$t("create.project.budget.title")}
            </h2>
            <p class="text-[#3D3D3D] transition-all duration-300 ease-in-out">
                {$t("create.project.budget.subtitle")}
            </p>
            <input
                type="text"
                placeholder={$t("create.project.budget.amountPrompt")}
                class="w-full rounded-md border border-[#855a96] p-[16px]"
                oninput={(e) => budget = parseCurrency(e.currentTarget.value)}
            />
        </div>
        <p></p>
    </div>
    <div class="ml-auto">
        <BaseCard class="flex h-full max-h-[506px] w-full max-w-[437px] flex-col">
            <h1 class="text-tertiary overflow-hidden text-2xl leading-8 font-bold">
                {title || $t("create.project.description.titlePlaceholder")}
            </h1>
            <p class="text-sm text-[#3D3D3D]">
                {description || $t("create.project.description.subtitlePlaceholder")}
            </p>
            <div class="mt-auto">
                <p class="text-sm text-[#3D3D3D]">{$t("create.project.budgetPreview")}</p>
                <p class="text-secondary text-3xl font-bold">
                    {formatCurrency(budget)}
                </p>
            </div>
        </BaseCard>
    </div>
</section>
