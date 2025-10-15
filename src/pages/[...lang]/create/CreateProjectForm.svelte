<script lang="ts">
    import BaseCard from "../../../components/BaseCard.svelte";
    import { t } from "../../../i18n/store";
    import { categories } from "../../../utils/categories";
    import { formatCurrency } from "../../../utils/currencies";
    import CategorySelect from "../../../components/library/CategorySelect.svelte";
    import Button from "../../../components/library/Button.svelte";
    import { draft } from "./project-draft";
    import TextInput from "../../../components/library/TextInput.svelte";

    const categoriesOptions = categories.map((categories) => {
        return { id: categories.id, text: $t(categories.translationKey) };
    });
</script>

<section class="wrapper md:flex md:flex-row">
    <div class="flex max-w-[668px] flex-col gap-10">
        <div class="flex flex-col gap-4">
            <h1 class="text-3xl font-bold text-black lg:text-4xl">
                {$t("create.project.title")}
            </h1>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("create.project.subtitle")}
            </p>
        </div>
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("create.project.description.title")}
            </h2>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("create.project.description.subtitle")}
            </p>
            <TextInput
                placeholder={$t("create.project.description.titlePrompt")}
                bind:value={$draft.title}
            />
            <textarea
                placeholder={$t("create.project.description.subtitlePrompt")}
                class="h-[240px] w-full resize-none rounded-md border border-[#855a96] p-[16px]"
                bind:value={$draft.subtitle}
            ></textarea>
        </div>
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("create.project.categories.title")}
            </h2>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("create.project.categories.subtitle")}
            </p>
            <CategorySelect
                max={2}
                options={categoriesOptions}
                onchange={(selected) => ($draft.categories = selected.map((s) => s.id.toString()))}
            />
        </div>
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("create.project.release.title")}
            </h2>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("create.project.release.subtitle")}
            </p>
            <input
                type="date"
                class="w-full rounded-md border border-[#855a96] p-[16px]"
                bind:value={$draft.release}
            />
        </div>
        <p>
            <Button size="md" onclick={(e) => console.log($draft.release)}>
                {$t("create.project.submit")}
            </Button>
        </p>
        <p></p>
    </div>
    <div class="ml-auto">
        <BaseCard class="flex h-full max-h-[506px] w-full max-w-[437px] flex-col">
            <h1 class="text-secondary text-2xl leading-8 font-bold {$draft.title || 'opacity-50'}">
                {$draft.title || $t("create.project.description.titlePlaceholder")}
            </h1>
            <p class="text-sm text-black">
                {$draft.subtitle || $t("create.project.description.subtitlePlaceholder")}
            </p>
            <div class="mt-auto">
                <p class="text-sm text-black">{$t("create.project.budgetPreview")}</p>
                <p class="text-secondary text-3xl font-bold">
                    {formatCurrency($draft.budget)}
                </p>
            </div>
        </BaseCard>
    </div>
</section>
