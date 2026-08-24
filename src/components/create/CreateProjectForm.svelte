<script lang="ts">
    import { twJoin } from "tailwind-merge";

    import { t } from "../../i18n/store";
    import { type Category, type ApiProjectsPostData } from "../../openapi/client";
    import { CAMPAIGN_MAX_END_DATE, CAMPAIGN_MIN_START_DATE } from "../../utils/dates";
    import {
        zCreateProjectForm,
        zProjectCampaignRelease,
    } from "../../validation/projectValidation";
    import Button from "../library/buttons/Button.svelte";
    import BaseCard from "../library/cards/BaseCard.svelte";
    import CategorySelect from "../library/inputs/CategorySelect.svelte";
    import DateInput from "../library/inputs/DateInput.svelte";
    import TerritoryInput from "../library/inputs/TerritoryInput.svelte";
    import TextArea from "../library/inputs/TextArea.svelte";
    import TextInput from "../library/inputs/TextInput.svelte";
    import Title from "../library/typography/Title.svelte";

    import type z from "zod";

    let { categories }: { categories: Category[] } = $props();

    let form: ApiProjectsPostData["body"] = $state({
        title: "",
        subtitle: "",
        categories: [],
    });

    let validation: Partial<Record<keyof typeof form, z.core.$ZodIssue[]>> = $state({});
    let isValid = $derived(Object.values(validation).every((issues) => !issues?.length));

    function validate(field: keyof typeof form) {
        const result = zCreateProjectForm.shape[field].safeParse(form[field]);

        validation[field] = result.error?.issues;
    }

    function getValidationMessage(field: keyof typeof form) {
        const issue = validation[field]?.[0];

        if (!issue) {
            return "";
        }

        if (issue.code === "custom") {
            return $t(issue.message, issue.params);
        }

        if (issue.code === "invalid_format" && field === "title") {
            return $t("pages.project.create.validation.titleBadFormat");
        }

        return $t(`system.validation.${issue.code}`);
    }

    function handleRelease(release: Date) {
        form.calendar = { ...form.calendar, release: release.toISOString() };

        const result = zProjectCampaignRelease.safeParse(new Date(release));

        validation["calendar"] = result.error?.issues ?? [];
    }

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();

        validation = {};

        const result = zCreateProjectForm.safeParse(form);

        if (!result.success) {
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof typeof form;

                validation[field] = [...(validation[field] ?? []), issue];
            }

            return;
        }
    }
</script>

<section class="wrapper md:flex md:flex-row">
    <form class="mb-20 flex max-w-167 flex-col gap-10" onsubmit={handleSubmit}>
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
                required
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
            <DateInput
                min={CAMPAIGN_MIN_START_DATE}
                max={CAMPAIGN_MAX_END_DATE}
                value={CAMPAIGN_MIN_START_DATE}
                onInput={handleRelease}
                error={getValidationMessage("calendar")}
            />
        </div>
        <Button type="submit" disabled={!isValid}>
            {$t("pages.project.create.submit")}
        </Button>
    </form>
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
