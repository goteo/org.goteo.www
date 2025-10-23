<script lang="ts">
    import { onDestroy } from "svelte";
    import BaseCard from "../../../components/BaseCard.svelte";
    import { t } from "../../../i18n/store";
    import { categories } from "../../../utils/categories";
    import { formatCurrency } from "../../../utils/currencies";
    import CategorySelect from "../../../components/library/CategorySelect.svelte";
    import Button from "../../../components/library/Button.svelte";
    import {
        draft,
        validationErrors,
        touchedFields,
        isFormValid,
        validateField,
        validateForm,
        markFieldAsTouched,
    } from "./project-draft";
    import type { ProjectDraft } from "./project-draft";
    import TextInput from "../../../components/library/TextInput.svelte";

    const categoriesOptions = categories.map((categories) => {
        return { id: categories.id, text: $t(categories.translationKey) };
    });

    // Track if form has been submitted once (for showing all errors)
    let submitted = false;

    // Debounce timer for real-time validation
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function handleFieldBlur(fieldName: keyof ProjectDraft) {
        markFieldAsTouched(fieldName);
        validateField(fieldName, $draft[fieldName]);
    }

    /**
     * Handles field value changes with type-safe updates.
     * Uses generic typing to ensure type safety without bypassing TypeScript checks.
     */
    function handleFieldChange<K extends keyof ProjectDraft>(fieldName: K, value: ProjectDraft[K]) {
        // Update the draft value with proper typing
        $draft[fieldName] = value;

        // Only validate on change if field has been touched
        if ($touchedFields.has(fieldName) || submitted) {
            // Debounce validation
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                validateField(fieldName, value);
            }, 300);
        }
    }

    // Cleanup debounce timer on component unmount to prevent memory leaks
    onDestroy(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
    });

    function handleCategoryChange(selected: { id: number | string; text: string }[]) {
        const categoryIds = selected.map((s) => s.id.toString());
        handleFieldChange("categories", categoryIds);
    }

    async function handleSubmit() {
        submitted = true;

        // Validate entire form
        const isValid = validateForm();

        if (!isValid) {
            // Focus first invalid field
            const firstError = Object.keys($validationErrors)[0];
            if (firstError) {
                const element = document.querySelector(`[name="${firstError}"]`);
                if (element instanceof HTMLElement) {
                    element.focus();
                }
            }
            return;
        }

        // TODO: Submit to API
        // const { data, error } = await apiProjectsPost({ body: $draft });
        if (import.meta.env.DEV) {
            console.log("Form is valid, submitting:", $draft);
        }
    }

    // Helper to check if field should show error
    function shouldShowError(fieldName: string): boolean {
        return (submitted || $touchedFields.has(fieldName)) && !!$validationErrors[fieldName];
    }

    // Debug logging only in development
    $: if (import.meta.env.DEV) {
        console.log("Form validity debug:", {
            isFormValid: $isFormValid,
            draft: $draft,
            validationErrors: $validationErrors,
            touchedFields: Array.from($touchedFields),
        });
    }

    // Convert Date to YYYY-MM-DD string for date input
    function dateToString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // Calculate minimum date (14 days from now) for date input
    function getMinDateString(): string {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 14);
        return dateToString(minDate);
    }

    // Local variable for date input (HTML date inputs use strings)
    let releaseDateString = dateToString($draft.release);

    // Update draft when date string changes
    function handleDateChange(dateString: string) {
        releaseDateString = dateString;
        // Convert string to Date before updating draft
        const dateValue = new Date(dateString);
        $draft.release = dateValue;

        // Validate the field if it's been touched or form submitted
        if ($touchedFields.has("release") || submitted) {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                validateField("release", dateValue);
            }, 300);
        }
    }
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
                name="title"
                placeholder={$t("create.project.description.titlePrompt")}
                bind:value={$draft.title}
                error={shouldShowError("title") ? $t($validationErrors.title) : undefined}
                onBlur={() => handleFieldBlur("title")}
            />
            <div class="relative">
                <textarea
                    id="subtitle"
                    name="subtitle"
                    placeholder={$t("create.project.description.subtitlePrompt")}
                    class="h-[240px] w-full resize-none rounded-md border p-[16px] {shouldShowError(
                        'subtitle',
                    )
                        ? 'border-red-500'
                        : 'border-[#855a96]'}"
                    bind:value={$draft.subtitle}
                    onblur={() => handleFieldBlur("subtitle")}
                    aria-invalid={shouldShowError("subtitle")}
                    aria-describedby={shouldShowError("subtitle") ? "subtitle-error" : undefined}
                ></textarea>
                {#if shouldShowError("subtitle")}
                    <p id="subtitle-error" class="mt-1 ml-4 text-[12px] text-red-600" role="alert">
                        {$t($validationErrors.subtitle)}
                    </p>
                {/if}
            </div>
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
                onchange={handleCategoryChange}
                error={shouldShowError("categories") ? $t($validationErrors.categories) : undefined}
            />
        </div>
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("create.project.release.title")}
            </h2>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("create.project.release.subtitle")}
            </p>
            <div class="relative">
                <input
                    type="date"
                    id="release"
                    name="release"
                    class="w-full rounded-md border p-[16px] {shouldShowError('release')
                        ? 'border-red-500'
                        : 'border-[#855a96]'}"
                    value={releaseDateString}
                    min={getMinDateString()}
                    oninput={(e) => handleDateChange(e.currentTarget.value)}
                    onblur={() => handleFieldBlur("release")}
                    aria-invalid={shouldShowError("release")}
                    aria-describedby={shouldShowError("release") ? "release-error" : undefined}
                />
                {#if shouldShowError("release")}
                    <p id="release-error" class="mt-1 ml-4 text-[12px] text-red-600" role="alert">
                        {$t($validationErrors.release)}
                    </p>
                {/if}
            </div>
        </div>
        <p>
            <Button size="md" disabled={!$isFormValid} onclick={handleSubmit}>
                {$t("create.project.submit")}
            </Button>
        </p>
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
