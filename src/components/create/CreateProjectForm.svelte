<script lang="ts">
    import { onDestroy } from "svelte";

    import { t } from "../../i18n/store";
    import {
        apiProjectsPost,
        apiProjectsIdPatch,
        type Category,
        type ProjectProjectCreationDto,
        type ApiProjectsPostData,
    } from "../../openapi/client";
    import { client } from "../../openapi/client/client.gen";
    import { apiCategoriesIdOrSlugGetUrl } from "../../openapi/client/operation-paths.gen";
    import { maxEndDate } from "../../utils/campaign";
    import { getDefaultCurrency } from "../../utils/consts";
    import { formatCurrency } from "../../utils/currencies";
    import Button from "../library/buttons/Button.svelte";
    import BaseCard from "../library/cards/BaseCard.svelte";
    import CategorySelect from "../library/inputs/CategorySelect.svelte";
    import DateInput from "../library/inputs/DateInput.svelte";
    import TextInput from "../library/inputs/TextInput.svelte";
    import Title from "../library/typography/Title.svelte";
    import TextArea from "../library/inputs/TextArea.svelte";
    import TerritoryInput from "../library/inputs/TerritoryInput.svelte";
    import { twJoin } from "tailwind-merge";
    import type z from "zod";
    import { zProjectProjectCreationDto } from "../../openapi/client/zod.gen";

    let { categories }: { categories: Category[] } = $props();

    let form: ApiProjectsPostData["body"] = $state({
        title: "",
        subtitle: "",
        categories: [],
    });

    let validation: Partial<Record<keyof typeof form, z.core.$ZodIssue[]>> = $state({});

    function validate(field: keyof typeof form) {
        const result = zProjectProjectCreationDto.shape[field].safeParse(form[field]);

        validation[field] = result.error?.issues;
    }

    function getValidationMessage(field: keyof typeof form) {
        const issue = validation[field]?.[0];

        if (!issue) {
            return "";
        }

        if (issue.code === "invalid_format" && field === "title") {
            return $t("pages.project.create.validation.titleBadFormat");
        }

        return $t(`system.validation.${issue.code}`);
    }
</script>

<section class="wrapper md:flex md:flex-row">
    <div class="mb-20 flex max-w-167 flex-col gap-10">
        <div class="flex flex-col gap-4">
            <Title level={1} variant="section">
                {$t("pages.project.create.title")}
            </Title>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("pages.project.create.subtitle")}
            </p>
        </div>

        <div class="flex flex-col gap-4">
            <Title level={2} variant="subsection">
                {$t("pages.project.create.description.title")}
            </Title>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("pages.project.create.description.description")}
            </p>
            <TextInput
                bind:value={form.title}
                onInput={() => validate("title")}
                helperText={$t("pages.project.create.description.titlePrompt")}
                placeholder={$t("pages.project.create.description.titlePlaceholder")}
                error={getValidationMessage("title")}
            />
            <div class="relative">
                <TextArea
                    bind:value={form.subtitle}
                    helperText={$t("pages.project.create.description.subtitlePrompt")}
                    placeholder={$t("pages.project.create.description.subtitlePlaceholder")}
                />
            </div>
        </div>
        <div class="flex flex-col gap-4">
            <Title level={2} variant="subsection">
                {$t("pages.project.create.categories.title")}
            </Title>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("pages.project.create.categories.subtitle")}
            </p>
            <CategorySelect max={2} options={categories} />
        </div>
        <div class="flex flex-col gap-4">
            <Title level={2} variant="subsection">
                {$t("pages.project.create.address.title")}
            </Title>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("pages.project.create.address.subtitle")}
            </p>
            <TerritoryInput placeholder={$t("pages.project.create.address.placeholder")} />
        </div>
        <div class="flex flex-col gap-4">
            <Title level={2} variant="subsection">
                {$t("pages.project.create.release.title")}
            </Title>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("pages.project.create.release.subtitle")}
            </p>
            <DateInput />
        </div>
        <Button>
            {$t("pages.project.create.submit")}
        </Button>
    </div>
    <div class="ml-auto">
        <BaseCard
            class="border-grey flex h-full max-h-126.5 w-full max-w-109.25 flex-col bg-white"
            style="box-shadow: 0 35px 10px 0 rgba(0, 0, 0, 0.00), 0 22px 9px 0 rgba(0, 0, 0, 0.01), 0 13px 8px 0 rgba(0, 0, 0, 0.05), 0 6px 6px 0 rgba(0, 0, 0, 0.09), 0 1px 3px 0 rgba(0, 0, 0, 0.10);"
        >
            <Title
                level={2}
                variant="section"
                color="secondary"
                class={twJoin("mb-2", !form.title && "opacity-24")}
            >
                {form.title || $t("pages.project.create.description.titlePlaceholder")}
            </Title>
            <p
                class="text-content w-full overflow-hidden text-base font-normal text-ellipsis whitespace-nowrap"
            >
                {form.subtitle || $t("pages.project.create.description.subtitlePlaceholder")}
            </p>
        </BaseCard>
    </div>
</section>
