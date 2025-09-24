<!--- @runes -->
<script lang="ts">
    import BaseCard from "../../../components/BaseCard.svelte";
    import Tag from "../../../components/Tag.svelte";
    import { t } from "../../../i18n/store";
    import { formatCurrency } from "../../../utils/currencies";

    let title: string = $state("");
    let description: string = $state("");
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
                class="w-full rounded-md border border-[#855a96]"
                bind:value={title}
            />
            <textarea
                placeholder={$t("create.project.description.subtitlePrompt")}
                class="h-[240px] w-full resize-none rounded-md border border-[#855a96]"
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
            <div class="flex flex-wrap gap-[16px]">
                <Tag>Solidario</Tag>
                <Tag type="active">Generar empleo</Tag>
                <Tag>Crea cultura</Tag>
                <Tag>Periodismo independiente</Tag>
                <Tag>Desde el diseño</Tag>
                <Tag>Educativo</Tag>
                <Tag>Ecológico</Tag>
                <Tag>Salud y cuidados</Tag>
                <Tag>Datos abiertos</Tag>
                <Tag type="active">Igualdad de género</Tag>
                <Tag>Valores democráticos y participación ciudadana</Tag>
            </div>
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
                    {formatCurrency(0)}
                </p>
            </div>
        </BaseCard>
    </div>
</section>
