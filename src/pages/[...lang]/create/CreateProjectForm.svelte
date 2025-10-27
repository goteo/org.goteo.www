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
    import DateInput from "../../../components/library/DateInput.svelte";
    // import { apiProjectsPost } from "../../../openapi/client"; // TODO: Use when API integration is complete

    const categoriesOptions = categories.map((categories) => {
        return { id: categories.id, text: $t(categories.translationKey) };
    });

    // Track if form has been submitted once (for showing all errors)
    let submitted = false;

    // Loading state for form submission
    let isSubmitting = false;

    // API error message
    let apiError: string | null = null;

    // Success state
    let submitSuccess = false;

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
        apiError = null;

        // Validate entire form
        const isValid = validateForm();

        if (!isValid) {
            // Scroll to error summary
            const errorSummary = document.querySelector('[role="alert"]');
            if (errorSummary) {
                errorSummary.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                // If no error summary, focus first invalid field
                const firstError = Object.keys($validationErrors)[0];
                if (firstError) {
                    const element = document.querySelector(`[name="${firstError}"]`);
                    if (element instanceof HTMLElement) {
                        element.focus();
                    }
                }
            }
            return;
        }

        // Submit to API
        isSubmitting = true;

        try {
            // TODO: Map form fields to API ProjectCreationDto
            // The current form collects: title, subtitle, categories (array), release, budget
            // The API expects: title, subtitle, category (single), territory, description
            // Need to update the form to collect the correct fields or map them appropriately

            // For now, simulate submission in dev mode
            if (import.meta.env.DEV) {
                console.log("Form is valid, would submit:", $draft);
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 1000));
                submitSuccess = true;
            } else {
                // TODO: Implement actual API submission when form fields match API requirements
                /*
                const { data, error } = await apiProjectsPost({
                    body: {
                        title: $draft.title,
                        subtitle: $draft.subtitle,
                        category: $draft.categories[0], // Map first category
                        territory: // Need territory field
                        description: // Need description field
                    },
                });

                if (error) {
                    // Handle API validation errors
                    if ('violations' in error && error.violations) {
                        error.violations.forEach((violation) => {
                            const field = violation.propertyPath as keyof ProjectDraft;
                            if (field) {
                                $validationErrors[field] = violation.message || 'Invalid value';
                            }
                        });
                    } else {
                        apiError = "An unexpected error occurred. Please try again.";
                    }
                } else if (data) {
                    submitSuccess = true;
                    // Redirect to project page
                }
                */
                apiError = "Project creation is not yet fully implemented.";
            }
        } catch (err) {
            // Handle unexpected errors
            apiError = "An unexpected error occurred. Please try again.";
            if (import.meta.env.DEV) {
                console.error("Unexpected error:", err);
            }
        } finally {
            isSubmitting = false;
        }
    }

    // Helper to check if field should show error
    function shouldShowError(fieldName: string): boolean {
        return (submitted || $touchedFields.has(fieldName)) && !!$validationErrors[fieldName];
    }

    // Calculate minimum date (14 days from now) for date input
    function getMinDate(): Date {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 14);
        return minDate;
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
        {#if submitted && Object.keys($validationErrors).length > 0}
            <div
                role="alert"
                aria-live="polite"
                class="rounded-md border-l-4 border-red-500 bg-red-50 p-4"
            >
                <h2 class="mb-2 text-lg font-semibold text-red-800">
                    {$t("validation.errors.summary.title")}
                </h2>
                <ul class="list-inside list-disc space-y-1">
                    {#each Object.entries($validationErrors) as [field, error]}
                        <li class="text-sm text-red-700">
                            <a
                                href={`#${field}`}
                                class="underline hover:text-red-900"
                                onclick={(e) => {
                                    e.preventDefault();
                                    const element = document.querySelector(`[name="${field}"]`);
                                    if (element instanceof HTMLElement) {
                                        element.focus();
                                        element.scrollIntoView({
                                            behavior: "smooth",
                                            block: "center",
                                        });
                                    }
                                }}
                            >
                                {$t(error)}
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
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
            <DateInput
                name="release"
                bind:value={$draft.release}
                min={getMinDate()}
                error={shouldShowError("release") ? $t($validationErrors.release) : undefined}
                onBlur={() => handleFieldBlur("release")}
                onInput={(date) => handleFieldChange("release", date)}
            />
        </div>
        {#if apiError}
            <div role="alert" class="rounded-md border-l-4 border-red-500 bg-red-50 p-4">
                <p class="text-sm text-red-800">{apiError}</p>
            </div>
        {/if}
        {#if submitSuccess}
            <div role="status" class="rounded-md border-l-4 border-green-500 bg-green-50 p-4">
                <p class="text-sm font-semibold text-green-800">
                    Project draft created successfully! (Dev mode simulation)
                </p>
            </div>
        {/if}
        <p>
            <Button size="md" disabled={!$isFormValid || isSubmitting} onclick={handleSubmit}>
                {isSubmitting ? "Submitting..." : $t("create.project.submit")}
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
